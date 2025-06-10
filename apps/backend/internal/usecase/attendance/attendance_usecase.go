package attendance

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	responseAttendance "github.com/SukaMajuu/hris/apps/backend/domain/dto/attendance" // Alias for response DTO
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	dtoAttendance "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/attendance" // Alias for request DTO
	"gorm.io/gorm"
)

type AttendanceUseCase struct {
	attendanceRepo   interfaces.AttendanceRepository
	employeeRepo     interfaces.EmployeeRepository
	workScheduleRepo interfaces.WorkScheduleRepository
	leaveRequestRepo interfaces.LeaveRequestRepository
}

func NewAttendanceUseCase(
	attendanceRepo interfaces.AttendanceRepository,
	employeeRepo interfaces.EmployeeRepository,
	workScheduleRepo interfaces.WorkScheduleRepository,
	leaveRequestRepo interfaces.LeaveRequestRepository,
) *AttendanceUseCase {
	return &AttendanceUseCase{
		attendanceRepo:   attendanceRepo,
		employeeRepo:     employeeRepo,
		workScheduleRepo: workScheduleRepo,
		leaveRequestRepo: leaveRequestRepo,
	}
}

func (uc *AttendanceUseCase) Create(ctx context.Context, reqDTO *dtoAttendance.CreateAttendanceRequestDTO) (*responseAttendance.AttendanceResponseDTO, error) {
	// Validate EmployeeID
	_, err := uc.employeeRepo.GetByID(ctx, reqDTO.EmployeeID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("employee with ID %d not found", reqDTO.EmployeeID)
		}
		return nil, fmt.Errorf("failed to validate employee: %w", err)
	}

	// Validate WorkScheduleID
	// Assuming GetByIDWithDetails is the correct method name in your WorkScheduleRepository interface
	_, err = uc.workScheduleRepo.GetByIDWithDetails(ctx, reqDTO.WorkScheduleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("work schedule with ID %d not found", reqDTO.WorkScheduleID)
		}
		return nil, fmt.Errorf("failed to validate work schedule: %w", err)
	}

	// Check if attendance already exists for this employee and date
	parsedDate, err := time.Parse("2006-01-02", reqDTO.Date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %w", err)
	}
	_, err = uc.attendanceRepo.GetByEmployeeAndDate(ctx, reqDTO.EmployeeID, parsedDate.Format("2006-01-02"))
	if err == nil {
		return nil, fmt.Errorf("attendance record already exists for employee %d on %s", reqDTO.EmployeeID, reqDTO.Date)
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing attendance: %w", err)
	}

	attendance := reqDTO.ToDomainAttendance() // Convert DTO to domain model
	// Calculate work hours if both clock in and out are provided
	if attendance.ClockIn != nil && attendance.ClockOut != nil {
		attendance.WorkHours = calculateWorkHours(attendance.ClockIn, attendance.ClockOut)
	}

	// Set default status if not provided
	if attendance.Status == "" {
		attendance.Status = domain.OnTime // Assuming OnTime is the default
	}

	// Create attendance record
	if err := uc.attendanceRepo.Create(ctx, attendance); err != nil {
		return nil, fmt.Errorf("failed to create attendance record: %w", err)
	}

	// Fetch the created attendance with relations
	createdAttendance, err := uc.attendanceRepo.GetByID(ctx, attendance.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch created attendance: %w", err)
	}

	return responseAttendance.ToAttendanceResponseDTO(createdAttendance), nil
}

func (uc *AttendanceUseCase) ClockIn(ctx context.Context, reqDTO *dtoAttendance.ClockInRequestDTO) (*responseAttendance.AttendanceResponseDTO, error) {
	// Validate employee exists
	_, err := uc.employeeRepo.GetByID(ctx, reqDTO.EmployeeID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("employee with ID %d not found", reqDTO.EmployeeID)
		}
		return nil, fmt.Errorf("failed to validate employee for check-in: %w", err)
	}

	// Validate work schedule exists and get details
	workSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, reqDTO.WorkScheduleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("work schedule with ID %d not found", reqDTO.WorkScheduleID)
		}
		return nil, fmt.Errorf("failed to validate work schedule for check-in: %w", err)
	}
	// Determine the attendance date and time
	var attendanceDate time.Time
	var clockInTime time.Time

	// Parse date if provided in request
	if reqDTO.Date != "" {
		parsedDate, err := time.Parse("2006-01-02", reqDTO.Date)
		if err != nil {
			return nil, fmt.Errorf("invalid date format (expected YYYY-MM-DD): %w", err)
		}
		attendanceDate = parsedDate
	}

	// If clock_in is provided in request, parse it
	if reqDTO.ClockIn != "" {
		parsedTime, err := time.Parse("2006-01-02T15:04:05Z", reqDTO.ClockIn)
		if err != nil {
			// Try alternative format
			parsedTime, err = time.Parse("2006-01-02T15:04:05Z07:00", reqDTO.ClockIn)
			if err != nil {
				return nil, fmt.Errorf("invalid clock_in format: %w", err)
			}
		}
		// Convert to UTC
		clockInTime = parsedTime.UTC()

		// If date was not provided separately, extract it from clock_in
		if reqDTO.Date == "" {
			attendanceDate = time.Date(clockInTime.Year(), clockInTime.Month(), clockInTime.Day(), 0, 0, 0, 0, time.UTC)
		}
	} else {
		// Use current time in UTC if no clock_in provided
		now := time.Now().UTC()
		clockInTime = now

		// If date was not provided, use today's date
		if reqDTO.Date == "" {
			attendanceDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
		} else {
			// If date was provided but clock_in wasn't, use current time but with the specified date
			clockInTime = time.Date(attendanceDate.Year(), attendanceDate.Month(), attendanceDate.Day(), now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), time.UTC)
		}
	}

	// Check if attendance already exists for the specified date
	dateStr := attendanceDate.Format("2006-01-02")
	existingAttendance, err := uc.attendanceRepo.GetByEmployeeAndDate(ctx, reqDTO.EmployeeID, dateStr)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing attendance for check-in: %w", err)
	}
	if existingAttendance != nil && existingAttendance.ClockIn != nil {
		return nil, fmt.Errorf("employee %d has already checked in on %s at %s", reqDTO.EmployeeID, dateStr, existingAttendance.ClockIn.Format(time.Kitchen))
	}

	// TODO: Validate location coordinates if provided (requires Location validation logic)

	attendance := &domain.Attendance{
		EmployeeID:  reqDTO.EmployeeID,
		Date:        attendanceDate,
		ClockIn:     &clockInTime,
		ClockInLat:  &reqDTO.ClockInLat,
		ClockInLong: &reqDTO.ClockInLong,
	}
	if len(workSchedule.Details) == 0 {
		return nil, fmt.Errorf("work schedule %d has no details configured", reqDTO.WorkScheduleID)
	}

	// Find relevant work schedule detail based on attendance day
	currentDay := getCurrentDayName(clockInTime)
	relevantDetail := findRelevantWorkScheduleDetail(workSchedule.Details, currentDay)

	if relevantDetail == nil {
		return nil, fmt.Errorf("no work schedule configured for %s. Please contact HR", currentDay)
	}

	// Determine attendance status based on check-in time against work schedule
	if relevantDetail.CheckinEnd != nil {
		// Convert CheckinEnd time to today's date with same time
		endTimeToday := time.Date(clockInTime.Year(), clockInTime.Month(), clockInTime.Day(),
			relevantDetail.CheckinEnd.Hour(), relevantDetail.CheckinEnd.Minute(), relevantDetail.CheckinEnd.Second(), 0, clockInTime.Location())

		if clockInTime.After(endTimeToday) {
			attendance.Status = domain.Late
		} else {
			attendance.Status = domain.OnTime
		}
	} else {
		// Default to OnTime if no check-in end time is configured
		attendance.Status = domain.OnTime
	}

	// Create attendance record
	if err := uc.attendanceRepo.Create(ctx, attendance); err != nil {
		return nil, fmt.Errorf("failed to create attendance record for check-in: %w", err)
	}

	// Fetch the created attendance with relations
	createdAttendance, err := uc.attendanceRepo.GetByID(ctx, attendance.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch created attendance after check-in: %w", err)
	}

	return responseAttendance.ToAttendanceResponseDTO(createdAttendance), nil
}

func (uc *AttendanceUseCase) ClockOut(ctx context.Context, reqDTO *dtoAttendance.ClockOutRequestDTO) (*responseAttendance.AttendanceResponseDTO, error) {
	// Validate employee exists
	_, err := uc.employeeRepo.GetByID(ctx, reqDTO.EmployeeID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("employee with ID %d not found", reqDTO.EmployeeID)
		}
		return nil, fmt.Errorf("failed to validate employee for check-out: %w", err)
	}

	// Determine the attendance date and time
	var attendanceDate time.Time
	var clockOutTime time.Time

	// Parse date if provided in request
	if reqDTO.Date != "" {
		parsedDate, err := time.Parse("2006-01-02", reqDTO.Date)
		if err != nil {
			return nil, fmt.Errorf("invalid date format (expected YYYY-MM-DD): %w", err)
		}
		attendanceDate = parsedDate
	}

	// If clock_out is provided in request, parse it
	if reqDTO.ClockOut != "" {
		parsedTime, err := time.Parse("2006-01-02T15:04:05Z", reqDTO.ClockOut)
		if err != nil {
			// Try alternative format
			parsedTime, err = time.Parse("2006-01-02T15:04:05Z07:00", reqDTO.ClockOut)
			if err != nil {
				return nil, fmt.Errorf("invalid clock_out format: %w", err)
			}
		}
		// Convert to UTC
		clockOutTime = parsedTime.UTC()

		// If date was not provided separately, extract it from clock_out
		if reqDTO.Date == "" {
			attendanceDate = time.Date(clockOutTime.Year(), clockOutTime.Month(), clockOutTime.Day(), 0, 0, 0, 0, time.UTC)
		}
	} else {
		// Use current time in UTC if no clock_out provided
		now := time.Now().UTC()
		clockOutTime = now

		// If date was not provided, use today's date
		if reqDTO.Date == "" {
			attendanceDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
		} else {
			// If date was provided but clock_out wasn't, use current time but with the specified date
			clockOutTime = time.Date(attendanceDate.Year(), attendanceDate.Month(), attendanceDate.Day(), now.Hour(), now.Minute(), now.Second(), now.Nanosecond(), time.UTC)
		}
	}

	// Find existing attendance record for the employee and date
	dateStr := attendanceDate.Format("2006-01-02")
	attendance, err := uc.attendanceRepo.GetByEmployeeAndDate(ctx, reqDTO.EmployeeID, dateStr)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("no attendance record found for employee %d on %s. Please check-in first", reqDTO.EmployeeID, dateStr)
		}
		return nil, fmt.Errorf("failed to get attendance record for check-out: %w", err)
	}

	// Check if employee has checked in
	if attendance.ClockIn == nil {
		return nil, fmt.Errorf("employee %d has not checked in on %s. Please check-in first", reqDTO.EmployeeID, dateStr)
	}

	// Check if already checked out
	if attendance.ClockOut != nil {
		return nil, fmt.Errorf("employee %d has already checked out on %s at %s", reqDTO.EmployeeID, dateStr, attendance.ClockOut.Format(time.Kitchen))
	}

	// Set clock out time and location
	attendance.ClockOut = &clockOutTime
	attendance.ClockOutLat = &reqDTO.ClockOutLat
	attendance.ClockOutLong = &reqDTO.ClockOutLong
	// Calculate work hours and update status based on work schedule
	if attendance.ClockIn != nil {
		duration := attendance.ClockOut.Sub(*attendance.ClockIn).Hours()
		attendance.WorkHours = &duration

		// Get the employee to find their work schedule ID
		employee, empErr := uc.employeeRepo.GetByID(ctx, attendance.EmployeeID)
		if empErr != nil {
			return nil, fmt.Errorf("failed to get employee for work schedule check: %w", empErr)
		}

		// Check for early leave based on work schedule if employee has one assigned
		if employee.WorkScheduleID != nil {
			workSchedule, wsErr := uc.workScheduleRepo.GetByIDWithDetails(ctx, *employee.WorkScheduleID)
			if wsErr != nil {
				return nil, fmt.Errorf("failed to get work schedule for early leave check: %w", wsErr)
			}

			if len(workSchedule.Details) > 0 {
				// Find relevant work schedule detail based on checkout day
				currentDay := getCurrentDayName(clockOutTime)
				relevantDetail := findRelevantWorkScheduleDetail(workSchedule.Details, currentDay)

				if relevantDetail == nil {
					return nil, fmt.Errorf("no work schedule configured for %s during checkout. Please contact HR", currentDay)
				}

				// Check for early leave if checkout time is configured
				if relevantDetail.CheckoutStart != nil {
					// Convert CheckoutStart time to today's date with same time
					minCheckoutTime := time.Date(clockOutTime.Year(), clockOutTime.Month(), clockOutTime.Day(),
						relevantDetail.CheckoutStart.Hour(), relevantDetail.CheckoutStart.Minute(), relevantDetail.CheckoutStart.Second(), 0, clockOutTime.Location())

					// Set early_leave if checkout is before minimum checkout time AND current status allows it
					if clockOutTime.Before(minCheckoutTime) {
						if attendance.Status != domain.Absent {
							attendance.Status = domain.EarlyLeave
						}
					}
					// If checkout is after minimum time, preserve the original status from check-in (OnTime/Late)
				}
			}
		}
	} else {
		var zeroDuration float64 = 0
		attendance.WorkHours = &zeroDuration
	}

	// Update attendance record
	if err := uc.attendanceRepo.Update(ctx, attendance); err != nil {
		return nil, fmt.Errorf("failed to update attendance record for check-out: %w", err)
	}

	// Fetch updated attendance with relations
	updatedAttendance, err := uc.attendanceRepo.GetByID(ctx, attendance.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated attendance after check-out: %w", err)
	}

	return responseAttendance.ToAttendanceResponseDTO(updatedAttendance), nil
}

func (uc *AttendanceUseCase) GetByID(ctx context.Context, id uint) (*responseAttendance.AttendanceResponseDTO, error) {
	attendance, err := uc.attendanceRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("attendance with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to get attendance by ID: %w", err)
	}
	return responseAttendance.ToAttendanceResponseDTO(attendance), nil
}

func (uc *AttendanceUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*responseAttendance.AttendanceListResponseData, error) {
	attendances, totalItems, err := uc.attendanceRepo.ListAll(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list attendances: %w", err)
	}

	responseDTOs := make([]*responseAttendance.AttendanceResponseDTO, len(attendances))
	for i, attendance := range attendances {
		responseDTOs[i] = responseAttendance.NewAttendanceResponseDTO(attendance)
	}

	return &responseAttendance.AttendanceListResponseData{
		Items: responseDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize))),
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page*paginationParams.PageSize < int(totalItems),
			HasPrevPage: paginationParams.Page > 1,
		},
	}, nil
}

func (uc *AttendanceUseCase) ListByEmployee(ctx context.Context, employeeID uint, paginationParams domain.PaginationParams) (*responseAttendance.AttendanceListResponseData, error) {
	// Validate employee exists
	_, err := uc.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("employee with ID %d not found", employeeID)
		}
		return nil, fmt.Errorf("failed to validate employee for listing attendances: %w", err)
	}

	attendances, totalItems, err := uc.attendanceRepo.ListByEmployee(ctx, employeeID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list attendances for employee %d: %w", employeeID, err)
	}

	responseDTOs := make([]*responseAttendance.AttendanceResponseDTO, len(attendances))
	for i, attendance := range attendances {
		responseDTOs[i] = responseAttendance.NewAttendanceResponseDTO(attendance)
	}

	return &responseAttendance.AttendanceListResponseData{
		Items: responseDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize))),
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page*paginationParams.PageSize < int(totalItems),
			HasPrevPage: paginationParams.Page > 1,
		},
	}, nil
}

func (uc *AttendanceUseCase) Update(ctx context.Context, id uint, reqDTO *dtoAttendance.UpdateAttendanceRequestDTO) (*responseAttendance.AttendanceResponseDTO, error) {
	// Get existing attendance record
	attendance, err := uc.attendanceRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("attendance with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to get attendance for update: %w", err)
	}

	// Update fields from DTO if provided
	if reqDTO.WorkScheduleID != nil {
		// Validate work schedule exists
		_, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, *reqDTO.WorkScheduleID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("work schedule with ID %d not found", *reqDTO.WorkScheduleID)
			}
			return nil, fmt.Errorf("failed to validate work schedule: %w", err)
		}
		attendance.Employee.WorkScheduleID = reqDTO.WorkScheduleID
	}

	if reqDTO.Date != nil {
		if parsedDate, err := time.Parse("2006-01-02", *reqDTO.Date); err == nil {
			attendance.Date = parsedDate
		} else {
			return nil, fmt.Errorf("invalid date format: %w", err)
		}
	}
	if reqDTO.ClockIn != nil {
		if *reqDTO.ClockIn == "" {
			attendance.ClockIn = nil
		} else {
			if parsedTime, err := time.Parse("15:04:05", *reqDTO.ClockIn); err == nil {
				// Combine the attendance date with the parsed time - use UTC
				clockInDateTime := time.Date(attendance.Date.Year(), attendance.Date.Month(), attendance.Date.Day(),
					parsedTime.Hour(), parsedTime.Minute(), parsedTime.Second(), 0, time.UTC)
				attendance.ClockIn = &clockInDateTime
			} else {
				return nil, fmt.Errorf("invalid clock in time format: %w", err)
			}
		}
	}

	if reqDTO.ClockOut != nil {
		if *reqDTO.ClockOut == "" {
			attendance.ClockOut = nil
		} else {
			if parsedTime, err := time.Parse("15:04:05", *reqDTO.ClockOut); err == nil {
				// Combine the attendance date with the parsed time - use UTC
				clockOutDateTime := time.Date(attendance.Date.Year(), attendance.Date.Month(), attendance.Date.Day(),
					parsedTime.Hour(), parsedTime.Minute(), parsedTime.Second(), 0, time.UTC)
				attendance.ClockOut = &clockOutDateTime
			} else {
				return nil, fmt.Errorf("invalid clock out time format: %w", err)
			}
		}
	}

	if reqDTO.ClockInLat != nil {
		attendance.ClockInLat = reqDTO.ClockInLat
	}
	if reqDTO.ClockInLong != nil {
		attendance.ClockInLong = reqDTO.ClockInLong
	}

	if reqDTO.ClockOutLat != nil {
		attendance.ClockOutLat = reqDTO.ClockOutLat
	}

	if reqDTO.ClockOutLong != nil {
		attendance.ClockOutLong = reqDTO.ClockOutLong
	}

	if reqDTO.Status != nil {
		attendance.Status = domain.AttendanceStatus(*reqDTO.Status)
	}

	// Recalculate work hours if both clock times are available
	if attendance.ClockIn != nil && attendance.ClockOut != nil {
		duration := attendance.ClockOut.Sub(*attendance.ClockIn).Hours()
		attendance.WorkHours = &duration
	} else if reqDTO.WorkHours != nil {
		attendance.WorkHours = reqDTO.WorkHours
	}

	// Update attendance record
	if err := uc.attendanceRepo.Update(ctx, attendance); err != nil {
		return nil, fmt.Errorf("failed to update attendance record: %w", err)
	}

	// Fetch updated attendance with relations
	updatedAttendance, err := uc.attendanceRepo.GetByID(ctx, attendance.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated attendance: %w", err)
	}

	return responseAttendance.ToAttendanceResponseDTO(updatedAttendance), nil
}

func (uc *AttendanceUseCase) Delete(ctx context.Context, id uint) error {
	// Check if attendance exists
	_, err := uc.attendanceRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("attendance with ID %d not found", id)
		}
		return fmt.Errorf("failed to get attendance for deletion: %w", err)
	}

	// Delete attendance record
	if err := uc.attendanceRepo.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete attendance record: %w", err)
	}

	return nil
}

// Helper method for work hours calculation
// This can be expanded or moved to a utility package if needed
func calculateWorkHours(clockIn, clockOut *time.Time) *float64 {
	if clockIn == nil || clockOut == nil {
		return nil
	}
	duration := clockOut.Sub(*clockIn).Hours()
	return &duration
}

// Helper functions for attendance status determination

// getCurrentDayName returns the day name from a time.Time
func getCurrentDayName(t time.Time) domain.Days {
	switch t.Weekday() {
	case time.Monday:
		return domain.Monday
	case time.Tuesday:
		return domain.Tuesday
	case time.Wednesday:
		return domain.Wednesday
	case time.Thursday:
		return domain.Thursday
	case time.Friday:
		return domain.Friday
	case time.Saturday:
		return domain.Saturday
	case time.Sunday:
		return domain.Sunday
	default:
		return domain.Monday // fallback
	}
}

// findRelevantWorkScheduleDetail finds the work schedule detail that applies to the given day
func findRelevantWorkScheduleDetail(details []domain.WorkScheduleDetail, currentDay domain.Days) *domain.WorkScheduleDetail {
	for i := range details {
		detail := &details[i]
		// Check if current day is in the work days for this detail
		for _, workDay := range detail.WorkDays {
			if workDay == currentDay {
				return detail
			}
		}
	}
	return nil // No matching work schedule detail found for this day
}

func (uc *AttendanceUseCase) GetStatistics(ctx context.Context) (*responseAttendance.AttendanceStatisticsResponseDTO, error) {
	onTime, late, earlyLeave, absent, leave, totalAttended, totalEmployees, err := uc.attendanceRepo.GetStatistics(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get attendance statistics: %w", err)
	}

	return &responseAttendance.AttendanceStatisticsResponseDTO{
		OnTime:         onTime,
		Late:           late,
		EarlyLeave:     earlyLeave,
		Absent:         absent,
		Leave:          leave,
		TotalAttended:  totalAttended,
		TotalEmployees: totalEmployees,
	}, nil
}

func (uc *AttendanceUseCase) GetStatisticsByManager(ctx context.Context, managerID uint) (*responseAttendance.AttendanceStatisticsResponseDTO, error) {
	onTime, late, earlyLeave, absent, leave, totalAttended, totalEmployees, err := uc.attendanceRepo.GetStatisticsByManager(ctx, managerID)
	if err != nil {
		return nil, fmt.Errorf("failed to get attendance statistics by manager: %w", err)
	}

	return &responseAttendance.AttendanceStatisticsResponseDTO{
		OnTime:         onTime,
		Late:           late,
		EarlyLeave:     earlyLeave,
		Absent:         absent,
		Leave:          leave,
		TotalAttended:  totalAttended,
		TotalEmployees: totalEmployees,
	}, nil
}

func (uc *AttendanceUseCase) GetEmployeeMonthlyStatistics(ctx context.Context, employeeID uint, year int, month int) (*responseAttendance.EmployeeMonthlyStatisticsResponseDTO, error) {
	onTime, late, absent, leave, totalWorkHours, err := uc.attendanceRepo.GetEmployeeMonthlyStatistics(ctx, employeeID, year, month)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee monthly statistics: %w", err)
	}

	return &responseAttendance.EmployeeMonthlyStatisticsResponseDTO{
		OnTime:         onTime,
		Late:           late,
		Absent:         absent,
		Leave:          leave,
		TotalWorkHours: totalWorkHours,
		Year:           year,
		Month:          month,
	}, nil
}

func (uc *AttendanceUseCase) GetEmployeeByUserID(ctx context.Context, userID uint) (*domain.Employee, error) {
	return uc.employeeRepo.GetByUserID(ctx, userID)
}

func (uc *AttendanceUseCase) GetTodayAttendancesByManager(ctx context.Context, managerID uint, paginationParams domain.PaginationParams) (*responseAttendance.AttendanceListResponseData, error) {
	attendances, totalRecords, err := uc.attendanceRepo.GetTodayAttendancesByManager(ctx, managerID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to get today's attendances by manager: %w", err)
	}

	return responseAttendance.ToAttendanceListResponseData(attendances, totalRecords, paginationParams.Page, paginationParams.PageSize), nil
}

func (uc *AttendanceUseCase) ListByManager(ctx context.Context, managerID uint, paginationParams domain.PaginationParams) (*responseAttendance.AttendanceListResponseData, error) {
	attendances, totalItems, err := uc.attendanceRepo.ListByManager(ctx, managerID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list attendances by manager: %w", err)
	}

	responseDTOs := make([]*responseAttendance.AttendanceResponseDTO, len(attendances))
	for i, attendance := range attendances {
		responseDTOs[i] = responseAttendance.NewAttendanceResponseDTO(attendance)
	}

	return &responseAttendance.AttendanceListResponseData{
		Items: responseDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize))),
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page*paginationParams.PageSize < int(totalItems),
			HasPrevPage: paginationParams.Page > 1,
		},
	}, nil
}
