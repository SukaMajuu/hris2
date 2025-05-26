package domain

import (
	"time"
)

type Location struct {
	ID            uint    `gorm:"primaryKey"`
	Name          string  `gorm:"type:varchar(100);not null"`
	AddressDetail string  `gorm:"type:text"`
	Latitude      float64 `gorm:"not null"`
	Longitude     float64 `gorm:"not null"`
	RadiusM       int     `gorm:"not null"` // radius dalam meter

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (l *Location) TableName() string {
	return "locations"
}
