package work_Schedule

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtolocation "github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
	dtoworkschedule "github.com/SukaMajuu/hris/apps/backend/domain/dto/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestWorkScheduleUseCase_Create(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	checkInStart := time.Date(now.Year(), now.Month(), now.Day(), 9, 0, 0, 0, time.UTC)
	checkInEnd := time.Date(now.Year(), now.Month(), now.Day(), 9, 30, 0, 0, time.UTC)
	checkOutStart := time.Date(now.Year(), now.Month(), now.Day(), 17, 0, 0, 0, time.UTC)
	checkOutEnd := time.Date(now.Year(), now.Month(), now.Day(), 17, 30, 0, 0, time.UTC)

	locationID := uint(1)
	mockLocation := &domain.Location{
		ID:            locationID,
		Name:          "Main Office",
		AddressDetail: "Jl. Jend. Sudirman No. 10, Jakarta",
		Latitude:      -6.200000,
		Longitude:     106.800000,
		RadiusM:       100,
	}

	mockWorkSchedule := &domain.WorkSchedule{
		ID:        1,
		Name:      "Standard WFO Schedule",
		WorkType:  enums.WorkTypeWFO,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	mockDetails := []*domain.WorkScheduleDetail{
		{
			ID:             1,
			WorkScheduleID: 1,
			WorktypeDetail: enums.WorkTypeWFO,
			WorkDays:       []domain.Days{domain.Monday, domain.Tuesday, domain.Wednesday, domain.Thursday, domain.Friday},
			CheckinStart:   &checkInStart,
			CheckinEnd:     &checkInEnd,
			CheckoutStart:  &checkOutStart,
			CheckoutEnd:    &checkOutEnd,
			LocationID:     &locationID,
			Location:       mockLocation,
			IsActive:       true,
			CreatedAt:      now,
			UpdatedAt:      now,
		},
	}

	mockWorkScheduleWithDetails := &domain.WorkSchedule{
		ID:        1,
		Name:      "Standard WFO Schedule",
		WorkType:  enums.WorkTypeWFO,
		Details:   []domain.WorkScheduleDetail{*mockDetails[0]},
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	checkInStartStr := "09:00:00"
	checkInEndStr := "09:30:00"
	checkOutStartStr := "17:00:00"
	checkOutEndStr := "17:30:00"

	expectedResponseDTO := &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       1,
		Name:     "Standard WFO Schedule",
		WorkType: "WFO",
		Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
			{
				ID:             1,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"},
				CheckInStart:   &checkInStartStr,
				CheckInEnd:     &checkInEndStr,
				CheckOutStart:  &checkOutStartStr,
				CheckOutEnd:    &checkOutEndStr,
				LocationID:     &locationID,
				Location: &dtolocation.LocationResponseDTO{
					ID:            1,
					Name:          "Main Office",
					AddressDetail: "Jl. Jend. Sudirman No. 10, Jakarta",
					Latitude:      -6.200000,
					Longitude:     106.800000,
					Radius:        100,
				},
				IsActive: true,
			},
		},
	}

	repoError := errors.New("repository create failed")
	locationNotFoundError := gorm.ErrRecordNotFound

	tests := []struct {
		name           string
		workSchedule   *domain.WorkSchedule
		details        []*domain.WorkScheduleDetail
		setupMocks     func(*mocks.WorkScheduleRepository, *mocks.LocationRepository)
		expectedResult *dtoworkschedule.WorkScheduleResponseDTO
		expectedError  string
	}{
		{
			name:         "successful WFO work schedule creation",
			workSchedule: mockWorkSchedule,
			details:      mockDetails,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				locRepo.On("GetByID", ctx, locationID).Return(mockLocation, nil)
				wsRepo.On("CreateWithDetails", ctx, mock.MatchedBy(func(ws *domain.WorkSchedule) bool {
					return ws.Name == "Standard WFO Schedule" && ws.WorkType == enums.WorkTypeWFO && ws.Details == nil
				}), mockDetails).Return(nil)
				wsRepo.On("GetByIDWithDetails", ctx, uint(1)).Return(mockWorkScheduleWithDetails, nil)
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name: "successful WFH work schedule creation",
			workSchedule: &domain.WorkSchedule{
				ID:       1,
				Name:     "Remote Schedule",
				WorkType: enums.WorkTypeWFH,
				IsActive: true,
			},
			details: []*domain.WorkScheduleDetail{
				{
					WorkScheduleID: 1,
					WorktypeDetail: enums.WorkTypeWFH,
					WorkDays:       []domain.Days{domain.Monday, domain.Tuesday, domain.Wednesday, domain.Thursday, domain.Friday},
					CheckinStart:   &checkInStart,
					CheckinEnd:     &checkInEnd,
					CheckoutStart:  &checkOutStart,
					CheckoutEnd:    &checkOutEnd,
					IsActive:       true,
				},
			},
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				wsRepo.On("CreateWithDetails", ctx, mock.AnythingOfType("*domain.WorkSchedule"), mock.AnythingOfType("[]*domain.WorkScheduleDetail")).Return(nil)
				wsRepo.On("GetByIDWithDetails", ctx, uint(1)).Return(&domain.WorkSchedule{
					ID:       1,
					Name:     "Remote Schedule",
					WorkType: enums.WorkTypeWFH,
					Details: []domain.WorkScheduleDetail{
						{
							ID:             1,
							WorkScheduleID: 1,
							WorktypeDetail: enums.WorkTypeWFH,
							WorkDays:       []domain.Days{domain.Monday, domain.Tuesday, domain.Wednesday, domain.Thursday, domain.Friday},
							CheckinStart:   &checkInStart,
							CheckinEnd:     &checkInEnd,
							CheckoutStart:  &checkOutStart,
							CheckoutEnd:    &checkOutEnd,
							IsActive:       true,
						},
					},
					IsActive: true,
				}, nil)
			},
			expectedResult: &dtoworkschedule.WorkScheduleResponseDTO{
				ID:       1,
				Name:     "Remote Schedule",
				WorkType: "WFH",
				Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
					{
						ID:             1,
						WorkTypeDetail: "WFH",
						WorkDays:       []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"},
						CheckInStart:   &checkInStartStr,
						CheckInEnd:     &checkInEndStr,
						CheckOutStart:  &checkOutStartStr,
						CheckOutEnd:    &checkOutEndStr,
						LocationID:     nil,
						Location:       nil,
						IsActive:       true,
					},
				},
			},
			expectedError: "",
		},
		{
			name:         "WFO without location ID should fail",
			workSchedule: mockWorkSchedule,
			details: []*domain.WorkScheduleDetail{
				{
					WorkScheduleID: 1,
					WorktypeDetail: enums.WorkTypeWFO,
					WorkDays:       []domain.Days{domain.Monday, domain.Tuesday},
					LocationID:     nil, // Missing location ID for WFO
					IsActive:       true,
				},
			},
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				// No mocks needed as validation should fail before repository calls
			},
			expectedResult: nil,
			expectedError:  "location ID is required for WFO work type detail",
		},
		{
			name:         "WFO with invalid location ID should fail",
			workSchedule: mockWorkSchedule,
			details:      mockDetails,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				locRepo.On("GetByID", ctx, locationID).Return(nil, locationNotFoundError)
			},
			expectedResult: nil,
			expectedError:  "invalid location ID",
		},
		{
			name:         "repository create error",
			workSchedule: mockWorkSchedule,
			details:      mockDetails,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				locRepo.On("GetByID", ctx, locationID).Return(mockLocation, nil)
				wsRepo.On("CreateWithDetails", ctx, mock.AnythingOfType("*domain.WorkSchedule"), mockDetails).Return(repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to create work schedule",
		},
		{
			name:         "repository get after create error",
			workSchedule: mockWorkSchedule,
			details:      mockDetails,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				locRepo.On("GetByID", ctx, locationID).Return(mockLocation, nil)
				wsRepo.On("CreateWithDetails", ctx, mock.AnythingOfType("*domain.WorkSchedule"), mockDetails).Return(nil)
				wsRepo.On("GetByIDWithDetails", ctx, uint(1)).Return(nil, repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to fetch created work schedule with details",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
			mockLocationRepo := new(mocks.LocationRepository)
			tt.setupMocks(mockWorkScheduleRepo, mockLocationRepo)

			useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, mockLocationRepo)
			result, err := useCase.Create(ctx, tt.workSchedule, tt.details)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockWorkScheduleRepo.AssertExpectations(t)
			mockLocationRepo.AssertExpectations(t)
		})
	}
}

func TestWorkScheduleUseCase_List(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}

	mockWorkSchedule := &domain.WorkSchedule{
		ID:       1,
		Name:     "Standard Schedule",
		WorkType: enums.WorkTypeWFO,
		Details: []domain.WorkScheduleDetail{
			{
				ID:             1,
				WorkScheduleID: 1,
				WorktypeDetail: enums.WorkTypeWFO,
				WorkDays:       []domain.Days{domain.Monday, domain.Tuesday},
				IsActive:       true,
			},
		},
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	mockWorkSchedules := []*domain.WorkSchedule{mockWorkSchedule}
	var mockTotalItems int64 = 1

	expectedResponseDTO := &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       1,
		Name:     "Standard Schedule",
		WorkType: "WFO",
		Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
			{
				ID:             1,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Monday", "Tuesday"},
				CheckInStart:   nil,
				CheckInEnd:     nil,
				BreakStart:     nil,
				BreakEnd:       nil,
				CheckOutStart:  nil,
				CheckOutEnd:    nil,
				LocationID:     nil,
				Location:       nil,
				IsActive:       true,
			},
		},
	}

	expectedSuccessResponseData := &dtoworkschedule.WorkScheduleListResponseData{
		Items: []*dtoworkschedule.WorkScheduleResponseDTO{expectedResponseDTO},
		Pagination: domain.Pagination{
			TotalItems:  mockTotalItems,
			TotalPages:  1,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: false,
			HasPrevPage: false,
		},
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name           string
		setupMocks     func(*mocks.WorkScheduleRepository)
		expectedResult *dtoworkschedule.WorkScheduleListResponseData
		expectedError  string
	}{
		{
			name: "successful list work schedules",
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("ListWithPagination", ctx, paginationParams).Return(mockWorkSchedules, mockTotalItems, nil)
			},
			expectedResult: expectedSuccessResponseData,
			expectedError:  "",
		},
		{
			name: "repository error",
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("ListWithPagination", ctx, paginationParams).Return(nil, int64(0), repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to list work schedules",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
			mockLocationRepo := new(mocks.LocationRepository)
			tt.setupMocks(mockWorkScheduleRepo)

			useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, mockLocationRepo)
			result, err := useCase.List(ctx, paginationParams)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockWorkScheduleRepo.AssertExpectations(t)
		})
	}
}

func TestWorkScheduleUseCase_GetByID(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	workScheduleID := uint(1)

	mockWorkSchedule := &domain.WorkSchedule{
		ID:       workScheduleID,
		Name:     "Standard Schedule",
		WorkType: enums.WorkTypeWFO,
		Details: []domain.WorkScheduleDetail{
			{
				ID:             1,
				WorkScheduleID: workScheduleID,
				WorktypeDetail: enums.WorkTypeWFO,
				WorkDays:       []domain.Days{domain.Monday, domain.Tuesday},
				IsActive:       true,
			},
		},
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	expectedResponseDTO := &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       workScheduleID,
		Name:     "Standard Schedule",
		WorkType: "WFO",
		Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
			{
				ID:             1,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Monday", "Tuesday"},
				CheckInStart:   nil,
				CheckInEnd:     nil,
				BreakStart:     nil,
				BreakEnd:       nil,
				CheckOutStart:  nil,
				CheckOutEnd:    nil,
				LocationID:     nil,
				Location:       nil,
				IsActive:       true,
			},
		},
	}

	notFoundError := gorm.ErrRecordNotFound

	tests := []struct {
		name           string
		workScheduleID uint
		setupMocks     func(*mocks.WorkScheduleRepository)
		expectedResult *dtoworkschedule.WorkScheduleResponseDTO
		expectedError  string
	}{
		{
			name:           "successful get work schedule by ID",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithDetails", ctx, workScheduleID).Return(mockWorkSchedule, nil)
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name:           "work schedule not found",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithDetails", ctx, workScheduleID).Return(nil, notFoundError)
			},
			expectedResult: nil,
			expectedError:  "failed to get work schedule by ID",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
			mockLocationRepo := new(mocks.LocationRepository)
			tt.setupMocks(mockWorkScheduleRepo)

			useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, mockLocationRepo)
			result, err := useCase.GetByID(ctx, tt.workScheduleID)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockWorkScheduleRepo.AssertExpectations(t)
		})
	}
}

func TestWorkScheduleUseCase_GetByIDForEdit(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	workScheduleID := uint(1)

	mockWorkSchedule := &domain.WorkSchedule{
		ID:       workScheduleID,
		Name:     "Standard Schedule",
		WorkType: enums.WorkTypeWFO,
		Details: []domain.WorkScheduleDetail{
			{
				ID:             1,
				WorkScheduleID: workScheduleID,
				WorktypeDetail: enums.WorkTypeWFO,
				WorkDays:       []domain.Days{domain.Monday, domain.Tuesday},
				IsActive:       true,
			},
			{
				ID:             2,
				WorkScheduleID: workScheduleID,
				WorktypeDetail: enums.WorkTypeWFO,
				WorkDays:       []domain.Days{domain.Saturday},
				IsActive:       false, // Inactive detail for editing
			},
		},
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	expectedResponseDTO := &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       workScheduleID,
		Name:     "Standard Schedule",
		WorkType: "WFO",
		Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
			{
				ID:             1,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Monday", "Tuesday"},
				CheckInStart:   nil,
				CheckInEnd:     nil,
				BreakStart:     nil,
				BreakEnd:       nil,
				CheckOutStart:  nil,
				CheckOutEnd:    nil,
				LocationID:     nil,
				Location:       nil,
				IsActive:       true,
			},
			{
				ID:             2,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Saturday"},
				CheckInStart:   nil,
				CheckInEnd:     nil,
				BreakStart:     nil,
				BreakEnd:       nil,
				CheckOutStart:  nil,
				CheckOutEnd:    nil,
				LocationID:     nil,
				Location:       nil,
				IsActive:       false,
			},
		},
	}

	notFoundError := gorm.ErrRecordNotFound

	tests := []struct {
		name           string
		workScheduleID uint
		setupMocks     func(*mocks.WorkScheduleRepository)
		expectedResult *dtoworkschedule.WorkScheduleResponseDTO
		expectedError  string
	}{
		{
			name:           "successful get work schedule by ID for edit",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithAllDetails", ctx, workScheduleID).Return(mockWorkSchedule, nil)
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name:           "work schedule not found for edit",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithAllDetails", ctx, workScheduleID).Return(nil, notFoundError)
			},
			expectedResult: nil,
			expectedError:  "failed to get work schedule by ID 1 for editing",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
			mockLocationRepo := new(mocks.LocationRepository)
			tt.setupMocks(mockWorkScheduleRepo)

			useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, mockLocationRepo)
			result, err := useCase.GetByIDForEdit(ctx, tt.workScheduleID)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockWorkScheduleRepo.AssertExpectations(t)
		})
	}
}

func TestWorkScheduleUseCase_Update(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	workScheduleID := uint(1)
	locationID := uint(1)

	checkInStart := time.Date(now.Year(), now.Month(), now.Day(), 9, 0, 0, 0, time.UTC)
	checkInEnd := time.Date(now.Year(), now.Month(), now.Day(), 9, 30, 0, 0, time.UTC)

	mockLocation := &domain.Location{
		ID:            locationID,
		Name:          "Main Office",
		AddressDetail: "Jl. Jend. Sudirman No. 10, Jakarta",
		Latitude:      -6.200000,
		Longitude:     106.800000,
		RadiusM:       100,
	}

	existingWorkSchedule := &domain.WorkSchedule{
		ID:        workScheduleID,
		Name:      "Old Schedule",
		WorkType:  enums.WorkTypeWFO,
		IsActive:  true,
		CreatedAt: now.Add(-24 * time.Hour), // Created yesterday
		UpdatedAt: now.Add(-1 * time.Hour),  // Updated 1 hour ago
	}

	updateWorkSchedule := &domain.WorkSchedule{
		Name:     "Updated Schedule",
		WorkType: enums.WorkTypeWFO,
		IsActive: true,
	}

	updateDetails := []*domain.WorkScheduleDetail{
		{
			WorkScheduleID: workScheduleID,
			WorktypeDetail: enums.WorkTypeWFO,
			WorkDays:       []domain.Days{domain.Monday, domain.Tuesday, domain.Wednesday},
			CheckinStart:   &checkInStart,
			CheckinEnd:     &checkInEnd,
			LocationID:     &locationID,
			IsActive:       true,
		},
	}

	toDeleteIDs := []uint{2, 3}

	updatedWorkScheduleWithDetails := &domain.WorkSchedule{
		ID:        workScheduleID,
		Name:      "Updated Schedule",
		WorkType:  enums.WorkTypeWFO,
		Details:   []domain.WorkScheduleDetail{*updateDetails[0]},
		IsActive:  true,
		CreatedAt: existingWorkSchedule.CreatedAt,
		UpdatedAt: now,
	}
	updatedWorkScheduleWithDetails.Details[0].ID = 1
	updatedWorkScheduleWithDetails.Details[0].Location = mockLocation

	checkInStartStr := "09:00:00"
	checkInEndStr := "09:30:00"

	expectedResponseDTO := &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       workScheduleID,
		Name:     "Updated Schedule",
		WorkType: "WFO",
		Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
			{
				ID:             1,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Monday", "Tuesday", "Wednesday"},
				CheckInStart:   &checkInStartStr,
				CheckInEnd:     &checkInEndStr,
				CheckOutStart:  nil,
				CheckOutEnd:    nil,
				LocationID:     &locationID,
				Location: &dtolocation.LocationResponseDTO{
					ID:            1,
					Name:          "Main Office",
					AddressDetail: "Jl. Jend. Sudirman No. 10, Jakarta",
					Latitude:      -6.200000,
					Longitude:     106.800000,
					Radius:        100,
				},
				IsActive: true,
			},
		},
	}

	notFoundError := gorm.ErrRecordNotFound
	repoError := errors.New("repository update failed")

	tests := []struct {
		name           string
		workScheduleID uint
		workSchedule   *domain.WorkSchedule
		details        []*domain.WorkScheduleDetail
		toDeleteIDs    []uint
		setupMocks     func(*mocks.WorkScheduleRepository, *mocks.LocationRepository)
		expectedResult *dtoworkschedule.WorkScheduleResponseDTO
		expectedError  string
	}{
		{
			name:           "successful work schedule update",
			workScheduleID: workScheduleID,
			workSchedule:   updateWorkSchedule,
			details:        updateDetails,
			toDeleteIDs:    toDeleteIDs,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				wsRepo.On("GetByIDWithDetails", ctx, workScheduleID).Return(existingWorkSchedule, nil).Once()
				locRepo.On("GetByID", ctx, locationID).Return(mockLocation, nil)
				wsRepo.On("UpdateWithDetails", ctx, mock.MatchedBy(func(ws *domain.WorkSchedule) bool {
					return ws.ID == workScheduleID && ws.Name == "Updated Schedule" && ws.CreatedAt.Equal(existingWorkSchedule.CreatedAt)
				}), updateDetails, toDeleteIDs).Return(nil)
				wsRepo.On("GetByIDWithDetails", ctx, workScheduleID).Return(updatedWorkScheduleWithDetails, nil).Once()
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name:           "work schedule not found",
			workScheduleID: workScheduleID,
			workSchedule:   updateWorkSchedule,
			details:        updateDetails,
			toDeleteIDs:    toDeleteIDs,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				wsRepo.On("GetByIDWithDetails", ctx, workScheduleID).Return(nil, notFoundError)
			},
			expectedResult: nil,
			expectedError:  "work schedule with ID 1 not found",
		},
		{
			name:           "invalid location ID for WFO detail",
			workScheduleID: workScheduleID,
			workSchedule:   updateWorkSchedule,
			details:        updateDetails,
			toDeleteIDs:    toDeleteIDs,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				wsRepo.On("GetByIDWithDetails", ctx, workScheduleID).Return(existingWorkSchedule, nil)
				locRepo.On("GetByID", ctx, locationID).Return(nil, notFoundError)
			},
			expectedResult: nil,
			expectedError:  "invalid location ID 1 for WFO detail",
		},
		{
			name:           "repository update error",
			workScheduleID: workScheduleID,
			workSchedule:   updateWorkSchedule,
			details:        updateDetails,
			toDeleteIDs:    toDeleteIDs,
			setupMocks: func(wsRepo *mocks.WorkScheduleRepository, locRepo *mocks.LocationRepository) {
				wsRepo.On("GetByIDWithDetails", ctx, workScheduleID).Return(existingWorkSchedule, nil).Once()
				locRepo.On("GetByID", ctx, locationID).Return(mockLocation, nil)
				wsRepo.On("UpdateWithDetails", ctx, mock.AnythingOfType("*domain.WorkSchedule"), updateDetails, toDeleteIDs).Return(repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to update work schedule",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
			mockLocationRepo := new(mocks.LocationRepository)
			tt.setupMocks(mockWorkScheduleRepo, mockLocationRepo)

			useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, mockLocationRepo)
			result, err := useCase.Update(ctx, tt.workScheduleID, tt.workSchedule, tt.details, tt.toDeleteIDs)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockWorkScheduleRepo.AssertExpectations(t)
			mockLocationRepo.AssertExpectations(t)
		})
	}
}

func TestWorkScheduleUseCase_Delete(t *testing.T) {
	ctx := context.Background()
	workScheduleID := uint(1)
	now := time.Now()

	existingWorkSchedule := &domain.WorkSchedule{
		ID:        workScheduleID,
		Name:      "Schedule to Delete",
		WorkType:  enums.WorkTypeWFO,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	notFoundError := gorm.ErrRecordNotFound
	repoError := errors.New("repository delete failed")

	tests := []struct {
		name           string
		workScheduleID uint
		setupMocks     func(*mocks.WorkScheduleRepository)
		expectedError  string
	}{
		{
			name:           "successful work schedule deletion",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithDetails", ctx, workScheduleID).Return(existingWorkSchedule, nil)
				repo.On("DeleteWithDetails", ctx, workScheduleID).Return(nil)
			},
			expectedError: "",
		},
		{
			name:           "work schedule not found",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithDetails", ctx, workScheduleID).Return(nil, notFoundError)
			},
			expectedError: "work schedule with ID 1 not found",
		},
		{
			name:           "repository delete error",
			workScheduleID: workScheduleID,
			setupMocks: func(repo *mocks.WorkScheduleRepository) {
				repo.On("GetByIDWithDetails", ctx, workScheduleID).Return(existingWorkSchedule, nil)
				repo.On("DeleteWithDetails", ctx, workScheduleID).Return(repoError)
			},
			expectedError: "failed to delete work schedule with ID 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
			mockLocationRepo := new(mocks.LocationRepository)
			tt.setupMocks(mockWorkScheduleRepo)

			useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, mockLocationRepo)
			err := useCase.Delete(ctx, tt.workScheduleID)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockWorkScheduleRepo.AssertExpectations(t)
		})
	}
}

func TestWorkScheduleUseCase_CreateWithoutLocationRepo(t *testing.T) {
	ctx := context.Background()

	mockWorkSchedule := &domain.WorkSchedule{
		ID:       1,
		Name:     "WFO Schedule Without Location Validation",
		WorkType: enums.WorkTypeWFO,
		IsActive: true,
	}

	locationID := uint(1)
	mockDetails := []*domain.WorkScheduleDetail{
		{
			WorkScheduleID: 1,
			WorktypeDetail: enums.WorkTypeWFO,
			WorkDays:       []domain.Days{domain.Monday, domain.Tuesday},
			LocationID:     &locationID,
			IsActive:       true,
		},
	}

	mockWorkScheduleWithDetails := &domain.WorkSchedule{
		ID:       1,
		Name:     "WFO Schedule Without Location Validation",
		WorkType: enums.WorkTypeWFO,
		Details:  []domain.WorkScheduleDetail{*mockDetails[0]},
		IsActive: true,
	}

	expectedResponseDTO := &dtoworkschedule.WorkScheduleResponseDTO{
		ID:       1,
		Name:     "WFO Schedule Without Location Validation",
		WorkType: "WFO",
		Details: []dtoworkschedule.WorkScheduleDetailResponseDTO{
			{
				ID:             0,
				WorkTypeDetail: "WFO",
				WorkDays:       []string{"Monday", "Tuesday"},
				CheckInStart:   nil,
				CheckInEnd:     nil,
				BreakStart:     nil,
				BreakEnd:       nil,
				CheckOutStart:  nil,
				CheckOutEnd:    nil,
				LocationID:     &locationID,
				Location:       nil,
				IsActive:       true,
			},
		},
	}

	mockWorkScheduleRepo := new(mocks.WorkScheduleRepository)
	mockWorkScheduleRepo.On("CreateWithDetails", ctx, mock.AnythingOfType("*domain.WorkSchedule"), mockDetails).Return(nil)
	mockWorkScheduleRepo.On("GetByIDWithDetails", ctx, uint(1)).Return(mockWorkScheduleWithDetails, nil)

	// Create usecase without location repository (nil)
	useCase := NewWorkScheduleUseCase(mockWorkScheduleRepo, nil)
	result, err := useCase.Create(ctx, mockWorkSchedule, mockDetails)

	assert.NoError(t, err)
	assert.Equal(t, expectedResponseDTO, result)
	mockWorkScheduleRepo.AssertExpectations(t)
}
