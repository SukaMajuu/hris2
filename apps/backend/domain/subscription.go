package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
)

type Subscription struct {
	ID                 uint                     `gorm:"primaryKey"`
	AdminUserID        uint                     `gorm:"not null;unique"`
	AdminUser          User                     `gorm:"foreignKey:AdminUserID"`
	SubscriptionPlanID uint                     `gorm:"not null"`
	SubscriptionPlan   SubscriptionPlan         `gorm:"foreignKey:SubscriptionPlanID"`
	SeatPlanID         uint                     `gorm:"not null"`
	SeatPlan           SeatPlan                 `gorm:"foreignKey:SeatPlanID"`
	Status             enums.SubscriptionStatus `gorm:"type:subscription_status;not null;default:trial"`

	IsTrialUsed    bool       `gorm:"type:boolean;default:false;not null"`
	TrialStartDate *time.Time `gorm:"type:date"`
	TrialEndDate   *time.Time `gorm:"type:date"`

	StartDate            time.Time  `gorm:"type:date;not null"`
	EndDate              *time.Time `gorm:"type:date"`
	NextBillingDate      *time.Time `gorm:"type:date"`
	IsAutoRenew          bool       `gorm:"type:boolean;default:true;not null"`
	CurrentEmployeeCount int        `gorm:"type:int;default:0;not null"`
	CreatedAt            time.Time  `gorm:"autoCreateTime"`
	UpdatedAt            time.Time  `gorm:"autoUpdateTime"`
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
	now := time.Now().UTC()
	trialEndDate := now.AddDate(0, 0, 14) // 14 days trial
	s.TrialEndDate = &trialEndDate
	s.Status = enums.StatusTrial
}

func (s *Subscription) ConvertFromTrial() {
	now := time.Now().UTC()
	// Remove trial end date when converting
	s.TrialEndDate = nil
	s.Status = enums.StatusActive
	s.StartDate = now
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

func (s *Subscription) ConvertFromTrialWithCheckoutSession(amountPaid decimal.Decimal) {
	now := time.Now().UTC()
	var endDate time.Time

	// Determine subscription period based on amount
	// This is a simplified logic - you might want to improve this
	if amountPaid.Cmp(decimal.NewFromInt(100000)) <= 0 {
		// Monthly subscription
		endDate = now.AddDate(0, 1, 0)
	} else {
		// Yearly subscription
		endDate = now.AddDate(1, 0, 0)
	}

	s.TrialEndDate = nil
	s.Status = enums.StatusActive
	s.StartDate = now
	s.EndDate = &endDate
	s.NextBillingDate = &endDate
}

func (s *Subscription) Activate() {
	now := time.Now().UTC()
	s.Status = enums.StatusActive
	s.StartDate = now
}
