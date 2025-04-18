package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type BillingCycle struct {
    ID            uint          `gorm:"primaryKey"`
    PeriodName    string        `gorm:"type:varchar(255);not null"`
    StartDate     time.Time     `gorm:"type:date;not null"`
    EndDate       time.Time     `gorm:"type:date;not null"`
    EmployeeCount int           `gorm:"not null"`
    Amount        float64       `gorm:"type:decimal(12,2);not null"`
    Status        enums.BillingStatus `gorm:"type:billing_status;default:'unpaid'"`
    CreatedAt     time.Time     `gorm:"autoCreateTime"`
    UpdatedAt     time.Time     `gorm:"autoUpdateTime"`
}
