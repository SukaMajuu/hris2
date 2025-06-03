package domain

import "time"

type Branch struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string    `gorm:"type:varchar(255);not null;unique"`
	HrID      uint      `gorm:"not null;index"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (a *Branch) TableName() string {
	return "branches"
}
