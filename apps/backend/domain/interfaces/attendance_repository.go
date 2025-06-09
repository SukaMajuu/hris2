package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type AttendanceRepository interface {
	// Create operations
	Create(ctx context.Context, attendance *domain.Attendance) error

	// Read operations
	GetByID(ctx context.Context, id uint) (*domain.Attendance, error)
	GetByEmployeeAndDate(ctx context.Context, employeeID uint, date string) (*domain.Attendance, error)

	// List operations
	ListByEmployee(ctx context.Context, employeeID uint, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error)
	ListAll(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error)

	// Update operations
	Update(ctx context.Context, attendance *domain.Attendance) error

	// Delete operations
	Delete(ctx context.Context, id uint) error

	// Statistics operations
	GetStatistics(ctx context.Context) (onTime, late, earlyLeave, absent, leave, totalAttended, totalEmployees int64, err error)
	GetStatisticsByManager(ctx context.Context, managerID uint) (onTime, late, earlyLeave, absent, leave, totalAttended, totalEmployees int64, err error)
	GetTodayAttendancesByManager(ctx context.Context, managerID uint, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error)
}
