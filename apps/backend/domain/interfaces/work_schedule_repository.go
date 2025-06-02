package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type WorkScheduleRepository interface {
	// Create & Read Operations
	CreateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail) error
	GetByIDWithDetails(ctx context.Context, id uint) (*domain.WorkSchedule, error)

	// Update Operations
	UpdateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error
	GetDetailsByScheduleID(ctx context.Context, scheduleID uint) ([]*domain.WorkScheduleDetail, error)

	// List Operation
	ListWithPagination(ctx context.Context, pagination domain.PaginationParams) ([]*domain.WorkSchedule, int64, error)
}
