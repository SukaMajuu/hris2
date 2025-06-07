package attendance

import (
	"context"
	"errors" // Added import
	"fmt"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{
		db: db,
	}
}

// Create creates a new attendance record
func (r *AttendanceRepository) Create(ctx context.Context, attendance *domain.Attendance) error {
	if err := r.db.WithContext(ctx).Create(attendance).Error; err != nil {
		return fmt.Errorf("failed to create attendance: %w", err)
	}
	return nil
}

// GetByID retrieves an attendance record by ID with preloaded relationships
func (r *AttendanceRepository) GetByID(ctx context.Context, id uint) (*domain.Attendance, error) {
	var attendance domain.Attendance
	if err := r.db.WithContext(ctx).
		Preload("Employee").
		First(&attendance, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("attendance with ID %d not found: %w", id, err)
		}
		return nil, fmt.Errorf("failed to get attendance by ID: %w", err)
	}
	return &attendance, nil
}

// GetByEmployeeAndDate retrieves an attendance record by employee ID and date
func (r *AttendanceRepository) GetByEmployeeAndDate(ctx context.Context, employeeID uint, date string) (*domain.Attendance, error) {
	var attendance domain.Attendance

	parsedDate, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format for GetByEmployeeAndDate: %w", err)
	}

	// Use DATE() function to compare only the date part, not the full timestamp
	if err := r.db.WithContext(ctx).
		Preload("Employee").
		Where("employee_id = ? AND DATE(date) = DATE(?)", employeeID, parsedDate).
		First(&attendance).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound // Return specific error for not found
		}
		return nil, fmt.Errorf("error fetching attendance by employee ID %d and date %s: %w", employeeID, date, err)
	}
	return &attendance, nil
}

// ListByEmployee retrieves attendance records for a specific employee with pagination
func (r *AttendanceRepository) ListByEmployee(ctx context.Context, employeeID uint, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error) {
	var attendances []*domain.Attendance
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.Attendance{}).Where("employee_id = ?", employeeID)

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count attendances by employee: %w", err)
	}

	// Get paginated records
	offset := (paginationParams.Page - 1) * paginationParams.PageSize
	if err := query.Preload("Employee").Offset(offset).Limit(paginationParams.PageSize).Order("date desc, clock_in desc").Find(&attendances).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list attendances by employee: %w", err)
	}

	return attendances, total, nil
}

// ListAll retrieves all attendance records with pagination
func (r *AttendanceRepository) ListAll(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error) {
	var attendances []*domain.Attendance
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.Attendance{})

	// Count total records
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count all attendances: %w", err)
	}

	// Get paginated records
	offset := (paginationParams.Page - 1) * paginationParams.PageSize
	if err := query.Preload("Employee").Offset(offset).Limit(paginationParams.PageSize).Order("date desc, clock_in desc").Find(&attendances).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list all attendances: %w", err)
	}

	return attendances, total, nil
}

// Update updates an existing attendance record
func (r *AttendanceRepository) Update(ctx context.Context, attendance *domain.Attendance) error {
	if err := r.db.WithContext(ctx).Save(attendance).Error; err != nil {
		return fmt.Errorf("failed to update attendance with ID %d: %w", attendance.ID, err)
	}
	return nil
}

// Delete soft deletes an attendance record
func (r *AttendanceRepository) Delete(ctx context.Context, id uint) error {
	if err := r.db.WithContext(ctx).Delete(&domain.Attendance{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete attendance with ID %d: %w", id, err)
	}
	return nil
}

// GetByEmployeeAndDateRange retrieves attendance records for a specific employee within a date range
func (r *AttendanceRepository) GetByEmployeeAndDateRange(ctx context.Context, employeeID uint, startDate, endDate string) ([]*domain.Attendance, error) {
	var attendances []*domain.Attendance

	startParsed, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start date format: %w", err)
	}

	endParsed, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end date format: %w", err)
	}

	if err := r.db.WithContext(ctx).
		Where("employee_id = ? AND DATE(date) BETWEEN DATE(?) AND DATE(?)", employeeID, startParsed, endParsed).
		Preload("Employee").
		Order("date ASC").
		Find(&attendances).Error; err != nil {
		return nil, fmt.Errorf("failed to get attendance records by date range: %w", err)
	}

	return attendances, nil
}

// GetByDateRange retrieves all attendance records within a date range
func (r *AttendanceRepository) GetByDateRange(ctx context.Context, startDate, endDate string) ([]*domain.Attendance, error) {
	var attendances []*domain.Attendance

	startParsed, err := time.Parse("2006-01-02", startDate)
	if err != nil {
		return nil, fmt.Errorf("invalid start date format: %w", err)
	}

	endParsed, err := time.Parse("2006-01-02", endDate)
	if err != nil {
		return nil, fmt.Errorf("invalid end date format: %w", err)
	}

	if err := r.db.WithContext(ctx).
		Where("DATE(date) BETWEEN DATE(?) AND DATE(?)", startParsed, endParsed).
		Preload("Employee").
		Order("date ASC, employee_id ASC").
		Find(&attendances).Error; err != nil {
		return nil, fmt.Errorf("failed to get attendance records by date range: %w", err)
	}

	return attendances, nil
}

// CountByEmployeeAndStatus counts attendance records by employee and status
func (r *AttendanceRepository) CountByEmployeeAndStatus(ctx context.Context, employeeID uint, status domain.AttendanceStatus) (int64, error) {
	var count int64

	if err := r.db.WithContext(ctx).
		Model(&domain.Attendance{}).
		Where("employee_id = ? AND status = ?", employeeID, status).
		Count(&count).Error; err != nil {
		return 0, fmt.Errorf("failed to count attendance by employee and status: %w", err)
	}

	return count, nil
}

// GetTodayAttendanceByEmployee gets today's attendance for a specific employee
func (r *AttendanceRepository) GetTodayAttendanceByEmployee(ctx context.Context, employeeID uint) (*domain.Attendance, error) {
	var attendance domain.Attendance
	today := time.Now().Format("2006-01-02")

	if err := r.db.WithContext(ctx).
		Where("employee_id = ? AND DATE(date) = DATE(?)", employeeID, today).
		Preload("Employee").
		First(&attendance).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, fmt.Errorf("failed to get today's attendance for employee %d: %w", employeeID, err)
	}

	return &attendance, nil
}
