package domain

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"time"
	"fmt"
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

func (ws *WorkSchedule) Validate() error {
    if ws == nil {
        return fmt.Errorf("work schedule is nil")
    }
    if ws.Name == "" {
        return fmt.Errorf("name is required")
    }
    if !ws.CheckInStart.Before(ws.CheckInEnd) {
        return fmt.Errorf("check-in start must be before check-in end")
    }
    if !ws.BreakStart.Before(ws.BreakEnd) {
        return fmt.Errorf("break start must be before break end")
    }
    if !ws.CheckOutStart.Before(ws.CheckOutEnd) {
        return fmt.Errorf("check-out start must be before check-out end")
    }
    if !ws.CheckInEnd.Before(ws.BreakStart) {
        return fmt.Errorf("check-in end must be before break start")
    }
    if !ws.BreakEnd.Before(ws.CheckOutStart) {
        return fmt.Errorf("break end must be before check-out start")
    }
    return nil
}