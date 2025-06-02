package domain

import (
	"time"
)

type CustomerBillingInfo struct {
	ID             uint   `gorm:"primaryKey"`
	SubscriptionID uint   `gorm:"not null;unique"`
	Subscription   Subscription `gorm:"foreignKey:SubscriptionID"`

	CompanyName    string  `gorm:"type:varchar(255);not null"`
	CompanyAddress string  `gorm:"type:text;not null"`
	CompanyPhone   *string `gorm:"type:varchar(20)"`
	CompanyEmail   string  `gorm:"type:varchar(255);not null"`
	TaxNumber      *string `gorm:"type:varchar(50)"`

	BillingContactName  string  `gorm:"type:varchar(255);not null"`
	BillingContactEmail string  `gorm:"type:varchar(255);not null"`
	BillingContactPhone *string `gorm:"type:varchar(20)"`

	BankName          *string `gorm:"type:varchar(100)"`
	BankAccountNumber *string `gorm:"type:varchar(100)"`
	BankAccountHolder *string `gorm:"type:varchar(255)"`

	XenditCustomerID *string `gorm:"type:varchar(255)"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (cbi *CustomerBillingInfo) TableName() string {
	return "customer_billing_infos"
}
