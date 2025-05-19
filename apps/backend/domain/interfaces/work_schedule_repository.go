package interfaces

import (
	"context"
	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type WorkScheduleRepository interface {
	CreateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error
	GetWorkScheduleByID(ctx context.Context, id uint) (*domain.WorkSchedule, error)
	UpdateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error
	DeleteWorkSchedule(ctx context.Context, id uint) error
	ListWorkSchedule(ctx context.Context, filters map[string]interface{}) ([]*domain.WorkSchedule, error)
}