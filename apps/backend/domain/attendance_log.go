package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type AttendanceLog struct {
    ID                uint             `gorm:"primaryKey"`
    EmployeeID        uint             `gorm:"not null;index"`
    Employee          Employee         `gorm:"foreignKey:EmployeeID"`
    EventType         enums.EventType        `gorm:"type:event_type;not null"`
    Timestamp         time.Time        `gorm:"not null;index"`
    WorkArrangementID uint             `gorm:"not null"`
    WorkArrangement   WorkArrangement  `gorm:"foreignKey:WorkArrangementID"`
    IPAddress         string           `gorm:"type:varchar(255)"`
    Notes            string           `gorm:"type:text"`
    CreatedAt        time.Time        `gorm:"autoCreateTime"`
}
