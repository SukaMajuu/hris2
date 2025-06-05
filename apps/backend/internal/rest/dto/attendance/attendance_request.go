package attendance

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type ListAttendanceRequestQuery struct {
	Page       int    `form:"page" binding:"omitempty,min=1"`
	PageSize   int    `form:"page_size" binding:"omitempty,min=1,max=100"`
	EmployeeID *uint  `form:"employee_id" binding:"omitempty"`
	Date       string `form:"date" binding:"omitempty"`
	Month      string `form:"month" binding:"omitempty"`
	Year       string `form:"year" binding:"omitempty"`
}

type CreateAttendanceRequestDTO struct {
	EmployeeID     uint     `json:"employee_id" binding:"required"`
	WorkScheduleID uint     `json:"work_schedule_id" binding:"required"`
	Date           string   `json:"date" binding:"required"`
	ClockIn        *string  `json:"clock_in" binding:"omitempty"`
	ClockOut       *string  `json:"clock_out" binding:"omitempty"`
	CheckInLat     *float64 `json:"check_in_lat" binding:"omitempty"`
	CheckInLong    *float64 `json:"check_in_long" binding:"omitempty"`
	CheckOutLat    *float64 `json:"check_out_lat" binding:"omitempty"`
	CheckOutLong   *float64 `json:"check_out_long" binding:"omitempty"`
	Status         *string  `json:"status" binding:"omitempty,oneof=on_time late early_leave absent"`
}

type UpdateAttendanceRequestDTO struct {
	WorkScheduleID *uint    `json:"work_schedule_id" binding:"omitempty"`
	Date           *string  `json:"date" binding:"omitempty"`
	ClockIn        *string  `json:"clock_in" binding:"omitempty"`
	ClockOut       *string  `json:"clock_out" binding:"omitempty"`
	CheckInLat     *float64 `json:"check_in_lat" binding:"omitempty"`
	CheckInLong    *float64 `json:"check_in_long" binding:"omitempty"`
	CheckOutLat    *float64 `json:"check_out_lat" binding:"omitempty"`
	CheckOutLong   *float64 `json:"check_out_long" binding:"omitempty"`
	WorkHours      *float64 `json:"work_hours" binding:"omitempty"`
	Status         *string  `json:"status" binding:"omitempty,oneof=on_time late early_leave absent"`
}

type CheckInRequestDTO struct {
	EmployeeID     uint    `json:"employee_id" binding:"required"`
	WorkScheduleID uint    `json:"work_schedule_id" binding:"required"`
	Date           string  `json:"date" binding:"omitempty"`
	ClockIn        string  `json:"clock_in" binding:"omitempty"`
	CheckInLat     float64 `json:"check_in_lat" binding:"required"`
	CheckInLong    float64 `json:"check_in_long" binding:"required"`
}

type CheckOutRequestDTO struct {
	EmployeeID   uint    `json:"employee_id" binding:"required"`
	Date         string  `json:"date" binding:"omitempty"`
	ClockOut     string  `json:"clock_out" binding:"omitempty"`
	CheckOutLat  float64 `json:"check_out_lat" binding:"required"`
	CheckOutLong float64 `json:"check_out_long" binding:"required"`
}

func (dto *CreateAttendanceRequestDTO) ToDomainAttendance() *domain.Attendance {
	attendance := &domain.Attendance{
		EmployeeID:     dto.EmployeeID,
		WorkScheduleID: dto.WorkScheduleID,
		CheckInLat:     dto.CheckInLat,
		CheckInLong:    dto.CheckInLong,
		CheckOutLat:    dto.CheckOutLat,
		CheckOutLong:   dto.CheckOutLong,
	}

	// Parse date
	if dto.Date != "" {
		if parsedDate, err := time.Parse("2006-01-02", dto.Date); err == nil {
			attendance.Date = parsedDate
		}
	}

	// Parse clock in time
	if dto.ClockIn != nil && *dto.ClockIn != "" {
		if parsedTime, err := time.Parse("15:04:05", *dto.ClockIn); err == nil {
			attendance.ClockIn = &parsedTime
		}
	}

	// Parse clock out time
	if dto.ClockOut != nil && *dto.ClockOut != "" {
		if parsedTime, err := time.Parse("15:04:05", *dto.ClockOut); err == nil {
			attendance.ClockOut = &parsedTime
		}
	}
	// Set status
	if dto.Status != nil {
		attendance.Status = domain.AttendanceStatus(*dto.Status)
	}

	return attendance
}
