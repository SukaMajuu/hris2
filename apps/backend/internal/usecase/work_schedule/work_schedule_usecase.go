package work_Schedule

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtolocation "github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
	dtoworkschedule "github.com/SukaMajuu/hris/apps/backend/domain/dto/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

// WorkScheduleUseCase implements the business logic for work schedules.
type WorkScheduleUseCase struct {
	workScheduleRepo interfaces.WorkScheduleRepository
	locationRepo     interfaces.LocationRepository // Assuming you might need to validate LocationID
}

// NewWorkScheduleUseCase creates a new WorkScheduleUseCase.
func NewWorkScheduleUseCase(repo interfaces.WorkScheduleRepository, locRepo interfaces.LocationRepository) *WorkScheduleUseCase {
	return &WorkScheduleUseCase{
		workScheduleRepo: repo,
		locationRepo:     locRepo,
	}
}

// Helper function to format *time.Time to *string "HH:MM:SS"
func formatTimeToStringPtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := t.Format("15:04:05")
	return &s
}

func toWorkScheduleDetailResponseDTO(detail domain.WorkScheduleDetail) *dtoworkschedule.WorkScheduleDetailResponseDTO {
	dtoWorkDays := make([]string, len(detail.WorkDays))
	for j, day := range detail.WorkDays {
		dtoWorkDays[j] = string(day)
	}

	respDetail := &dtoworkschedule.WorkScheduleDetailResponseDTO{
		ID:             detail.ID,
		WorkTypeDetail: string(detail.WorktypeDetail), // Corrected casing
		WorkDays:       dtoWorkDays,
		CheckInStart:   formatTimeToStringPtr(detail.CheckinStart), // Corrected casing
		CheckInEnd:     formatTimeToStringPtr(detail.CheckinEnd),   // Corrected casing
		BreakStart:     formatTimeToStringPtr(detail.BreakStart),
		BreakEnd:       formatTimeToStringPtr(detail.BreakEnd),
		CheckOutStart:  formatTimeToStringPtr(detail.CheckoutStart), // Corrected casing
		CheckOutEnd:    formatTimeToStringPtr(detail.CheckoutEnd),   // Corrected casing
		LocationID:     detail.LocationID,
		IsActive:       detail.IsActive,
	}

	if detail.Location != nil {
		respDetail.Location = &dtolocation.LocationResponseDTO{
			ID:            detail.Location.ID,
			Name:          detail.Location.Name,
			AddressDetail: detail.Location.AddressDetail,
			Latitude:      detail.Location.Latitude,
			Longitude:     detail.Location.Longitude,
			Radius:        float64(detail.Location.RadiusM),
		}
	}
	return respDetail
}

func toWorkScheduleResponseDTO(ws *domain.WorkSchedule) *dtoworkschedule.WorkScheduleResponseDTO {
	if ws == nil {
		return nil
	}
	details := make([]dtoworkschedule.WorkScheduleDetailResponseDTO, len(ws.Details))
	for i, d := range ws.Details {
		details[i] = *toWorkScheduleDetailResponseDTO(d)
	}
	return &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       ws.ID,
		Name:     ws.Name,
		WorkType: string(ws.WorkType),
		Details:  details,
	}
}

// Create creates a new work schedule with its details.
func (uc *WorkScheduleUseCase) Create(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	// Validate LocationID for WFO if locationRepo is available
	// For WFO, at least one detail must have a LocationID
	if workSchedule.WorkType == enums.WorkTypeWFO && uc.locationRepo != nil {
		for _, detail := range details {
			if detail.WorktypeDetail == enums.WorkTypeWFO {
				if detail.LocationID == nil {
					return nil, fmt.Errorf("location ID is required for WFO work type detail")
				}
				_, err := uc.locationRepo.GetByID(ctx, *detail.LocationID) // Convert uint to string for GetByID
				if err != nil {
					return nil, fmt.Errorf("invalid location ID %d for WFO detail: %w", *detail.LocationID, err)
				}
			}
		}
	}

	workSchedule.Details = nil // Clear details from main object as they are passed separately

	err := uc.workScheduleRepo.CreateWithDetails(ctx, workSchedule, details)
	if err != nil {
		return nil, fmt.Errorf("failed to create work schedule: %w", err)
	}

	// Fetch the newly created work schedule to get all details including IDs and preloaded Location
	createdWorkSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, workSchedule.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch created work schedule with details: %w", err)
	}

	return toWorkScheduleResponseDTO(createdWorkSchedule), nil
}

// ListByUser returns a paginated list of work schedules owned by the specified user.
func (uc *WorkScheduleUseCase) ListByUser(ctx context.Context, userID uint, paginationParams domain.PaginationParams) (*dtoworkschedule.WorkScheduleListResponseData, error) {
	workSchedules, totalItems, err := uc.workScheduleRepo.ListByUser(ctx, userID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list work schedules by user from repository: %w", err)
	}

	// Convert to DTOs
	responseDTOs := make([]*dtoworkschedule.WorkScheduleResponseDTO, len(workSchedules))
	for i, ws := range workSchedules {
		responseDTOs[i] = toWorkScheduleResponseDTO(ws)
	}

	// Calculate pagination
	totalPages := 0
	if paginationParams.PageSize > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize)))
	}
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	response := &dtoworkschedule.WorkScheduleListResponseData{
		Items: responseDTOs,
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

func (uc *WorkScheduleUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*dtoworkschedule.WorkScheduleListResponseData, error) {
	workSchedules, totalItems, err := uc.workScheduleRepo.ListWithPagination(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list work schedules: %w", err)
	}

	responseDTOs := make([]*dtoworkschedule.WorkScheduleResponseDTO, len(workSchedules))
	for i, ws := range workSchedules {
		responseDTOs[i] = toWorkScheduleResponseDTO(ws)
	}

	return &dtoworkschedule.WorkScheduleListResponseData{
		Items: responseDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize))),
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page*paginationParams.PageSize < int(totalItems),
			HasPrevPage: paginationParams.Page > 1,
		},
	}, nil
}

// GetByIDAndUser returns a work schedule by ID if it's owned by the specified user.
func (uc *WorkScheduleUseCase) GetByIDAndUser(ctx context.Context, id uint, userID uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	workSchedule, err := uc.workScheduleRepo.GetByIDAndUser(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get work schedule by ID and user: %w", err)
	}
	return toWorkScheduleResponseDTO(workSchedule), nil
}

// GetByIDForEditByUser returns a work schedule by ID with all details (including inactive) for editing, if owned by user.
func (uc *WorkScheduleUseCase) GetByIDForEditByUser(ctx context.Context, id uint, userID uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	workSchedule, err := uc.workScheduleRepo.GetByIDWithAllDetailsByUser(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get work schedule for edit by user: %w", err)
	}
	return toWorkScheduleResponseDTO(workSchedule), nil
}

// UpdateByUser updates an existing work schedule with its details if owned by user.
func (uc *WorkScheduleUseCase) UpdateByUser(
	ctx context.Context,
	id uint,
	userID uint,
	workSchedule *domain.WorkSchedule,
	details []*domain.WorkScheduleDetail,
	toDeleteIDs []uint,
) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	// Validate LocationID for WFO details if locationRepo is available
	if uc.locationRepo != nil {
		for _, detail := range details {
			if detail.WorktypeDetail == enums.WorkTypeWFO {
				if detail.LocationID == nil {
					return nil, fmt.Errorf("location ID is required for WFO work type detail")
				}
				_, err := uc.locationRepo.GetByIDAndUser(ctx, *detail.LocationID, userID)
				if err != nil {
					return nil, fmt.Errorf("invalid location ID %d for WFO detail or location does not belong to user: %w", *detail.LocationID, err)
				}
			}
		}
	}

	workSchedule.Details = nil // Clear details from main object as they are passed separately

	err := uc.workScheduleRepo.UpdateByUser(ctx, id, userID, workSchedule, details, toDeleteIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to update work schedule by user: %w", err)
	}

	// Fetch updated work schedule
	updatedWorkSchedule, err := uc.workScheduleRepo.GetByIDAndUser(ctx, id, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated work schedule: %w", err)
	}

	return toWorkScheduleResponseDTO(updatedWorkSchedule), nil
}

// DeleteByUser soft deletes a work schedule if owned by user.
func (uc *WorkScheduleUseCase) DeleteByUser(ctx context.Context, id uint, userID uint) error {
	err := uc.workScheduleRepo.DeleteByUser(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete work schedule by user: %w", err)
	}
	return nil
}

// Update updates an existing work schedule with its details.
func (uc *WorkScheduleUseCase) Update(
	ctx context.Context,
	id uint,
	workSchedule *domain.WorkSchedule,
	details []*domain.WorkScheduleDetail,
	toDeleteIDs []uint,
) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	// First, check if the work schedule exists
	existingWorkSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("work schedule with ID %d not found: %w", id, err)
	}

	// Validate LocationID for WFO details if locationRepo is available
	if uc.locationRepo != nil {
		for _, detail := range details {
			if detail.WorktypeDetail == enums.WorkTypeWFO {
				if detail.LocationID == nil {
					return nil, fmt.Errorf("location ID is required for WFO work type detail")
				}
				_, err := uc.locationRepo.GetByID(ctx, *detail.LocationID)
				if err != nil {
					return nil, fmt.Errorf("invalid location ID %d for WFO detail: %w", *detail.LocationID, err)
				}
			}
		}
	}

	// Set the ID for the work schedule to be updated
	workSchedule.ID = existingWorkSchedule.ID
	workSchedule.CreatedAt = existingWorkSchedule.CreatedAt // Preserve creation time

	// Update the work schedule with details
	err = uc.workScheduleRepo.UpdateWithDetails(ctx, workSchedule, details, toDeleteIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to update work schedule: %w", err)
	}

	// Fetch the updated work schedule to get all details including IDs and preloaded Location
	updatedWorkSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, workSchedule.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated work schedule with details: %w", err)
	}

	return toWorkScheduleResponseDTO(updatedWorkSchedule), nil
}

// GetByID retrieves a work schedule by ID with active details only
func (uc *WorkScheduleUseCase) GetByID(ctx context.Context, id uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	workSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get work schedule by ID %d: %w", id, err)
	}

	return toWorkScheduleResponseDTO(workSchedule), nil
}

// GetByIDForEdit retrieves a work schedule by ID with all details (active and inactive) for editing
func (uc *WorkScheduleUseCase) GetByIDForEdit(ctx context.Context, id uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	workSchedule, err := uc.workScheduleRepo.GetByIDWithAllDetails(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get work schedule by ID %d for editing: %w", id, err)
	}

	return toWorkScheduleResponseDTO(workSchedule), nil
}

// Delete deletes a work schedule and all its details by ID
func (uc *WorkScheduleUseCase) Delete(ctx context.Context, id uint) error {
	// First, check if the work schedule exists
	_, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, id)
	if err != nil {
		return fmt.Errorf("work schedule with ID %d not found: %w", id, err)
	}

	// Delete the work schedule and all its details
	err = uc.workScheduleRepo.DeleteWithDetails(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete work schedule with ID %d: %w", id, err)
	}

	return nil
}
