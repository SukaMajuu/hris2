package domain

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"time"
)

type WorkSchedule struct {
	ID            uint           `gorm:"primaryKey"`
	Name          string         `gorm:"varchar(50);not null"`
	WorkType      enums.WorkType `gorm:"type:work_type;not null"`
	CheckInStart  time.Time      `gorm:"not null"`
	CheckInEnd    time.Time      `gorm:"not null"`
	BreakStart    time.Time      `gorm:"not null"`
	BreakEnd      time.Time      `gorm:"not null"`
	CheckOutStart time.Time      `gorm:"not null"`
	CheckOutEnd   time.Time      `gorm:"not null"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (ws *WorkSchedule) TableName() string {
	return "work_schedules"
}
