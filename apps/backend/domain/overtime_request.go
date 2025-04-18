package domain

import (
	"time"
)

type OvertimeRequest struct {
    ID                   uint         `gorm:"primaryKey"`
    EmployeeID           uint         `gorm:"not null;index"`
    Employee             Employee     `gorm:"foreignKey:EmployeeID"`
    OvertimeTypeID       uint         `gorm:"not null;index"`
    OvertimeType         OvertimeType `gorm:"foreignKey:OvertimeTypeID"`
    Date                 time.Time    `gorm:"type:date;not null;index"`
    StartTime            time.Time    `gorm:"type:timestamp;not null"`
    EndTime              time.Time    `gorm:"type:timestamp;not null"`
    Hours                float64      `gorm:"type:decimal(5,2);not null"`
    EstimatedCompensation float64      `gorm:"type:decimal(12,2)"`
    Reason               string       `gorm:"type:text"`
    CreatedBy            uint         `gorm:"not null"`
    CreatedByUser        User         `gorm:"foreignKey:CreatedBy"`
    CreatedAt            time.Time    `gorm:"autoCreateTime"`
    UpdatedAt            time.Time    `gorm:"autoUpdateTime"`
}
