package interfaces

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type EmployeeRepository interface {
	Create(ctx context.Context, employee *domain.Employee) error
	GetByID(ctx context.Context, id uint) (*domain.Employee, error)
	GetByUserID(ctx context.Context, userID uint) (*domain.Employee, error)
	GetByEmployeeCode(ctx context.Context, employeeCode string) (*domain.Employee, error)
	GetByNIK(ctx context.Context, nik string) (*domain.Employee, error)
	Update(ctx context.Context, employee *domain.Employee) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.Employee, int64, error)
	GetStatisticsWithTrendsByManager(ctx context.Context, managerID uint) (
		totalEmployees, newEmployees, activeEmployees, resignedEmployees,
		permanentEmployees, contractEmployees, freelanceEmployees int64,
		totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend float64,
		err error,
	)
	GetStatisticsWithTrendsByManagerAndMonth(ctx context.Context, managerID uint, month string) (
		totalEmployees, newEmployees, activeEmployees, resignedEmployees,
		permanentEmployees, contractEmployees, freelanceEmployees int64,
		totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend float64,
		err error,
	)
	GetHireDateRange(ctx context.Context, managerID uint) (earliestHireDate, latestHireDate *time.Time, err error)
}
