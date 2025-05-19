package work_schedule

import (
	"context"
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

type WorkScheduleUsecase struct {
	workScheduleRepo interfaces.WorkScheduleRepository
}

func NewWorkScheduleUsecase(repo interfaces.WorkScheduleRepository) *WorkScheduleUsecase {
	return &WorkScheduleUsecase{
		workScheduleRepo: repo,
	}
}

func (ws *WorkScheduleUsecase) CreateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error {
	if err := workSchedule.Validate(); err != nil {
		return fmt.Errorf("validation failed: %w", err)
	}
	return ws.workScheduleRepo.CreateWorkSchedule(ctx, workSchedule)
}

func (ws *WorkScheduleUsecase) GetWorkScheduleByID(ctx context.Context, id uint) (*domain.WorkSchedule, error) {
	return ws.workScheduleRepo.GetWorkScheduleByID(ctx, id)
}

func (ws *WorkScheduleUsecase) UpdateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error {
	return ws.workScheduleRepo.UpdateWorkSchedule(ctx, workSchedule)
}

func (ws *WorkScheduleUsecase) DeleteWorkSchedule(ctx context.Context, id uint) error {
	return ws.workScheduleRepo.DeleteWorkSchedule(ctx, id)
}

func (ws *WorkScheduleUsecase) ListWorkSchedule(ctx context.Context, filters map[string]interface{}) ([]*domain.WorkSchedule, error) {
	return ws.workScheduleRepo.ListWorkSchedule(ctx, filters)
}