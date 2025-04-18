package domain

import (
	"time"
)

type OvertimeRate struct {
    ID             uint         `gorm:"primaryKey"`
    OvertimeTypeID uint         `gorm:"not null;index"`
    OvertimeType   OvertimeType `gorm:"foreignKey:OvertimeTypeID"`
    HoursThreshold float64      `gorm:"type:decimal(5,2);not null"`
    Multiplier     float64      `gorm:"type:decimal(3,2);not null"`
    CreatedAt      time.Time    `gorm:"autoCreateTime"`
    UpdatedAt      time.Time    `gorm:"autoUpdateTime"`
}
