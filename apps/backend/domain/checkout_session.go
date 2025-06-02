package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
)

type CheckoutSession struct {
	ID                 uint                     `gorm:"primaryKey"`
	SessionID          string                   `gorm:"type:varchar(255);not null;unique"`
	UserID             uint                     `gorm:"not null"`
	User               User                     `gorm:"foreignKey:UserID"`

	SubscriptionPlanID uint                     `gorm:"not null"`
	SubscriptionPlan   SubscriptionPlan         `gorm:"foreignKey:SubscriptionPlanID"`
	SeatPlanID         uint                     `gorm:"not null"`
	SeatPlan           SeatPlan                 `gorm:"foreignKey:SeatPlanID"`

	IsTrialCheckout    bool                     `gorm:"type:boolean;default:true;not null"`
	Amount             decimal.Decimal          `gorm:"type:decimal(10,2);not null"`
	Currency           string                   `gorm:"type:varchar(3);not null;default:IDR"`
	Status             enums.CheckoutStatus     `gorm:"type:checkout_status;not null;default:initiated"`

	XenditInvoiceID    *string                  `gorm:"type:varchar(255)"`
	XenditInvoiceURL   *string                  `gorm:"type:varchar(500)"`
	XenditExternalID   *string                  `gorm:"type:varchar(255)"`

	InitiatedAt        time.Time                `gorm:"type:timestamp;not null"`
	CompletedAt        *time.Time               `gorm:"type:timestamp"`
	ExpiresAt          *time.Time               `gorm:"type:timestamp"`

	SubscriptionID     *uint                    `gorm:"type:uint"`
	Subscription       *Subscription            `gorm:"foreignKey:SubscriptionID"`
	PaymentTransactionID *uint                  `gorm:"type:uint"`
	PaymentTransaction *PaymentTransaction      `gorm:"foreignKey:PaymentTransactionID"`

	CreatedAt          time.Time                `gorm:"autoCreateTime"`
	UpdatedAt          time.Time                `gorm:"autoUpdateTime"`
}

func (cs *CheckoutSession) TableName() string {
	return "checkout_sessions"
}

// Helper methods
func (cs *CheckoutSession) IsExpired() bool {
	if cs.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*cs.ExpiresAt)
}

func (cs *CheckoutSession) MarkAsCompleted(subscriptionID uint, paymentTransactionID *uint) {
	now := time.Now()
	cs.Status = enums.CheckoutCompleted
	cs.CompletedAt = &now
	cs.SubscriptionID = &subscriptionID
	cs.PaymentTransactionID = paymentTransactionID
}

func (cs *CheckoutSession) MarkAsFailed() {
	cs.Status = enums.CheckoutFailed
}

func (cs *CheckoutSession) SetXenditInfo(invoiceID, invoiceURL, externalID string) {
	cs.XenditInvoiceID = &invoiceID
	cs.XenditInvoiceURL = &invoiceURL
	cs.XenditExternalID = &externalID
	cs.Status = enums.CheckoutPending
}
