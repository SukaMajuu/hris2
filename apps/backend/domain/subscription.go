package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
)

type Subscription struct {
	ID                uint                      `gorm:"primaryKey"`
	AdminUserID       uint                      `gorm:"not null;unique"`
	AdminUser         User                      `gorm:"foreignKey:AdminUserID"`
	SubscriptionPlanID uint                     `gorm:"not null"`
	SubscriptionPlan  SubscriptionPlan          `gorm:"foreignKey:SubscriptionPlanID"`
	SeatPlanID        uint                      `gorm:"not null"`
	SeatPlan          SeatPlan                  `gorm:"foreignKey:SeatPlanID"`
	Status            enums.SubscriptionStatus  `gorm:"type:subscription_status;not null;default:trial"`

	IsTrialUsed       bool                      `gorm:"type:boolean;default:false;not null"`
	TrialStartDate    *time.Time                `gorm:"type:date"`
	TrialEndDate      *time.Time                `gorm:"type:date"`

	StartDate         time.Time                 `gorm:"type:date;not null"`
	EndDate           *time.Time                `gorm:"type:date"`
	NextBillingDate   *time.Time                `gorm:"type:date"`
	IsAutoRenew       bool                      `gorm:"type:boolean;default:true;not null"`
	CurrentEmployeeCount int                    `gorm:"type:int;default:0;not null"`
	CreatedAt         time.Time                 `gorm:"autoCreateTime"`
	UpdatedAt         time.Time                 `gorm:"autoUpdateTime"`
}

func (s *Subscription) TableName() string {
	return "subscriptions"
}

const TrialDurationDays = 14

func (s *Subscription) IsInTrial() bool {
	if s.Status != enums.StatusTrial || s.TrialEndDate == nil {
		return false
	}
	return time.Now().Before(*s.TrialEndDate)
}

func (s *Subscription) IsTrialExpired() bool {
	if s.TrialEndDate == nil {
		return false
	}
	return time.Now().After(*s.TrialEndDate) && s.Status == enums.StatusTrial
}

func (s *Subscription) RemainingTrialDays() int {
	if !s.IsInTrial() {
		return 0
	}

	now := time.Now()
	remaining := s.TrialEndDate.Sub(now)
	days := int(remaining.Hours() / 24)
	if days < 0 {
		return 0
	}
	return days
}

func (s *Subscription) StartTrial() {
	now := time.Now()
	trialEnd := now.AddDate(0, 0, TrialDurationDays)

	s.Status = enums.StatusTrial
	s.TrialStartDate = &now
	s.TrialEndDate = &trialEnd
	s.IsTrialUsed = true
	s.StartDate = now
}

func (s *Subscription) ConvertFromTrial() {
	if s.Status == enums.StatusTrial {
		s.Status = enums.StatusActive

		now := time.Now()
		nextBillingDate := now.AddDate(0, 1, 0)

		s.NextBillingDate = &nextBillingDate
	}
}

func (s *Subscription) ConvertFromTrialToPaid(isMonthly bool) {
	if s.Status == enums.StatusTrial {
		s.Status = enums.StatusActive

		now := time.Now()
		var nextBillingDate time.Time

		if isMonthly {
			nextBillingDate = now.AddDate(0, 1, 0)
		} else {
			nextBillingDate = now.AddDate(1, 0, 0)
		}

		s.NextBillingDate = &nextBillingDate
	}
}

func (s *Subscription) ConvertFromTrialWithCheckoutSession(checkoutAmount decimal.Decimal) {
	if s.Status == enums.StatusTrial && s.SeatPlan.ID != 0 {
		s.Status = enums.StatusActive

		now := time.Now()
		var nextBillingDate time.Time

		if checkoutAmount.Equal(s.SeatPlan.PricePerMonth) {
			nextBillingDate = now.AddDate(0, 1, 0)
		} else if checkoutAmount.Equal(s.SeatPlan.PricePerYear) {
			nextBillingDate = now.AddDate(1, 0, 0)
		} else {
			nextBillingDate = now.AddDate(0, 1, 0)
		}

		s.NextBillingDate = &nextBillingDate
	}
}
