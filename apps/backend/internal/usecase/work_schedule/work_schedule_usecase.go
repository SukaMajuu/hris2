package work_Schedule

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
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
	}

	if detail.Location != nil {
		respDetail.LocationName = &detail.Location.Name
		respDetail.LocationAddress = &detail.Location.AddressDetail
		respDetail.LocationLat = detail.Location.Latitude
		respDetail.LocationLong = detail.Location.Longitude
		respDetail.Radius = float64(detail.Location.RadiusM)
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

func (uc *WorkScheduleUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*domain.WorkScheduleListResponseData, error) {
	workSchedules, totalItems, err := uc.workScheduleRepo.ListWithPagination(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list work schedules: %w", err)
	}

	responseDTOs := make([]*dtoworkschedule.WorkScheduleResponseDTO, len(workSchedules))
	for i, ws := range workSchedules {
		responseDTOs[i] = toWorkScheduleResponseDTO(ws)
	}

	return &domain.WorkScheduleListResponseData{
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

// Update updates an existing work schedule with its details.
func (uc *WorkScheduleUseCase) Update(ctx context.Context, id uint, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, toDeleteIDs []uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
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

// GetByID retrieves a work schedule by ID with all its details
func (uc *WorkScheduleUseCase) GetByID(ctx context.Context, id uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	workSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get work schedule by ID %d: %w", id, err)
	}

	return toWorkScheduleResponseDTO(workSchedule), nil
}
