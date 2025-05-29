package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type WorkScheduleRepository interface {
	// Create & Read Operations
	CreateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail) error
	GetByIDWithDetails(ctx context.Context, id uint) (*domain.WorkSchedule, error) // Dipertahankan karena digunakan oleh Create use case

	// GetDetailsByScheduleID(ctx context.Context, scheduleID uint) ([]*domain.WorkScheduleDetail, error)

	// // Unified Save Operation (Create/Update)
	// SaveWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error

	// // Delete Operations
	// DeleteSchedule(ctx context.Context, id uint) error

	// SoftDeleteDetail(ctx context.Context, detailID uint) error

	// // List Operation
	// ListWithPagination(ctx context.Context, pagination domain.PaginationParams) ([]*domain.WorkSchedule, int64, error)

	// // Validation
	// IsDetailConfigurationUnique(ctx context.Context, scheduleID uint, workTypeDetail string, days []domain.Days, excludeDetailID uint) (bool, error)
}
