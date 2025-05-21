package interfaces

import (
	"context"
	"github.com/SukaMajuu/hris/apps/backend/domain"
)

// WorkScheduleRepository defines the interface for work schedule data access
type WorkScheduleRepository interface {
	// CreateWorkSchedule creates a new work schedule with details
	CreateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error

	// GetWorkScheduleByID retrieves a work schedule by ID with its details
	GetWorkScheduleByID(ctx context.Context, id uint) (*domain.WorkSchedule, error)

	// UpdateWorkSchedule updates an existing work schedule and its details
	UpdateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error

	// DeleteWorkSchedule deletes a work schedule and its details
	DeleteWorkSchedule(ctx context.Context, id uint) error

	// ListWorkSchedules retrieves work schedules based on filters
	ListWorkSchedules(ctx context.Context, filters map[string]interface{}) ([]*domain.WorkSchedule, error)

	// AddWorkScheduleDetail adds a detail to an existing work schedule
	AddWorkScheduleDetail(ctx context.Context, detail *domain.WorkScheduleDetail) error

	// UpdateWorkScheduleDetail updates an existing work schedule detail
	UpdateWorkScheduleDetail(ctx context.Context, detail *domain.WorkScheduleDetail) error

	// DeleteWorkScheduleDetail deletes a work schedule detail
	DeleteWorkScheduleDetail(ctx context.Context, id uint) error

	// GetWorkScheduleDetails retrieves all details for a work schedule
	GetWorkScheduleDetails(ctx context.Context, workScheduleID uint) ([]*domain.WorkScheduleDetail, error)
}
