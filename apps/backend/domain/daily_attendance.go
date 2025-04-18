package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type DailyAttendance struct {
    ID             uint             `gorm:"primaryKey"`
    EmployeeID     uint             `gorm:"not null;index"`
    Employee       Employee         `gorm:"foreignKey:EmployeeID"`
    Date           time.Time        `gorm:"type:date;not null;index"`
    Status         enums.AttendanceStatus `gorm:"type:attendance_status;not null"`
    FirstCheckIn   *time.Time       `gorm:"type:timestamp"`
    LastCheckOut   *time.Time       `gorm:"type:timestamp"`
    WorkHours      float64          `gorm:"type:decimal(5,2)"`
    Notes          string           `gorm:"type:text"`
    CreatedAt      time.Time        `gorm:"autoCreateTime"`
}
