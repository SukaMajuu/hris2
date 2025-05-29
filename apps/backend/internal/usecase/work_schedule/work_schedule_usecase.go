package work_Schedule

import (
	"context"
	"fmt"

	// "math" // Added for pagination calculation
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

/*
// GetByID retrieves a work schedule by its ID with details.
func (uc *WorkScheduleUseCase) GetByID(ctx context.Context, scheduleID uint) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	workSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get work schedule by ID %d: %w", scheduleID, err)
	}
	if workSchedule == nil {
		return nil, fmt.Errorf("work schedule with ID %d not found", scheduleID)
	}
	return toWorkScheduleResponseDTO(workSchedule), nil
}

// List retrieves a list of work schedules with pagination.
func (uc *WorkScheduleUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*domain.WorkScheduleListResponseData, error) {
	schedules, totalItems, err := uc.workScheduleRepo.ListWithPagination(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list work schedules: %w", err)
	}

	responseDTOs := make([]*dtoworkschedule.WorkScheduleResponseDTO, len(schedules))
	for i, schedule := range schedules {
		responseDTOs[i] = toWorkScheduleResponseDTO(schedule)
	}

	totalPages := 0
	// if paginationParams.PageSize > 0 {
	// 	totalPages = int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize)))
	// }
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	return &domain.WorkScheduleListResponseData{
		Items: responseDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page < totalPages,
			HasPrevPage: paginationParams.Page > 1 && paginationParams.Page <= totalPages,
		},
	}, nil
}

// Update updates an existing work schedule and its details.
// detailsToSave should include new details (ID=0) and existing details to be updated (ID>0).
func (uc *WorkScheduleUseCase) Update(
	ctx context.Context,
	scheduleID uint,
	updatedScheduleData *domain.WorkSchedule,
	detailsToSave []*domain.WorkScheduleDetail,
	detailIDsToDelete []uint,
) (*dtoworkschedule.WorkScheduleResponseDTO, error) {
	// Fetch existing schedule to ensure it exists and to apply partial updates
	existingSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch work schedule for update (ID: %d): %w", scheduleID, err)
	}
	if existingSchedule == nil {
		return nil, fmt.Errorf("work schedule with ID %d not found for update", scheduleID)
	}

	// Apply updates to the main schedule fields if provided
	if updatedScheduleData.Name != "" {
		existingSchedule.Name = updatedScheduleData.Name
	}
	if updatedScheduleData.WorkType != "" { // Assuming empty string means no change
		existingSchedule.WorkType = updatedScheduleData.WorkType
	}

	// Validate LocationID for WFO in detailsToSave
	for _, detail := range detailsToSave {
		detail.WorkScheduleID = scheduleID // Ensure WorkScheduleID is set for new/updated details
		if detail.WorktypeDetail == enums.WorkTypeWFO && detail.LocationID != nil { // Corrected casing
			if uc.locationRepo != nil {
				exists, errLoc := uc.locationRepo.Exists(ctx, fmt.Sprintf("%d", *detail.LocationID))
				if errLoc != nil {
					return nil, fmt.Errorf("failed to verify location ID %d: %w", *detail.LocationID, errLoc)
				}
				if !exists {
					return nil, fmt.Errorf("location ID %d does not exist", *detail.LocationID)
				}
			}
		} else if detail.WorktypeDetail == enums.WorkTypeWFA { // Corrected casing
			detail.LocationID = nil // Ensure LocationID is nil for WFA
		}
	}

	// The repository's SaveWithDetails should handle creation of new details,
	// update of existing ones, and deletion of specified ones.
	err = uc.workScheduleRepo.SaveWithDetails(ctx, existingSchedule, detailsToSave, detailIDsToDelete)
	if err != nil {
		return nil, fmt.Errorf("failed to save work schedule (ID: %d): %w", scheduleID, err)
	}

	// Fetch the updated schedule to return the latest state
	finalSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated work schedule (ID: %d): %w", scheduleID, err)
	}
	return toWorkScheduleResponseDTO(finalSchedule), nil
}

// Delete removes a work schedule by its ID.
func (uc *WorkScheduleUseCase) Delete(ctx context.Context, scheduleID uint) error {
	err := uc.workScheduleRepo.DeleteSchedule(ctx, scheduleID)
	if err != nil {
		return fmt.Errorf("failed to delete work schedule (ID: %d): %w", scheduleID, err)
	}
	return nil
}

// AddDetailToSchedule adds a new detail to an existing work schedule.
func (uc *WorkScheduleUseCase) AddDetailToSchedule(ctx context.Context, scheduleID uint, detail *domain.WorkScheduleDetail) (*dtoworkschedule.WorkScheduleDetailResponseDTO, error) {
	// Ensure schedule exists
	existingSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch work schedule (ID: %d) for adding detail: %w", scheduleID, err)
	}
	if existingSchedule == nil {
		return nil, fmt.Errorf("work schedule with ID %d not found", scheduleID)
	}

	detail.WorkScheduleID = scheduleID // Set the foreign key

	// Validate LocationID for WFO
	if detail.WorktypeDetail == enums.WorkTypeWFO && detail.LocationID != nil { // Corrected casing
		if uc.locationRepo != nil {
			exists, errLoc := uc.locationRepo.Exists(ctx, fmt.Sprintf("%d", *detail.LocationID))
			if errLoc != nil {
				return nil, fmt.Errorf("failed to verify location ID %d: %w", *detail.LocationID, errLoc)
			}
			if !exists {
				return nil, fmt.Errorf("location ID %d does not exist", *detail.LocationID)
			}
		}
	} else if detail.WorktypeDetail == enums.WorkTypeWFA { // Corrected casing
		detail.LocationID = nil // Ensure LocationID is nil for WFA
	}

	// Save the single detail. This might require a specific repository method
	// or an adaptation of SaveWithDetails (e.g., passing existingSchedule, []*domain.WorkScheduleDetail{detail}, nil)
	// For simplicity, let's assume SaveWithDetails can handle adding one detail if others are empty.
	err = uc.workScheduleRepo.SaveWithDetails(ctx, existingSchedule, []*domain.WorkScheduleDetail{detail}, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to add detail to work schedule (ID: %d): %w", scheduleID, err)
	}

	// To return the created detail with its ID, we might need to fetch it specifically
	// or rely on SaveWithDetails to populate the ID in the passed 'detail' object.
	// Assuming 'detail.ID' is populated by SaveWithDetails or a subsequent fetch is needed.
	// For now, let's fetch the whole schedule again and find the detail (simplest if detail ID isn't directly returned/populated)
	updatedSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, scheduleID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch updated schedule: %w", err)
	}

	// Find the newly added or updated detail to return its DTO
	// This is a bit inefficient; ideally, the save operation would return the ID or the saved detail.
	var savedDetailDTO *dtoworkschedule.WorkScheduleDetailResponseDTO
	for _, d := range updatedSchedule.Details {
		// Heuristic: match by content if ID is not yet known or if it's an update
		// If 'detail' had an ID > 0 (update), match by that. If ID == 0 (new), this won't work well without more info.
		// For a newly added detail, its ID would be set by the DB.
		// This part needs a robust way to identify the *specific* detail that was just added/updated.
		// Let's assume for now the last detail added is the one if ID was 0.
		// Or if the repo populates the ID in the 'detail' object passed to SaveWithDetails:
		if detail.ID != 0 { // If ID was populated by the save operation
			if d.ID == detail.ID {
				savedDetailDTO = toWorkScheduleDetailResponseDTO(d)
				break
			}
		}
	}
	// If still not found (e.g. ID was not populated or it's a new item and we can't identify it easily)
	// return the last one as a placeholder for a more robust solution
	if savedDetailDTO == nil && len(updatedSchedule.Details) > 0 {
		// This is a fallback, not ideal for identifying the *correct* added/updated detail
		// without its ID being populated in the input 'detail' object by the repo.
		// For now, we'll assume the handler will fetch the whole schedule if it needs the specific detail.
		// Let's simplify: the AddDetailToSchedule might not need to return the specific detail DTO.
		// The caller can then fetch the whole schedule.
		// For now, I will remove the return of specific detail DTO from AddDetailToSchedule
		// and let the handler decide how to get the response.
		// The method signature will be: AddDetailToSchedule(ctx context.Context, scheduleID uint, detail *domain.WorkScheduleDetail) error
	}

	// Returning the DTO of the *first* detail found with the new ID (if populated)
	// This part is tricky without knowing if \`detail.ID\` gets populated by \`SaveWithDetails\`
	// For now, let's assume the caller will refetch the schedule if needed.
	// The primary goal is to save the detail.
	// If \`detail.ID\` is populated by \`SaveWithDetails\`, we can find it.
	if detail.ID != 0 { // Check if ID was populated
		for _, d := range updatedSchedule.Details {
			if d.ID == detail.ID {
				return toWorkScheduleDetailResponseDTO(d), nil
			}
		}
	}
	// If not found or ID not populated, return error or nil (indicating success but no specific DTO)
	// For now, let's return nil, error to indicate success of operation, and the caller can refetch.
	return nil, fmt.Errorf("added detail could not be uniquely identified in the response; please refetch the schedule")
}

// RemoveDetailFromSchedule removes a detail from an existing work schedule.
func (uc *WorkScheduleUseCase) RemoveDetailFromSchedule(ctx context.Context, scheduleID uint, detailID uint) error {
	existingSchedule, err := uc.workScheduleRepo.GetByIDWithDetails(ctx, scheduleID)
	if err != nil {
		return fmt.Errorf("failed to fetch work schedule (ID: %d) for removing detail: %w", scheduleID, err)
	}
	if existingSchedule == nil {
		return fmt.Errorf("work schedule with ID %d not found", scheduleID)
	}

	// Check if the detail to be deleted actually belongs to this schedule
	found := false
	for _, d := range existingSchedule.Details {
		if d.ID == detailID {
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("detail with ID %d not found in work schedule ID %d", detailID, scheduleID)
	}

	// Business rule: "delete a work schedule detail if the work schedule has more than 1 work schedule detail"
	// This implies we should not delete the last detail.
	if len(existingSchedule.Details) <= 1 {
		return fmt.Errorf("cannot remove the last detail from work schedule ID %d", scheduleID)
	}

	err = uc.workScheduleRepo.SaveWithDetails(ctx, existingSchedule, nil, []uint{detailID})
	if err != nil {
		return fmt.Errorf("failed to remove detail (ID: %d) from work schedule (ID: %d): %w", detailID, scheduleID, err)
	}
	return nil
}
*/
