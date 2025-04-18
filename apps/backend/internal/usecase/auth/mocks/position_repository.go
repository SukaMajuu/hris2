package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

type PositionRepository struct {
	mock.Mock
}

func (m *PositionRepository) Create(ctx context.Context, position *domain.Position) error {
	args := m.Called(ctx, position)
	return args.Error(0)
}

func (m *PositionRepository) GetByID(ctx context.Context, id uint) (*domain.Position, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Position), args.Error(1)
}

func (m *PositionRepository) GetByName(ctx context.Context, name string) (*domain.Position, error) {
	args := m.Called(ctx, name)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Position), args.Error(1)
}

func (m *PositionRepository) GetByDepartmentID(ctx context.Context, departmentID uint) ([]*domain.Position, error) {
	args := m.Called(ctx, departmentID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Position), args.Error(1)
}

func (m *PositionRepository) Update(ctx context.Context, position *domain.Position) error {
	args := m.Called(ctx, position)
	return args.Error(0)
}

func (m *PositionRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *PositionRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Position, error) {
	args := m.Called(ctx, filters)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Position), args.Error(1)
}
