package domain

import (
	"time"
)

type Department struct {
    ID          uint      `gorm:"primaryKey"`
    Name        string    `gorm:"type:varchar(255);not null;unique"`
    Description string    `gorm:"type:text"`
    Active      bool      `gorm:"not null;default:true"`
    CreatedAt   time.Time `gorm:"autoCreateTime"`
    UpdatedAt   time.Time `gorm:"autoUpdateTime"`
}
