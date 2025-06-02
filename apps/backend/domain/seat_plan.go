package domain

import (
	"time"

	"github.com/shopspring/decimal"
)

type SeatPlan struct {
	ID                  uint            `gorm:"primaryKey"`
	SubscriptionPlanID  uint            `gorm:"not null"`
	SubscriptionPlan    SubscriptionPlan `gorm:"foreignKey:SubscriptionPlanID"`
	SizeTierID          string          `gorm:"type:varchar(50);not null"`
	MinEmployees        int             `gorm:"type:int;not null"`
	MaxEmployees        int             `gorm:"type:int;not null"`
	PricePerMonth       decimal.Decimal `gorm:"type:decimal(10,2);not null"`
	PricePerYear        decimal.Decimal `gorm:"type:decimal(10,2)"`
	IsActive            bool            `gorm:"type:boolean;default:true;not null"`
	CreatedAt           time.Time       `gorm:"autoCreateTime"`
	UpdatedAt           time.Time       `gorm:"autoUpdateTime"`
}

func (sp *SeatPlan) TableName() string {
	return "seat_plans"
}
