package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
)

type PaymentTransaction struct {
	ID                 uint                  `gorm:"primaryKey"`
	SubscriptionID     uint                  `gorm:"not null"`
	Subscription       Subscription          `gorm:"foreignKey:SubscriptionID"`
	XenditInvoiceID    *string               `gorm:"type:varchar(255)"`
	XenditPaymentID    *string               `gorm:"type:varchar(255)"`
	XenditExternalID   string                `gorm:"type:varchar(255);not null;unique"`
	Amount             decimal.Decimal       `gorm:"type:decimal(10,2);not null"`
	Currency           string                `gorm:"type:varchar(3);not null;default:IDR"`
	Status             enums.PaymentStatus   `gorm:"type:payment_status;not null;default:pending"`
	PaymentMethod      *string               `gorm:"type:varchar(100)"`
	Description        string                `gorm:"type:varchar(500)"`
	PaidAt             *time.Time            `gorm:"type:timestamp"`
	ExpiryDate         *time.Time            `gorm:"type:timestamp"`
	XenditResponse     *string               `gorm:"type:text"`
	FailureReason      *string               `gorm:"type:varchar(500)"`
	CreatedAt          time.Time             `gorm:"autoCreateTime"`
	UpdatedAt          time.Time             `gorm:"autoUpdateTime"`
}

func (pt *PaymentTransaction) TableName() string {
	return "payment_transactions"
}
