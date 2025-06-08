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
)

type Attendance struct {
	ID           uint             `gorm:"primaryKey"`
	EmployeeID   uint             `gorm:"not null"`
	Employee     Employee         `gorm:"foreignKey:EmployeeID"`
	Date         time.Time        `gorm:"type:date;not null"`
	ClockIn      *time.Time       `gorm:"type:timestamp"`
	ClockOut     *time.Time       `gorm:"type:timestamp"`
	ClockInLat   *float64         `gorm:"type:float"`
	ClockInLong  *float64         `gorm:"type:float"`
	ClockOutLat  *float64         `gorm:"type:float"`
	ClockOutLong *float64         `gorm:"type:float"`
	WorkHours    *float64         `gorm:"type:float"`
	Status       AttendanceStatus `gorm:"type:attendance_status;not null;default:on_time"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (a *Attendance) TableName() string {
	return "attendances"
}
