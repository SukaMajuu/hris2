package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

type EmployeeRepository struct {
	mock.Mock
}

func (m *EmployeeRepository) Create(ctx context.Context, employee *domain.Employee) error {
	args := m.Called(ctx, employee)
	return args.Error(0)
}

func (m *EmployeeRepository) GetByID(ctx context.Context, id uint) (*domain.Employee, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Employee), args.Error(1)
}

func (m *EmployeeRepository) GetByUserID(ctx context.Context, userID uint) (*domain.Employee, error) {
	args := m.Called(ctx, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Employee), args.Error(1)
}

func (m *EmployeeRepository) GetByEmployeeCode(ctx context.Context, employeeCode string) (*domain.Employee, error) {
	args := m.Called(ctx, employeeCode)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Employee), args.Error(1)
}

func (m *EmployeeRepository) GetByNIK(ctx context.Context, nik string) (*domain.Employee, error) {
	args := m.Called(ctx, nik)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Employee), args.Error(1)
}

func (m *EmployeeRepository) Update(ctx context.Context, employee *domain.Employee) error {
	args := m.Called(ctx, employee)
	return args.Error(0)
}

func (m *EmployeeRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *EmployeeRepository) List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.Employee, int64, error) {
	args := m.Called(ctx, filters, pagination)
	var employees []*domain.Employee
	if args.Get(0) != nil {
		employees = args.Get(0).([]*domain.Employee)
	}
	var totalItems int64
	if args.Get(1) != nil {
		if val, ok := args.Get(1).(int64); ok {
			totalItems = val
		} else if valInt, ok := args.Get(1).(int); ok {
			totalItems = int64(valInt)
		}
	}
	return employees, totalItems, args.Error(2)
}

func (m *EmployeeRepository) GetStatisticsWithTrendsByManager(ctx context.Context, managerID uint) (
	totalEmployees, newEmployees, activeEmployees, resignedEmployees,
	permanentEmployees, contractEmployees, freelanceEmployees int64,
	totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend float64,
	err error,
) {
	args := m.Called(ctx, managerID)
	return args.Get(0).(int64), args.Get(1).(int64), args.Get(2).(int64), args.Get(3).(int64),
		args.Get(4).(int64), args.Get(5).(int64), args.Get(6).(int64), args.Get(7).(float64),
		args.Get(8).(float64), args.Get(9).(float64), args.Error(10)
}
