package dto

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"time"
)

type CreateWorkScheduleRequest struct {
	Name          string         `json:"name" validate:"required"`
	WorkType      enums.WorkType `json:"workType" validate:"required"`
	CheckInStart  time.Time      `json:"checkInStart" validate:"required"`
	CheckInEnd    time.Time      `json:"checkInEnd" validate:"required"`
	BreakStart    time.Time      `json:"breakStart" validate:"required"`
	BreakEnd      time.Time      `json:"breakEnd" validate:"required"`
	CheckOutStart time.Time      `json:"checkOutStart" validate:"required"`
	CheckOutEnd   time.Time      `json:"checkOutEnd" validate:"required"`
}

type UpdateWorkScheduleRequest struct {
	Name          string         `json:"name" validate:"required"`
	WorkType      enums.WorkType `json:"workType" validate:"required"`
	CheckInStart  time.Time      `json:"checkInStart" validate:"required"`
	CheckInEnd    time.Time      `json:"checkInEnd" validate:"required"`
	BreakStart    time.Time      `json:"breakStart" validate:"required"`
	BreakEnd      time.Time      `json:"breakEnd" validate:"required"`
	CheckOutStart time.Time      `json:"checkOutStart" validate:"required"`
	CheckOutEnd   time.Time      `json:"checkOutEnd" validate:"required"`
}

type WorkScheduleResponse struct {
	ID            uint           `json:"id"`
	Name          string         `json:"name"`
	WorkType      enums.WorkType `json:"workType"`
	CheckInStart  time.Time      `json:"checkInStart"`
	CheckInEnd    time.Time      `json:"checkInEnd"`
	BreakStart    time.Time      `json:"breakStart"`
	BreakEnd      time.Time      `json:"breakEnd"`
	CheckOutStart time.Time      `json:"checkOutStart"`
	CheckOutEnd   time.Time      `json:"checkOutEnd"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
}
