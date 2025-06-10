package attendance

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type ListAttendanceRequestQuery struct {
	Page       int    `form:"page" binding:"omitempty,min=1"`
	PageSize   int    `form:"page_size" binding:"omitempty,min=1,max=10000"`
	EmployeeID *uint  `form:"employee_id" binding:"omitempty"`
	Date       string `form:"date" binding:"omitempty"`
	Month      string `form:"month" binding:"omitempty"`
	Year       string `form:"year" binding:"omitempty"`
}

type CreateAttendanceRequestDTO struct {
	EmployeeID     uint     `json:"employee_id" binding:"required"`
	WorkScheduleID uint     `json:"work_schedule_id" binding:"required"`
	Date           string   `json:"date" binding:"required"`
	ClockIn        *string  `json:"clock_in" binding:"required"`
	ClockOut       *string  `json:"clock_out" binding:"required"`
	ClockInLat     *float64 `json:"clock_in_lat" binding:"omitempty"`
	ClockInLong    *float64 `json:"clock_in_long" binding:"omitempty"`
	ClockOutLat    *float64 `json:"clock_out_lat" binding:"omitempty"`
	ClockOutLong   *float64 `json:"clock_out_long" binding:"omitempty"`
	Status         *string  `json:"status" binding:"omitempty,oneof=on_time late early_leave absent leave"`
}

type UpdateAttendanceRequestDTO struct {
	WorkScheduleID *uint    `json:"work_schedule_id" binding:"omitempty"`
	Date           *string  `json:"date" binding:"omitempty"`
	ClockIn        *string  `json:"clock_in" binding:"required"`
	ClockOut       *string  `json:"clock_out" binding:"required"`
	ClockInLat     *float64 `json:"clock_in_lat" binding:"omitempty"`
	ClockInLong    *float64 `json:"clock_in_long" binding:"omitempty"`
	ClockOutLat    *float64 `json:"clock_out_lat" binding:"omitempty"`
	ClockOutLong   *float64 `json:"clock_out_long" binding:"omitempty"`
	WorkHours      *float64 `json:"work_hours" binding:"omitempty"`
	Status         *string  `json:"status" binding:"omitempty,oneof=on_time late early_leave absent leave"`
}

type ClockInRequestDTO struct {
	EmployeeID     uint    `json:"employee_id" binding:"required"`
	WorkScheduleID uint    `json:"work_schedule_id" binding:"required"`
	Date           string  `json:"date" binding:"required"`
	ClockIn        string  `json:"clock_in" binding:"required"`
	ClockInLat     float64 `json:"clock_in_lat" binding:"omitempty"`
	ClockInLong    float64 `json:"clock_in_long" binding:"omitempty"`
}

type ClockOutRequestDTO struct {
	EmployeeID   uint    `json:"employee_id" binding:"required"`
	Date         string  `json:"date" binding:"required"`
	ClockOut     string  `json:"clock_out" binding:"required"`
	ClockOutLat  float64 `json:"clock_out_lat" binding:"omitempty"`
	ClockOutLong float64 `json:"clock_out_long" binding:"omitempty"`
}

func (dto *CreateAttendanceRequestDTO) ToDomainAttendance() *domain.Attendance {
	attendance := &domain.Attendance{
		EmployeeID:   dto.EmployeeID,
		ClockInLat:   dto.ClockInLat,
		ClockInLong:  dto.ClockInLong,
		ClockOutLat:  dto.ClockOutLat,
		ClockOutLong: dto.ClockOutLong,
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
			// Combine the parsed date with the parsed time
			if !attendance.Date.IsZero() {
				clockInDateTime := time.Date(attendance.Date.Year(), attendance.Date.Month(), attendance.Date.Day(),
					parsedTime.Hour(), parsedTime.Minute(), parsedTime.Second(), 0, attendance.Date.Location())
				attendance.ClockIn = &clockInDateTime
			} else {
				// If no date is set, log the error instead of silently ignoring
				return nil
			}
		}
	}

	// Parse clock out time
	if dto.ClockOut != nil && *dto.ClockOut != "" {
		if parsedTime, err := time.Parse("15:04:05", *dto.ClockOut); err == nil {
			// Combine the parsed date with the parsed time
			if !attendance.Date.IsZero() {
				clockOutDateTime := time.Date(attendance.Date.Year(), attendance.Date.Month(), attendance.Date.Day(),
					parsedTime.Hour(), parsedTime.Minute(), parsedTime.Second(), 0, attendance.Date.Location())
				attendance.ClockOut = &clockOutDateTime
			} else {
				// If no date is set, log the error instead of silently ignoring
				return nil
			}
		}
	}
	// Set status
	if dto.Status != nil {
		attendance.Status = domain.AttendanceStatus(*dto.Status)
	}

	return attendance
}
