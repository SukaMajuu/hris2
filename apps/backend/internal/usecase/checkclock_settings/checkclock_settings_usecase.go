package checkclock_settings

import (
	"context"
	"errors"
	"fmt"
	"math"

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

	// Check if employee already has settings
	existing, err := uc.repo.GetByEmployeeID(ctx, req.EmployeeID)
	if err == nil && existing != nil {
		return nil, errors.New("employee already has checkclock settings")
	}

	createdSetting, err := uc.repo.Create(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("failed to create check clock setting: %w", err)
	}
	return createdSetting, nil
}

func (uc *CheckclockSettingsUseCase) GetByID(ctx context.Context, id uint) (*domain.CheckclockSettings, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *CheckclockSettingsUseCase) GetByEmployeeID(ctx context.Context, employeeID uint) (*domain.CheckclockSettings, error) {
	return uc.repo.GetByEmployeeID(ctx, employeeID)
}

func (uc *CheckclockSettingsUseCase) GetAll(ctx context.Context, page, pageSize int) ([]*domain.CheckclockSettings, *PaginationMeta, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize
	settings, total, err := uc.repo.GetAll(ctx, offset, pageSize)
	if err != nil {
		return nil, nil, err
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))
	meta := &PaginationMeta{
		Total:       total,
		Page:        page,
		PageSize:    pageSize,
		TotalPages:  totalPages,
		HasNext:     page < totalPages,
		HasPrevious: page > 1,
	}

	return settings, meta, nil
}

func (uc *CheckclockSettingsUseCase) Update(ctx context.Context, id uint, updateData *domain.CheckclockSettings) (*domain.CheckclockSettings, error) {
	// Check if record exists
	existing, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("checkclock settings with ID %d not found: %w", id, err)
	}

	// Validate EmployeeID if being updated
	if updateData.EmployeeID != 0 {
		existingEmployee, err := uc.empRepo.GetByID(ctx, updateData.EmployeeID)
		if err != nil {
			return nil, fmt.Errorf("failed to validate employee ID: %w", err)
		}
		if existingEmployee == nil {
			return nil, fmt.Errorf("employee with ID %d not found", updateData.EmployeeID)
		}

		// Check if another employee already has settings (but allow same employee)
		if updateData.EmployeeID != existing.EmployeeID {
			existingSettings, err := uc.repo.GetByEmployeeID(ctx, updateData.EmployeeID)
			if err == nil && existingSettings != nil {
				return nil, fmt.Errorf("employee with ID %d already has checkclock settings", updateData.EmployeeID)
			}
		}

		existing.EmployeeID = updateData.EmployeeID
	}

	// Validate WorkScheduleID if being updated
	if updateData.WorkScheduleID != 0 {
		existingWorkSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, updateData.WorkScheduleID)
		if err != nil {
			return nil, fmt.Errorf("failed to validate work schedule ID: %w", err)
		}
		if existingWorkSchedule == nil {
			return nil, fmt.Errorf("work schedule with ID %d not found", updateData.WorkScheduleID)
		}

		existing.WorkScheduleID = updateData.WorkScheduleID
	}

	err = uc.repo.Update(ctx, existing)
	if err != nil {
		return nil, fmt.Errorf("failed to update checkclock settings: %w", err)
	}

	return uc.repo.GetByID(ctx, id)
}

func (uc *CheckclockSettingsUseCase) Delete(ctx context.Context, id uint) error {
	// Check if record exists
	_, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return uc.repo.Delete(ctx, id)
}

type PaginationMeta struct {
	Total       int64 `json:"total"`
	Page        int   `json:"page"`
	PageSize    int   `json:"page_size"`
	TotalPages  int   `json:"total_pages"`
	HasNext     bool  `json:"has_next"`
	HasPrevious bool  `json:"has_previous"`
}
