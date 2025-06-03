package domain

import (
	"time"
)

type SubscriptionFeature struct {
	ID          uint      `gorm:"primaryKey"`
	Code        string    `gorm:"type:varchar(100);not null;unique"`
	Name        string    `gorm:"type:varchar(255);not null"`
	Description string    `gorm:"type:varchar(500)"`
	IsActive    bool      `gorm:"type:boolean;default:true;not null"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}

func (sf *SubscriptionFeature) TableName() string {
	return "subscription_features"
}

type SubscriptionPlanFeature struct {
	ID                    uint                `gorm:"primaryKey"`
	SubscriptionPlanID    uint                `gorm:"not null"`
	SubscriptionFeatureID uint                `gorm:"not null"`
	SubscriptionFeature   SubscriptionFeature `gorm:"foreignKey:SubscriptionFeatureID"`
	IsEnabled             bool                `gorm:"type:boolean;default:true;not null"`
	CreatedAt             time.Time           `gorm:"autoCreateTime"`
	UpdatedAt             time.Time           `gorm:"autoUpdateTime"`
}

func (spf *SubscriptionPlanFeature) TableName() string {
	return "subscription_plan_features"
}
