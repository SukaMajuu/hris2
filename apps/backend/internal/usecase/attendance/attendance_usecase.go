package attendance

import (
	"context"
	"errors"
	"fmt"
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
}

func NewAttendanceUseCase(
	attendanceRepo interfaces.AttendanceRepository,
	employeeRepo interfaces.EmployeeRepository,
	workScheduleRepo interfaces.WorkScheduleRepository,
) *AttendanceUseCase {
	return &AttendanceUseCase{
		attendanceRepo:   attendanceRepo,
		employeeRepo:     employeeRepo,
		workScheduleRepo: workScheduleRepo,
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
		duration := attendance.ClockOut.Sub(*attendance.ClockIn).Hours()
		attendance.WorkHours = &duration
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

func (uc *AttendanceUseCase) CheckIn(ctx context.Context, reqDTO *dtoAttendance.CheckInRequestDTO) (*responseAttendance.AttendanceResponseDTO, error) {
	// Validate employee exists
	_, err := uc.employeeRepo.GetByID(ctx, reqDTO.EmployeeID) // Assign to _ if employee is not used further
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

	// Get current date and time
	now := time.Now()
	todayDateStr := now.Format("2006-01-02")

	// Check if attendance already exists for today
	existingAttendance, err := uc.attendanceRepo.GetByEmployeeAndDate(ctx, reqDTO.EmployeeID, todayDateStr)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing attendance for check-in: %w", err)
	}
	if existingAttendance != nil && existingAttendance.ClockIn != nil {
		return nil, fmt.Errorf("employee %d has already checked in today at %s", reqDTO.EmployeeID, existingAttendance.ClockIn.Format(time.Kitchen))
	}

	// TODO: Validate location coordinates if provided (requires Location validation logic)

	attendance := &domain.Attendance{
		EmployeeID:     reqDTO.EmployeeID,
		WorkScheduleID: reqDTO.WorkScheduleID,
		Date:           now,
		ClockIn:        &now,
		CheckInLat:     &reqDTO.CheckInLat,
		CheckInLong:    &reqDTO.CheckInLong,
	}

	// Determine attendance status based on work schedule and check-in time
	attendance.Status = domain.OnTime // Default status

	if len(workSchedule.Details) > 0 {
		relevantDetail := workSchedule.Details[0]
		if !relevantDetail.CheckinStart.IsZero() {
			startTimeToday := time.Date(now.Year(), now.Month(), now.Day(), relevantDetail.CheckinStart.Hour(), relevantDetail.CheckinStart.Minute(), relevantDetail.CheckinStart.Second(), 0, now.Location())
			gracePeriod := 5 * time.Minute // Example: 5 minutes grace period
			if now.After(startTimeToday.Add(gracePeriod)) {
				attendance.Status = domain.Late
			} else {
				attendance.Status = domain.OnTime
			}
		}
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

func (uc *AttendanceUseCase) CheckOut(ctx context.Context, reqDTO *dtoAttendance.CheckOutRequestDTO) (*responseAttendance.AttendanceResponseDTO, error) {
	// Get attendance record
	attendance, err := uc.attendanceRepo.GetByID(ctx, reqDTO.AttendanceID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("attendance record with ID %d not found for check-out", reqDTO.AttendanceID)
		}
		return nil, fmt.Errorf("failed to get attendance record for check-out: %w", err)
	}

	// Check if already checked out
	if attendance.ClockOut != nil {
		return nil, fmt.Errorf("attendance record ID %d has already been checked out at %s", reqDTO.AttendanceID, attendance.ClockOut.Format(time.Kitchen))
	}

	// Set clock out time and location
	now := time.Now()
	attendance.ClockOut = &now
	attendance.CheckOutLat = &reqDTO.CheckOutLat
	attendance.CheckOutLong = &reqDTO.CheckOutLong

	// Calculate work hours
	if attendance.ClockIn != nil {
		duration := attendance.ClockOut.Sub(*attendance.ClockIn).Hours()
		attendance.WorkHours = &duration

		workSchedule, wsErr := uc.workScheduleRepo.GetByIDWithDetails(ctx, attendance.WorkScheduleID)
		if wsErr == nil && len(workSchedule.Details) > 0 {
			relevantDetail := workSchedule.Details[0]
			if !relevantDetail.CheckoutEnd.IsZero() {
				endTimeToday := time.Date(now.Year(), now.Month(), now.Day(), relevantDetail.CheckoutEnd.Hour(), relevantDetail.CheckoutEnd.Minute(), relevantDetail.CheckoutEnd.Second(), 0, now.Location())
				if now.Before(endTimeToday) {
					if attendance.Status != domain.Absent && attendance.Status != domain.Leave {
						attendance.Status = domain.EarlyLeave
					}
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
	attendances, total, err := uc.attendanceRepo.ListAll(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list attendances: %w", err)
	}

	return responseAttendance.NewAttendanceListResponseData(attendances, total, paginationParams.Page, paginationParams.PageSize), nil
}

func (uc *AttendanceUseCase) ListByEmployee(ctx context.Context, employeeID uint, paginationParams domain.PaginationParams) (*responseAttendance.AttendanceListResponseData, error) {
	// Validate employee exists
	_, err := uc.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("employee with ID %d not found when listing attendances", employeeID)
		}
		return nil, fmt.Errorf("failed to validate employee for listing attendances: %w", err)
	}

	attendances, total, err := uc.attendanceRepo.ListByEmployee(ctx, employeeID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list attendances for employee %d: %w", employeeID, err)
	}

	return responseAttendance.NewAttendanceListResponseData(attendances, total, paginationParams.Page, paginationParams.PageSize), nil
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
		attendance.WorkScheduleID = *reqDTO.WorkScheduleID
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
				attendance.ClockIn = &parsedTime
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
				attendance.ClockOut = &parsedTime
			} else {
				return nil, fmt.Errorf("invalid clock out time format: %w", err)
			}
		}
	}

	if reqDTO.CheckInLat != nil {
		attendance.CheckInLat = reqDTO.CheckInLat
	}
	if reqDTO.CheckInLong != nil {
		attendance.CheckInLong = reqDTO.CheckInLong
	}

	if reqDTO.CheckOutLat != nil {
		attendance.CheckOutLat = reqDTO.CheckOutLat
	}

	if reqDTO.CheckOutLong != nil {
		attendance.CheckOutLong = reqDTO.CheckOutLong
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
