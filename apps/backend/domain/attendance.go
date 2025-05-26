package domain

import (
	"time"
)

type AttendanceStatus string

const (
	OnTime     AttendanceStatus = "on_time"
	Late       AttendanceStatus = "late"
	EarlyLeave AttendanceStatus = "early_leave"
	Absent     AttendanceStatus = "absent"
	Leave      AttendanceStatus = "leave"
)

type Attendance struct {
	ID             uint             `gorm:"primaryKey"`
	EmployeeID     uint             `gorm:"not null"`
	Employee       Employee         `gorm:"foreignKey:EmployeeID"`
	WorkScheduleID uint             `gorm:"not null"`
	WorkSchedule   WorkSchedule     `gorm:"foreignKey:WorkScheduleID"`
	Date           time.Time        `gorm:"type:date;not null"`
	CheckIn        *time.Time       `gorm:"type:timestamp;not null"`
	CheckOut       *time.Time       `gorm:"type:timestamp;not null"`
	CheckInLat     *float64         `gorm:"type:float"`
	CheckInLong    *float64         `gorm:"type:float"`
	WorkHours      *float64         `gorm:"type:float"`
	Status         AttendanceStatus `gorm:"type:attendance_status;not null;default:on_time"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (a *Attendance) TableName() string {
	return "attendances"
}
