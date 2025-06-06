package checkclock_settings

import (
	"context"
	"errors"
	"fmt"
	"math"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtocheckclocksettings "github.com/SukaMajuu/hris/apps/backend/domain/dto/checkclock_settings"
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

func (uc *CheckclockSettingsUseCase) Create(ctx context.Context, req *domain.CheckclockSettings) (*dtocheckclocksettings.CheckclockSettingsResponseDTO, error) {
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
	return dtocheckclocksettings.ToCheckclockSettingsResponseDTO(createdSetting), nil
}

func (uc *CheckclockSettingsUseCase) GetByID(ctx context.Context, id uint) (*dtocheckclocksettings.CheckclockSettingsResponseDTO, error) {
	setting, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return dtocheckclocksettings.ToCheckclockSettingsResponseDTO(setting), nil
}

func (uc *CheckclockSettingsUseCase) GetByEmployeeID(ctx context.Context, employeeID uint) (*dtocheckclocksettings.CheckclockSettingsResponseDTO, error) {
	setting, err := uc.repo.GetByEmployeeID(ctx, employeeID)
	if err != nil {
		return nil, err
	}
	return dtocheckclocksettings.ToCheckclockSettingsResponseDTO(setting), nil
}

func (uc *CheckclockSettingsUseCase) GetAll(ctx context.Context, paginationParams domain.PaginationParams) (*dtocheckclocksettings.CheckclockSettingsListResponseData, error) {
	offset := (paginationParams.Page - 1) * paginationParams.PageSize
	domainSettings, totalItems, err := uc.repo.GetAll(ctx, offset, paginationParams.PageSize)
	if err != nil {
		return nil, fmt.Errorf("failed to list checkclock settings from repository: %w", err)
	}

	settingsDTOs := make([]*dtocheckclocksettings.CheckclockSettingsResponseDTO, len(domainSettings))
	for i, setting := range domainSettings {
		settingsDTOs[i] = dtocheckclocksettings.ToCheckclockSettingsResponseDTO(setting)
	}

	totalPages := 0
	if paginationParams.PageSize > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize)))
	}
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	response := &dtocheckclocksettings.CheckclockSettingsListResponseData{
		Items: settingsDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page < totalPages,
			HasPrevPage: paginationParams.Page > 1 && paginationParams.Page <= totalPages,
		},
	}

	return response, nil
}

func (uc *CheckclockSettingsUseCase) GetAllWithFilters(
	ctx context.Context, 
	paginationParams domain.PaginationParams, 
	filters map[string]interface{},
	) (*dtocheckclocksettings.CheckclockSettingsListResponseData, error) {
	offset := (paginationParams.Page - 1) * paginationParams.PageSize
	domainSettings, totalItems, err := uc.repo.GetAllWithFilters(ctx, offset, paginationParams.PageSize, filters)
	if err != nil {
		return nil, fmt.Errorf("failed to list checkclock settings from repository: %w", err)
	}

	settingsDTOs := make([]*dtocheckclocksettings.CheckclockSettingsResponseDTO, len(domainSettings))
	for i, setting := range domainSettings {
		settingsDTOs[i] = dtocheckclocksettings.ToCheckclockSettingsResponseDTO(setting)
	}

	totalPages := 0
	if paginationParams.PageSize > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize)))
	}
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	response := &dtocheckclocksettings.CheckclockSettingsListResponseData{
		Items: settingsDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page < totalPages,
			HasPrevPage: paginationParams.Page > 1 && paginationParams.Page <= totalPages,
		},
	}

	return response, nil
}

func (uc *CheckclockSettingsUseCase) Update(ctx context.Context, id uint, updateData *domain.CheckclockSettings) (*dtocheckclocksettings.CheckclockSettingsResponseDTO, error) {
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

	updatedSetting, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return dtocheckclocksettings.ToCheckclockSettingsResponseDTO(updatedSetting), nil
}

func (uc *CheckclockSettingsUseCase) Delete(ctx context.Context, id uint) error {
	// Check if record exists
	_, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	return uc.repo.Delete(ctx, id)
}
