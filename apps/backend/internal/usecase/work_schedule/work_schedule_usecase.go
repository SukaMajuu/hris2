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
	for _, detail := range details {
		if detail.WorktypeDetail == enums.WorkTypeWFO && detail.LocationID != nil { // Corrected casing
			if uc.locationRepo != nil { // Check if locationRepo is provided
				exists, err := uc.locationRepo.Exists(ctx, fmt.Sprintf("%d", *detail.LocationID))
				if err != nil {
					return nil, fmt.Errorf("failed to verify location ID %d: %w", *detail.LocationID, err)
				}
				if !exists {
					return nil, fmt.Errorf("location ID %d does not exist", *detail.LocationID)
				}
			}
		} else if detail.WorktypeDetail == enums.WorkTypeWFA { // Corrected casing
			detail.LocationID = nil // Ensure LocationID is nil for WFA
		}
	}

	workSchedule.Details = nil // Clear details from main object as they are passed separately
	err := uc.workScheduleRepo.CreateWithDetails(ctx, workSchedule, details)
	if err != nil {
		return nil, fmt.Errorf("failed to create work schedule: %w", err)
	}

	// Fetch the newly created work schedule to get all details including IDs and preloaded Location
	createdScheduleWithDetails, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, workSchedule.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch created work schedule with details: %w", err)
	}
	return toWorkScheduleResponseDTO(createdScheduleWithDetails), nil
}

func (uc *WorkScheduleUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*domain.WorkScheduleListResponseData, error) {
	domainWorkSchedules, totalItems, err := uc.workScheduleRepo.ListWithPagination(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list work schedules from repository: %w", err)
	}

	workScheduleDTOs := make([]*dtoworkschedule.WorkScheduleResponseDTO, len(domainWorkSchedules))
	for i, ws := range domainWorkSchedules {
		workScheduleDTOs[i] = toWorkScheduleResponseDTO(ws)
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

	response := &domain.WorkScheduleListResponseData{
		Items: workScheduleDTOs,
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
