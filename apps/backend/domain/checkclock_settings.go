package domain

import (
	"time"
)

type CheckclockSettings struct {
	ID             uint         `gorm:"primaryKey"`
	EmployeeID     uint         `gorm:"not null"`
	Employee       Employee     `gorm:"foreignKey:EmployeeID"`
	WorkScheduleID uint         `gorm:"not null"`
	WorkSchedule   WorkSchedule `gorm:"foreignKey:WorkScheduleID"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (ccs *CheckclockSettings) TableName() string {
	return "checkclock_settings"
}
