package checkclock_settings

import (
	"context"
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

type CheckclockSettingsUseCase struct {
	repo             interfaces.CheckclockSettingsRepository
	empRepo          interfaces.EmployeeRepository
	workScheduleRepo interfaces.WorkScheduleRepository
}

func NewCheckclockSettingsUseCase(repo interfaces.CheckclockSettingsRepository, empRepo interfaces.EmployeeRepository, workScheduleRepo interfaces.WorkScheduleRepository) *CheckclockSettingsUseCase {
	return &CheckclockSettingsUseCase{
		repo:             repo,
		empRepo:          empRepo,
		workScheduleRepo: workScheduleRepo,
	}
}

func (uc *CheckclockSettingsUseCase) Create(ctx context.Context, req *domain.CheckclockSettings) (*domain.CheckclockSettings, error) {
	// Validate EmployeeID
	existingEmployee, err := uc.empRepo.GetByID(ctx, req.EmployeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate employee ID: %w", err)
	}
	if existingEmployee == nil {
		return nil, fmt.Errorf("employee with ID %d not found", req.EmployeeID)
	}

	// Validate WorkScheduleID
	existingWorkSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, req.WorkScheduleID) // Corrected method name
	if err != nil {
		return nil, fmt.Errorf("failed to validate work schedule ID: %w", err)
	}
	if existingWorkSchedule == nil {
		return nil, fmt.Errorf("work schedule with ID %d not found", req.WorkScheduleID)
	}

	createdSetting, err := uc.repo.Create(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to create check clock setting: %w", err)
	}
	return createdSetting, nil
}
