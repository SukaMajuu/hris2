package domain

import (
	"fmt"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"time"
)

// WorkSchedule represents the main work schedule entity
type WorkSchedule struct {
	ID        uint                 `gorm:"primaryKey;autoIncrement"`
	Name      string               `gorm:"varchar(100);not null"`
	Type      enums.WorkType       `gorm:"type:varchar(10);not null"` // WFO, WFA, HYBRID
	Details   []WorkScheduleDetail `gorm:"foreignKey:WorkScheduleID;constraint:OnDelete:CASCADE"`
	CreatedAt time.Time            `gorm:"autoCreateTime"`
	UpdatedAt time.Time            `gorm:"autoUpdateTime"`
}

// WorkScheduleDetail represents the daily details of a work schedule
type WorkScheduleDetail struct {
	ID             uint           `gorm:"primaryKey;autoIncrement"`
	WorkScheduleID uint           `gorm:"not null"`
	Day            string         `gorm:"type:varchar(10);not null"` // Monday, Tuesday, etc., ALL
	Type           enums.WorkType `gorm:"type:varchar(10);not null"` // WFO, WFA
	CheckInStart   *time.Time     `gorm:"type:time"`
	CheckInEnd     *time.Time     `gorm:"type:time"`
	BreakStart     *time.Time     `gorm:"type:time"`
	BreakEnd       *time.Time     `gorm:"type:time"`
	CheckOutStart  *time.Time     `gorm:"type:time"`
	CheckOutEnd    *time.Time     `gorm:"type:time"`
	LocationID     *uint          `gorm:""`
	Location       *Location      `gorm:"foreignKey:LocationID"`
}

func (ws *WorkSchedule) TableName() string {
	return "work_schedules"
}

func (wsd *WorkScheduleDetail) TableName() string {
	return "work_schedule_details"
}

func (ws *WorkSchedule) Validate() error {
	if ws == nil {
		return fmt.Errorf("work schedule is nil")
	}
	if ws.Name == "" {
		return fmt.Errorf("name is required")
	}
	if ws.Type == "" {
		return fmt.Errorf("work type is required")
	}
	return nil
}

func (wsd *WorkScheduleDetail) Validate() error {
	if wsd == nil {
		return fmt.Errorf("work schedule detail is nil")
	}

	if wsd.Day == "" {
		return fmt.Errorf("day is required")
	}

	if wsd.Type == "" {
		return fmt.Errorf("work type is required")
	}

	// Additional validations for time fields when provided
	if wsd.CheckInStart != nil && wsd.CheckInEnd != nil {
		if !wsd.CheckInStart.Before(*wsd.CheckInEnd) {
			return fmt.Errorf("check-in start must be before check-in end")
		}
	}

	if wsd.BreakStart != nil && wsd.BreakEnd != nil {
		if !wsd.BreakStart.Before(*wsd.BreakEnd) {
			return fmt.Errorf("break start must be before break end")
		}
	}

	if wsd.CheckOutStart != nil && wsd.CheckOutEnd != nil {
		if !wsd.CheckOutStart.Before(*wsd.CheckOutEnd) {
			return fmt.Errorf("check-out start must be before check-out end")
		}
	}

	// Check that check-in, break, and check-out periods are in sequence if all provided
	if wsd.CheckInEnd != nil && wsd.BreakStart != nil {
		if !wsd.CheckInEnd.Before(*wsd.BreakStart) {
			return fmt.Errorf("check-in end must be before break start")
		}
	}

	if wsd.BreakEnd != nil && wsd.CheckOutStart != nil {
		if !wsd.BreakEnd.Before(*wsd.CheckOutStart) {
			return fmt.Errorf("break end must be before check-out start")
		}
	}

	// For WFO type, a location must be provided
	if wsd.Type == enums.WorkTypeWFO && wsd.LocationID == nil {
		return fmt.Errorf("location is required for WFO work type")
	}

	return nil
}
