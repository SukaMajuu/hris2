package interfaces

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type LeaveRequestRepository interface {
	Create(ctx context.Context, leaveRequest *domain.LeaveRequest) error
	GetByID(ctx context.Context, id uint) (*domain.LeaveRequest, error)
	GetByEmployeeID(ctx context.Context, employeeID uint, pagination domain.PaginationParams) ([]*domain.LeaveRequest, int64, error)
	Update(ctx context.Context, leaveRequest *domain.LeaveRequest) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.LeaveRequest, int64, error)
	UpdateStatus(ctx context.Context, id uint, status domain.LeaveStatus, adminNote *string) error
	HasOverlappingLeaveRequest(ctx context.Context, employeeID uint, startDate, endDate time.Time, excludeRequestID *uint) (bool, error)
	HasApprovedLeaveForDate(ctx context.Context, employeeID uint, date time.Time) (bool, error)
}
