package domain

import (
	"time"
)

type Document struct {
	ID         uint      `gorm:"primaryKey"`
	EmployeeID uint      `gorm:"not null"`
	Employee   Employee  `gorm:"foreignKey:EmployeeID"`
	Name       string    `gorm:"type:varchar(255);not null"`
	URL        string    `gorm:"type:varchar(255);not null"`
	CreatedAt  time.Time `gorm:"autoCreateTime;column:created_at"`
	UpdatedAt  time.Time `gorm:"autoUpdateTime;column:updated_at"`
}

func (d *Document) TableName() string {
	return "documents"
}
