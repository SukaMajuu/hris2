package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/stretchr/testify/mock"
)

type WorkScheduleRepository struct {
	mock.Mock
}

func (m *WorkScheduleRepository) CreateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail) error {
	args := m.Called(ctx, workSchedule, details)
	return args.Error(0)
}

func (m *WorkScheduleRepository) GetByIDWithDetails(ctx context.Context, id uint) (*domain.WorkSchedule, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.WorkSchedule), args.Error(1)
}

func (m *WorkScheduleRepository) UpdateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error {
	args := m.Called(ctx, workSchedule, details, deletedDetailIDs)
	return args.Error(0)
}

func (m *WorkScheduleRepository) GetDetailsByScheduleID(ctx context.Context, scheduleID uint) ([]*domain.WorkScheduleDetail, error) {
	args := m.Called(ctx, scheduleID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.WorkScheduleDetail), args.Error(1)
}

func (m *WorkScheduleRepository) DeleteWithDetails(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *WorkScheduleRepository) ListWithPagination(ctx context.Context, pagination domain.PaginationParams) ([]*domain.WorkSchedule, int64, error) {
	args := m.Called(ctx, pagination)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*domain.WorkSchedule), args.Get(1).(int64), args.Error(2)
}

var _ interfaces.WorkScheduleRepository = (*WorkScheduleRepository)(nil)
