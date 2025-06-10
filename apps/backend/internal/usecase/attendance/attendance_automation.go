package attendance

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

func (uc *AttendanceUseCase) ProcessDailyAbsentCheck(ctx context.Context) error {
	log.Println("🔍 Checking for employees to mark as absent...")

	today := time.Now().Format("2006-01-02")
	todayParsed, err := time.Parse("2006-01-02", today)
	if err != nil {
		return fmt.Errorf("failed to parse today's date: %w", err)
	}

	// Get all active employees
	employees, err := uc.getAllActiveEmployees(ctx)
	if err != nil {
		return fmt.Errorf("failed to get active employees: %w", err)
	}

	absentCount := 0
	for _, employee := range employees {
		// Check if employee has attendance record for today
		hasAttendance, err := uc.hasAttendanceForDate(ctx, employee.ID, today)
		if err != nil {
			log.Printf("❌ Failed to check attendance for employee %d: %v", employee.ID, err)
			continue
		}

		if hasAttendance {
			// Employee already has attendance record, skip
			continue
		}

		// Check if employee has approved leave request for today
		// NOTE: Only APPROVED leaves prevent absent marking - pending leaves will still result in absent status
		hasApprovedLeave, err := uc.hasApprovedLeaveForDate(ctx, employee.ID, todayParsed)
		if err != nil {
			log.Printf("❌ Failed to check leave request for employee %d: %v", employee.ID, err)
			continue
		}

		if hasApprovedLeave {
			// Employee has approved leave, skip
			log.Printf("📋 Employee %d has approved leave for today", employee.ID)
			continue
		}

		// Employee has no attendance and no approved leave, mark as absent
		if err := uc.createAbsentAttendance(ctx, employee.ID, todayParsed); err != nil {
			log.Printf("❌ Failed to create absent record for employee %d: %v", employee.ID, err)
			continue
		}

		log.Printf("📋 Marked employee %d as absent for %s", employee.ID, today)
		absentCount++
	}

	log.Printf("✅ Processed daily absent check: %d employees marked as absent", absentCount)
	return nil
}

// Helper methods for absent check

func (uc *AttendanceUseCase) getAllActiveEmployees(ctx context.Context) ([]domain.Employee, error) {
	// We need to get all active employees - since we don't have a direct method,
	// let's use the employee repository to get all employees and filter active ones
	employees, _, err := uc.employeeRepo.List(ctx, map[string]interface{}{
		"employment_status": true,
	}, domain.PaginationParams{Page: 1, PageSize: 1000}) // Get a large batch

	if err != nil {
		return nil, fmt.Errorf("failed to get active employees: %w", err)
	}

	var activeEmployees []domain.Employee
	for _, emp := range employees {
		activeEmployees = append(activeEmployees, *emp)
	}

	return activeEmployees, nil
}

func (uc *AttendanceUseCase) hasAttendanceForDate(ctx context.Context, employeeID uint, date string) (bool, error) {
	_, err := uc.attendanceRepo.GetByEmployeeAndDate(ctx, employeeID, date)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, fmt.Errorf("failed to check attendance for employee %d: %w", employeeID, err)
	}

	return true, nil
}

func (uc *AttendanceUseCase) hasApprovedLeaveForDate(ctx context.Context, employeeID uint, date time.Time) (bool, error) {
	return uc.leaveRequestRepo.HasApprovedLeaveForDate(ctx, employeeID, date)
}

func (uc *AttendanceUseCase) createAbsentAttendance(ctx context.Context, employeeID uint, date time.Time) error {
	attendance := &domain.Attendance{
		EmployeeID: employeeID,
		Date:       date,
		Status:     domain.Absent,
		ClockIn:    nil,
		ClockOut:   nil,
		WorkHours:  nil,
	}

	if err := uc.attendanceRepo.Create(ctx, attendance); err != nil {
		return fmt.Errorf("failed to create absent attendance record: %w", err)
	}

	return nil
}
