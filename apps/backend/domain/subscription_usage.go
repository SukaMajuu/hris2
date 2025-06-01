package domain

import (
	"time"
)

type SubscriptionUsage struct {
	ID                   uint         `gorm:"primaryKey"`
	SubscriptionID       uint         `gorm:"not null"`
	Subscription         Subscription `gorm:"foreignKey:SubscriptionID"`
	EmployeeCount        int          `gorm:"type:int;not null;default:0"`
	ActiveEmployeeCount  int          `gorm:"type:int;not null;default:0"`
	RecordedAt           time.Time    `gorm:"type:timestamp;not null"`
	CreatedAt            time.Time    `gorm:"autoCreateTime"`
}

func (su *SubscriptionUsage) TableName() string {
	return "subscription_usages"
}
