package location

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtolocation "github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
)

func TestLocationUseCase_List(t *testing.T) {
	ctx := context.Background()
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}

	mockDomainLoc := &domain.Location{
		ID:            1,
		Name:          "Test Location",
		AddressDetail: "Jl. Jend. Sudirman No. 10, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11111, Indonesia",
		Latitude:      -6.200000,
		Longitude:     106.800000,
		RadiusM:       100,
	}
	mockDomainLocations := []*domain.Location{mockDomainLoc}
	var mockTotalItems int64 = 1

	expectedLocationDTO := &dtolocation.LocationResponseDTO{
		ID:            mockDomainLoc.ID,
		Name:          mockDomainLoc.Name,
		AddressDetail: mockDomainLoc.AddressDetail,
		Latitude:      mockDomainLoc.Latitude,
		Longitude:     mockDomainLoc.Longitude,
		Radius:        float64(mockDomainLoc.RadiusM),
	}

	expectedSuccessResponseData := &dtolocation.LocationListResponseData{
		Items: []*dtolocation.LocationResponseDTO{expectedLocationDTO},
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
		name               string
		mockRepoLocations  []*domain.Location
		mockRepoTotalItems int64
		mockRepoError      error
		expectedResponse   *dtolocation.LocationListResponseData
		expectedErrorMsg   string
		checkErrorIs       error
	}{
		{
			name:               "successful retrieval",
			mockRepoLocations:  mockDomainLocations,
			mockRepoTotalItems: mockTotalItems,
			mockRepoError:      nil,
			expectedResponse:   expectedSuccessResponseData,
			expectedErrorMsg:   "",
		},
		{
			name:               "repository returns an error",
			mockRepoLocations:  nil,
			mockRepoTotalItems: 0,
			mockRepoError:      repoError,
			expectedResponse:   nil,
			expectedErrorMsg:   fmt.Errorf("failed to list locations from repository: %w", repoError).Error(),
			checkErrorIs:       repoError,
		},
		{
			name:               "repository returns no locations",
			mockRepoLocations:  []*domain.Location{},
			mockRepoTotalItems: 0,
			mockRepoError:      nil,
			expectedResponse: &dtolocation.LocationListResponseData{
				Items: []*dtolocation.LocationResponseDTO{},
				Pagination: domain.Pagination{
					TotalItems:  0,
					TotalPages:  0,
					CurrentPage: paginationParams.Page,
					PageSize:    paginationParams.PageSize,
					HasNextPage: false,
					HasPrevPage: false,
				},
			},
			expectedErrorMsg: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLocationRepo := new(mocks.LocationRepository)
			uc := NewLocationUseCase(mockLocationRepo)

			mockLocationRepo.On("List", ctx, paginationParams).
				Return(tt.mockRepoLocations, tt.mockRepoTotalItems, tt.mockRepoError).Once()

			actualResponse, actualErr := uc.List(ctx, paginationParams)

			assert.Equal(t, tt.expectedResponse, actualResponse)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(actualErr, tt.checkErrorIs), "Expected error to wrap: %v, but got: %v", tt.checkErrorIs, actualErr)
				}
			} else {
				assert.NoError(t, actualErr)
			}

			mockLocationRepo.AssertExpectations(t)
		})
	}
}

func TestLocationUseCase_Create(t *testing.T) {
	ctx := context.Background()
	mockLocation := &domain.Location{Name: "New Location"}
	mockLocationDTO := &dtolocation.LocationResponseDTO{
		Name: mockLocation.Name,
	}
	repoError := errors.New("create error")

	tests := []struct {
		name             string
		mockRepoError    error
		expectedResponse *dtolocation.LocationResponseDTO
		expectedError    error
		checkErrorIs     error
	}{
		{"successful creation", nil, mockLocationDTO, nil, nil},
		{"repository returns an error", repoError, nil, fmt.Errorf("failed to create location in repository: %w", repoError), repoError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLocationRepo := new(mocks.LocationRepository)
			uc := NewLocationUseCase(mockLocationRepo)
			mockLocationRepo.On("Create", ctx, mockLocation).Return(mockLocation, tt.mockRepoError).Once()

			createdLocationDTO, err := uc.Create(ctx, mockLocation)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.EqualError(t, err, tt.expectedError.Error())
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs), "Expected error to wrap: %v, but got: %v", tt.checkErrorIs, err)
				}
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResponse, createdLocationDTO)
			}
			mockLocationRepo.AssertExpectations(t)
		})
	}
}

func TestLocationUseCase_GetByID(t *testing.T) {
	ctx := context.Background()
	locationID := uint(1)
	mockLocation := &domain.Location{ID: 1, Name: "Found Location"}
	mockLocationDTO := &dtolocation.LocationResponseDTO{
		ID:   mockLocation.ID,
		Name: mockLocation.Name,
	}
	repoError := errors.New("find error")

	tests := []struct {
		name             string
		mockRepoResponse *domain.Location
		mockRepoError    error
		expectedResponse *dtolocation.LocationResponseDTO
		expectedError    error
	}{
		{"successful retrieval", mockLocation, nil, mockLocationDTO, nil},
		{"repository returns an error", nil, repoError, nil, repoError},
		{"location not found", nil, domain.ErrLocationNotFound, nil, domain.ErrLocationNotFound},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.LocationRepository)
			uc := NewLocationUseCase(mockRepo)

			mockRepo.On("GetByID", ctx, locationID).Return(tt.mockRepoResponse, tt.mockRepoError)

			resp, err := uc.GetByID(ctx, locationID)

			assert.Equal(t, tt.expectedResponse, resp)
			if tt.expectedError != nil {
				assert.ErrorIs(t, err, tt.expectedError)
			} else {
				assert.NoError(t, err)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestLocationUseCase_Update(t *testing.T) {
	ctx := context.Background()
	locationID := uint(1)
	mockLocationUpdate := &domain.Location{ID: 1, Name: "Updated Location"}
	mockLocationDTO := &dtolocation.LocationResponseDTO{
		ID:   mockLocationUpdate.ID,
		Name: mockLocationUpdate.Name,
	}
	repoError := errors.New("update error")

	tests := []struct {
		name             string
		mockRepoResponse *domain.Location
		mockRepoError    error
		expectedResponse *dtolocation.LocationResponseDTO
		expectedError    error
		checkErrorIs     error
	}{
		{"successful update", mockLocationUpdate, nil, mockLocationDTO, nil, nil},
		{"repository returns an error", nil, repoError, nil, fmt.Errorf("failed to update location: %w", repoError), repoError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.LocationRepository)
			uc := NewLocationUseCase(mockRepo)

			mockRepo.On("Update", ctx, locationID, mockLocationUpdate).Return(tt.mockRepoResponse, tt.mockRepoError)

			resp, err := uc.Update(ctx, locationID, mockLocationUpdate)

			assert.Equal(t, tt.expectedResponse, resp)
			if tt.expectedError != nil {
				assert.EqualError(t, err, tt.expectedError.Error())
				if tt.checkErrorIs != nil {
					assert.ErrorIs(t, err, tt.checkErrorIs)
				}
			} else {
				assert.NoError(t, err)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestLocationUseCase_Delete(t *testing.T) {
	ctx := context.Background()
	locationID := uint(1)
	existsError := errors.New("exists check error")
	deleteError := errors.New("delete error")

	tests := []struct {
		name             string
		mockExistsResult bool
		mockExistsError  error
		mockDeleteError  error
		expectedError    string
	}{
		{
			name:             "successful deletion",
			mockExistsResult: true,
			mockExistsError:  nil,
			mockDeleteError:  nil,
			expectedError:    "",
		},
		{
			name:             "location not found",
			mockExistsResult: false,
			mockExistsError:  nil,
			mockDeleteError:  nil,
			expectedError:    "location with ID 1 not found or already deleted",
		},
		{
			name:             "exists check error",
			mockExistsResult: false,
			mockExistsError:  existsError,
			mockDeleteError:  nil,
			expectedError:    "failed to check location existence",
		},
		{
			name:             "delete error",
			mockExistsResult: true,
			mockExistsError:  nil,
			mockDeleteError:  deleteError,
			expectedError:    "failed to delete location",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.LocationRepository)
			uc := NewLocationUseCase(mockRepo)

			mockRepo.On("Exists", ctx, locationID).Return(tt.mockExistsResult, tt.mockExistsError)

			if tt.mockExistsError == nil && tt.mockExistsResult {
				mockRepo.On("Delete", ctx, locationID).Return(tt.mockDeleteError)
			}

			err := uc.Delete(ctx, locationID)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestLocationUseCase_Exists(t *testing.T) {
	ctx := context.Background()
	locationID := uint(1)
	repoError := errors.New("exists error")

	tests := []struct {
		name           string
		mockRepoExists bool
		mockRepoError  error
		expectedExists bool
		expectedError  error
	}{
		{"location exists", true, nil, true, nil},
		{"location does not exist", false, nil, false, nil},
		{"repository returns an error", false, repoError, false, repoError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.LocationRepository)
			uc := NewLocationUseCase(mockRepo)

			mockRepo.On("Exists", ctx, locationID).Return(tt.mockRepoExists, tt.mockRepoError)

			exists, err := uc.Exists(ctx, locationID)

			assert.Equal(t, tt.expectedExists, exists)
			if tt.expectedError != nil {
				assert.ErrorIs(t, err, tt.expectedError)
			} else {
				assert.NoError(t, err)
			}
			mockRepo.AssertExpectations(t)
		})
	}
}
