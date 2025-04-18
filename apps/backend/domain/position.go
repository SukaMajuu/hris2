package domain

import (
	"time"
)

type Position struct {
    ID           uint       `gorm:"primaryKey"`
    Name         string     `gorm:"type:varchar(255);not null"`
    DepartmentID uint       `gorm:"not null"`
    Department   Department `gorm:"foreignKey:DepartmentID"`
    CreatedAt    time.Time  `gorm:"autoCreateTime"`
    UpdatedAt    time.Time  `gorm:"autoUpdateTime"`
}
