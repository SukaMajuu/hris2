package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

type DepartmentRepository struct {
	mock.Mock
}

func (m *DepartmentRepository) Create(ctx context.Context, department *domain.Department) error {
	args := m.Called(ctx, department)
	return args.Error(0)
}

func (m *DepartmentRepository) GetByID(ctx context.Context, id uint) (*domain.Department, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Department), args.Error(1)
}

func (m *DepartmentRepository) GetByName(ctx context.Context, name string) (*domain.Department, error) {
	args := m.Called(ctx, name)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Department), args.Error(1)
}

func (m *DepartmentRepository) Update(ctx context.Context, department *domain.Department) error {
	args := m.Called(ctx, department)
	return args.Error(0)
}

func (m *DepartmentRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *DepartmentRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Department, error) {
	args := m.Called(ctx, filters)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Department), args.Error(1)
}
