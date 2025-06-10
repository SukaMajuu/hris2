package mocks

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

// LeaveRequestRepository is a mock implementation of interfaces.LeaveRequestRepository
type LeaveRequestRepository struct {
	mock.Mock
}

// Create mocks the Create method
func (m *LeaveRequestRepository) Create(ctx context.Context, leaveRequest *domain.LeaveRequest) error {
	args := m.Called(ctx, leaveRequest)

	// Simulate GORM behavior by setting ID after creation
	if args.Error(0) == nil && leaveRequest.ID == 0 {
		leaveRequest.ID = 1 // Set a mock ID
	}

	return args.Error(0)
}

// GetByID mocks the GetByID method
func (m *LeaveRequestRepository) GetByID(ctx context.Context, id uint) (*domain.LeaveRequest, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.LeaveRequest), args.Error(1)
}

// GetByEmployeeID mocks the GetByEmployeeID method
func (m *LeaveRequestRepository) GetByEmployeeID(ctx context.Context, employeeID uint, pagination domain.PaginationParams) ([]*domain.LeaveRequest, int64, error) {
	args := m.Called(ctx, employeeID, pagination)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*domain.LeaveRequest), args.Get(1).(int64), args.Error(2)
}

// Update mocks the Update method
func (m *LeaveRequestRepository) Update(ctx context.Context, leaveRequest *domain.LeaveRequest) error {
	args := m.Called(ctx, leaveRequest)
	return args.Error(0)
}

// Delete mocks the Delete method
func (m *LeaveRequestRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

// List mocks the List method
func (m *LeaveRequestRepository) List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.LeaveRequest, int64, error) {
	args := m.Called(ctx, filters, pagination)
	if args.Get(0) == nil {
		return nil, args.Get(1).(int64), args.Error(2)
	}
	return args.Get(0).([]*domain.LeaveRequest), args.Get(1).(int64), args.Error(2)
}

// UpdateStatus mocks the UpdateStatus method
func (m *LeaveRequestRepository) UpdateStatus(ctx context.Context, id uint, status domain.LeaveStatus, adminNote *string) error {
	args := m.Called(ctx, id, status, adminNote)
	return args.Error(0)
}

func (m *LeaveRequestRepository) HasApprovedLeaveForDate(ctx context.Context, employeeID uint, date time.Time) (bool, error) {
	args := m.Called(ctx, employeeID, date)
	return args.Get(0).(bool), args.Error(1)
}
