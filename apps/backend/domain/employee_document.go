package domain

import (
	"time"
)

type EmployeeDocument struct {
    ID         uint           `gorm:"primaryKey"`
    EmployeeID uint           `gorm:"not null"`
    Employee   Employee       `gorm:"foreignKey:EmployeeID"`
    Title      string         `gorm:"type:varchar(255);not null"`
    DocumentURL string         `gorm:"type:varchar(255)"`
    CreatedBy  *uint          `gorm:""`
    CreatedByUser User        `gorm:"foreignKey:CreatedBy"`
    CreatedAt  time.Time      `gorm:"autoCreateTime"`
    UpdatedAt  time.Time      `gorm:"autoUpdateTime"`
}
