package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type Payment struct {
    ID              uint          `gorm:"primaryKey"`
    BillingCycleID  uint          `gorm:"not null"`
    BillingCycle    BillingCycle  `gorm:"foreignKey:BillingCycleID"`
    Amount          float64       `gorm:"type:decimal(12,2);not null"`
    PaymentMethod   string        `gorm:"type:varchar(255);not null"`
    PaymentReference string        `gorm:"type:varchar(255)"`
    PaymentDate     time.Time     `gorm:"type:date;not null"`
    Status          enums.PaymentStatus `gorm:"type:payment_status;default:'pending'"`
    CreatedBy       uint          `gorm:"not null"`
    CreatedByUser   User          `gorm:"foreignKey:CreatedBy"`
    CreatedAt       time.Time     `gorm:"autoCreateTime"`
}
