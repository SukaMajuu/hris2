package domain

import (
	"time"
)

type CheckClockSettings struct {
	ID             uint         `gorm:"primaryKey"`
	EmployeeID     uint         `gorm:"not null"`
	Employee       Employee     `gorm:"foreignKey:EmployeeID"`
	LocationID     uint         `gorm:"not null"`
	Location       Location     `gorm:"foreignKey:LocationID"`
	WorkScheduleID uint         `gorm:"not null"`
	WorkSchedule   WorkSchedule `gorm:"foreignKey:WorkScheduleID"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (ccs *CheckClockSettings) TableName() string {
	return "check_clock_settings"
}
