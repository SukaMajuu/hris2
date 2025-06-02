package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type SubscriptionPlan struct {
	ID          uint                          `gorm:"primaryKey"`
	PlanType    enums.SubscriptionPlanType    `gorm:"type:subscription_plan_type;not null;unique"`
	Name        string                        `gorm:"type:varchar(100);not null"`
	Description string                        `gorm:"type:varchar(500)"`
	Features    string                        `gorm:"type:text"`
	IsActive    bool                          `gorm:"type:boolean;default:true;not null"`
	CreatedAt   time.Time                     `gorm:"autoCreateTime"`
	UpdatedAt   time.Time                     `gorm:"autoUpdateTime"`
}

func (sp *SubscriptionPlan) TableName() string {
	return "subscription_plans"
}
