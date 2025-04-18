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

func (m *EmployeeRepository) Update(ctx context.Context, employee *domain.Employee) error {
	args := m.Called(ctx, employee)
	return args.Error(0)
}

func (m *EmployeeRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *EmployeeRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Employee, error) {
	args := m.Called(ctx, filters)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Employee), args.Error(1)
}
