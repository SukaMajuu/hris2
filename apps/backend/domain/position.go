package domain

import (
	"time"
)

type Position struct {
    ID           uint       `gorm:"primaryKey"`
    Name         string     `gorm:"type:varchar(255);not null"`
    CreatedAt    time.Time  `gorm:"autoCreateTime"`
    UpdatedAt    time.Time  `gorm:"autoUpdateTime"`
}

func (a *Position) TableName() string {
	return "positions"
}
