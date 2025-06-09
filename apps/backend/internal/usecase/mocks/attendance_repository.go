package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/stretchr/testify/mock"
)

type AttendanceRepository struct {
	mock.Mock
}

func (m *AttendanceRepository) Create(ctx context.Context, attendance *domain.Attendance) error {
	args := m.Called(ctx, attendance)
	return args.Error(0)
}

func (m *AttendanceRepository) GetByID(ctx context.Context, id uint) (*domain.Attendance, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Attendance), args.Error(1)
}

func (m *AttendanceRepository) GetByEmployeeAndDate(ctx context.Context, employeeID uint, date string) (*domain.Attendance, error) {
	args := m.Called(ctx, employeeID, date)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Attendance), args.Error(1)
}

func (m *AttendanceRepository) ListByEmployee(ctx context.Context, employeeID uint, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error) {
	args := m.Called(ctx, employeeID, paginationParams)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*domain.Attendance), args.Get(1).(int64), args.Error(2)
}

func (m *AttendanceRepository) ListAll(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error) {
	args := m.Called(ctx, paginationParams)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*domain.Attendance), args.Get(1).(int64), args.Error(2)
}

func (m *AttendanceRepository) ListByManager(ctx context.Context, managerID uint, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error) {
	args := m.Called(ctx, managerID, paginationParams)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*domain.Attendance), args.Get(1).(int64), args.Error(2)
}

func (m *AttendanceRepository) Update(ctx context.Context, attendance *domain.Attendance) error {
	args := m.Called(ctx, attendance)
	return args.Error(0)
}

func (m *AttendanceRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *AttendanceRepository) GetStatistics(ctx context.Context) (onTime, late, earlyLeave, absent, leave, totalAttended, totalEmployees int64, err error) {
	args := m.Called(ctx)
	return args.Get(0).(int64), args.Get(1).(int64), args.Get(2).(int64), args.Get(3).(int64), args.Get(4).(int64), args.Get(5).(int64), args.Get(6).(int64), args.Error(7)
}

func (m *AttendanceRepository) GetStatisticsByManager(ctx context.Context, managerID uint) (onTime, late, earlyLeave, absent, leave, totalAttended, totalEmployees int64, err error) {
	args := m.Called(ctx, managerID)
	return args.Get(0).(int64), args.Get(1).(int64), args.Get(2).(int64), args.Get(3).(int64), args.Get(4).(int64), args.Get(5).(int64), args.Get(6).(int64), args.Error(7)
}

func (m *AttendanceRepository) GetTodayAttendancesByManager(ctx context.Context, managerID uint, paginationParams domain.PaginationParams) ([]*domain.Attendance, int64, error) {
	args := m.Called(ctx, managerID, paginationParams)
	return args.Get(0).([]*domain.Attendance), args.Get(1).(int64), args.Error(2)
}

var _ interfaces.AttendanceRepository = (*AttendanceRepository)(nil)
