package attendance

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	employeedto "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	workscheduledto "github.com/SukaMajuu/hris/apps/backend/domain/dto/work_schedule"
)

type AttendanceResponseDTO struct {
	ID             uint                                     `json:"id"`
	EmployeeID     uint                                     `json:"employee_id"`
	Employee       *employeedto.EmployeeResponseDTO         `json:"employee,omitempty"`
	WorkScheduleID uint                                     `json:"work_schedule_id"`
	WorkSchedule   *workscheduledto.WorkScheduleResponseDTO `json:"work_schedule,omitempty"`
	Date           string                                   `json:"date"`
	ClockIn        *string                                  `json:"clock_in"`
	ClockOut       *string                                  `json:"clock_out"`
	ClockInLat     *float64                                 `json:"clock_in_lat"`
	ClockInLong    *float64                                 `json:"clock_in_long"`
	ClockOutLat    *float64                                 `json:"clock_out_lat"`
	ClockOutLong   *float64                                 `json:"clock_out_long"`
	WorkHours      *float64                                 `json:"work_hours"`
	Status         string                                   `json:"status"`
	CreatedAt      time.Time                                `json:"created_at"`
	UpdatedAt      time.Time                                `json:"updated_at"`
}

type AttendanceListResponseData struct {
	Items      []*AttendanceResponseDTO `json:"items"`
	Pagination domain.Pagination        `json:"pagination"`
}

type AttendanceSummaryResponseDTO struct {
	TotalDays    int     `json:"total_days"`
	PresentDays  int     `json:"present_days"`
	LateDays     int     `json:"late_days"`
	AbsentDays   int     `json:"absent_days"`
	LeaveDays    int     `json:"leave_days"`
	TotalHours   float64 `json:"total_hours"`
	AverageHours float64 `json:"average_hours"`
}

func NewAttendanceResponseDTO(attendance *domain.Attendance) *AttendanceResponseDTO {
	dto := &AttendanceResponseDTO{
		ID:             attendance.ID,
		EmployeeID:     attendance.EmployeeID,
		WorkScheduleID: *attendance.Employee.WorkScheduleID,
		Date:           attendance.Date.Format("2006-01-02"),
		ClockInLat:     attendance.ClockInLat,
		ClockInLong:    attendance.ClockInLong,
		ClockOutLat:    attendance.ClockOutLat,
		ClockOutLong:   attendance.ClockOutLong,
		WorkHours:      attendance.WorkHours,
		Status:         string(attendance.Status),
		CreatedAt:      attendance.CreatedAt,
		UpdatedAt:      attendance.UpdatedAt,
	}

	// Format clock in time
	if attendance.ClockIn != nil {
		clockInStr := attendance.ClockIn.Format("15:04:05")
		dto.ClockIn = &clockInStr
	}

	// Format clock out time
	if attendance.ClockOut != nil {
		clockOutStr := attendance.ClockOut.Format("15:04:05")
		dto.ClockOut = &clockOutStr
	}

	// Add employee info if loaded
	if attendance.Employee.ID != 0 {
		dto.Employee = &employeedto.EmployeeResponseDTO{
			ID:           attendance.Employee.ID,
			FirstName:    attendance.Employee.FirstName,
			LastName:     attendance.Employee.LastName,
			EmployeeCode: attendance.Employee.EmployeeCode,
			PositionName: attendance.Employee.PositionName,
		}
	}
	// Add work schedule info if loaded
	if attendance.Employee.WorkScheduleID != nil {
		dto.WorkSchedule = &workscheduledto.WorkScheduleResponseDTO{
			ID:       *attendance.Employee.WorkScheduleID,
			Name:     attendance.Employee.WorkSchedule.Name,
			WorkType: string(attendance.Employee.WorkSchedule.WorkType),
		}
	}

	return dto
}

func NewAttendanceListResponseData(attendances []*domain.Attendance, totalItems int64, currentPage, pageSize int) *AttendanceListResponseData {
	attendanceDTOs := make([]*AttendanceResponseDTO, len(attendances))
	for i, attendance := range attendances {
		attendanceDTOs[i] = NewAttendanceResponseDTO(attendance)
	}

	totalPages := 0
	if pageSize > 0 {
		totalPages = int((totalItems + int64(pageSize) - 1) / int64(pageSize))
	}
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	return &AttendanceListResponseData{
		Items: attendanceDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: currentPage,
			PageSize:    pageSize,
			HasNextPage: currentPage*pageSize < int(totalItems),
			HasPrevPage: currentPage > 1,
		},
	}
}

// ToAttendanceResponseDTO converts a domain Attendance to a response DTO
func ToAttendanceResponseDTO(attendance *domain.Attendance) *AttendanceResponseDTO {
	if attendance == nil {
		return nil
	}
	return NewAttendanceResponseDTO(attendance)
}

// ToAttendanceListResponseData converts domain attendances to list response DTO
func ToAttendanceListResponseData(attendances []*domain.Attendance, totalItems int64, currentPage, pageSize int) *AttendanceListResponseData {
	return NewAttendanceListResponseData(attendances, totalItems, currentPage, pageSize)
}

// NewAttendanceResponseDTOWithoutRelations creates DTO without loading related entities
func NewAttendanceResponseDTOWithoutRelations(attendance *domain.Attendance) *AttendanceResponseDTO {
	dto := &AttendanceResponseDTO{
		ID:             attendance.ID,
		EmployeeID:     attendance.EmployeeID,
		WorkScheduleID: *attendance.Employee.WorkScheduleID,
		Date:           attendance.Date.Format("2006-01-02"),
		ClockInLat:     attendance.ClockInLat,
		ClockInLong:    attendance.ClockInLong,
		ClockOutLat:    attendance.ClockOutLat,
		ClockOutLong:   attendance.ClockOutLong,
		WorkHours:      attendance.WorkHours,
		Status:         string(attendance.Status),
		CreatedAt:      attendance.CreatedAt,
		UpdatedAt:      attendance.UpdatedAt,
	}

	// Format clock in time
	if attendance.ClockIn != nil {
		clockInStr := attendance.ClockIn.Format("15:04:05")
		dto.ClockIn = &clockInStr
	}

	// Format clock out time
	if attendance.ClockOut != nil {
		clockOutStr := attendance.ClockOut.Format("15:04:05")
		dto.ClockOut = &clockOutStr
	}

	return dto
}

// NewAttendanceSummaryResponseDTO creates a summary response DTO
func NewAttendanceSummaryResponseDTO(attendances []*domain.Attendance) *AttendanceSummaryResponseDTO {
	summary := &AttendanceSummaryResponseDTO{
		TotalDays: len(attendances),
	}

	var totalHours float64
	for _, attendance := range attendances {
		switch attendance.Status {
		case domain.OnTime:
			summary.PresentDays++
		case domain.Late:
			summary.LateDays++
		case domain.Absent:
			summary.AbsentDays++
		case domain.EarlyLeave:
			summary.PresentDays++ // Count early leave as present but different status
		}

		if attendance.WorkHours != nil {
			totalHours += *attendance.WorkHours
		}
	}

	summary.TotalHours = totalHours
	if summary.PresentDays+summary.LateDays > 0 {
		summary.AverageHours = totalHours / float64(summary.PresentDays+summary.LateDays)
	}

	return summary
}

// FormatTimeToString formats time pointer to string
func FormatTimeToString(t *time.Time, layout string) *string {
	if t == nil {
		return nil
	}
	formatted := t.Format(layout)
	return &formatted
}

// FormatDateToString formats date to string
func FormatDateToString(t time.Time, layout string) string {
	return t.Format(layout)
}

// IsValidAttendanceStatus checks if status is valid
func IsValidAttendanceStatus(status string) bool {
	validStatuses := []string{
		string(domain.OnTime),
		string(domain.Late),
		string(domain.EarlyLeave),
		string(domain.Absent),
	}

	for _, validStatus := range validStatuses {
		if status == validStatus {
			return true
		}
	}
	return false
}

// CalculateWorkDuration calculates work duration in hours
func CalculateWorkDuration(clockIn, clockOut *time.Time) *float64 {
	if clockIn == nil || clockOut == nil {
		return nil
	}
	duration := clockOut.Sub(*clockIn)
	hours := duration.Hours()
	return &hours
}

// GetStatusDisplayName returns user-friendly status name
func GetStatusDisplayName(status domain.AttendanceStatus) string {
	switch status {
	case domain.OnTime:
		return "On Time"
	case domain.Late:
		return "Late"
	case domain.EarlyLeave:
		return "Early Leave"
	case domain.Absent:
		return "Absent"
	default:
		return "Unknown"
	}
}

// GetAttendanceStatistics calculates statistics for a list of attendances
func GetAttendanceStatistics(attendances []*domain.Attendance) map[string]interface{} {
	stats := make(map[string]interface{})

	var onTimeCount, lateCount, earlyLeaveCount, absentCount, leaveCount int
	var totalWorkHours float64
	var workingDays int

	for _, attendance := range attendances {
		switch attendance.Status {
		case domain.OnTime:
			onTimeCount++
			workingDays++
		case domain.Late:
			lateCount++
			workingDays++
		case domain.EarlyLeave:
			earlyLeaveCount++
			workingDays++
		case domain.Absent:
			absentCount++
		}

		if attendance.WorkHours != nil {
			totalWorkHours += *attendance.WorkHours
		}
	}

	stats["total_days"] = len(attendances)
	stats["on_time_count"] = onTimeCount
	stats["late_count"] = lateCount
	stats["early_leave_count"] = earlyLeaveCount
	stats["absent_count"] = absentCount
	stats["leave_count"] = leaveCount
	stats["working_days"] = workingDays
	stats["total_work_hours"] = totalWorkHours
	if workingDays > 0 {
		stats["average_work_hours"] = totalWorkHours / float64(workingDays)
		stats["attendance_rate"] = float64(onTimeCount) / float64(workingDays) * 100

		// Calculate punctuality rate only if there are on-time or late records
		if onTimeCount+lateCount > 0 {
			stats["punctuality_rate"] = float64(onTimeCount) / float64(onTimeCount+lateCount) * 100
		} else {
			stats["punctuality_rate"] = 0.0
		}
	} else {
		stats["average_work_hours"] = 0.0
		stats["attendance_rate"] = 0.0
		stats["punctuality_rate"] = 0.0
	}

	return stats
}
