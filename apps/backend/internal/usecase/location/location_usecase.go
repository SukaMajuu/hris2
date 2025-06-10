package location

import (
	"context"
	"fmt"
	"math"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtolocation "github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

type LocationUseCase struct {
	locationRepo interfaces.LocationRepository
}

func NewLocationUseCase(repo interfaces.LocationRepository) *LocationUseCase {
	return &LocationUseCase{
		locationRepo: repo,
	}
}

func toLocationResponseDTO(loc *domain.Location) *dtolocation.LocationResponseDTO {
	if loc == nil {
		return nil
	}
	return &dtolocation.LocationResponseDTO{
		ID:            loc.ID,
		Name:          loc.Name,
		AddressDetail: loc.AddressDetail,
		Latitude:      loc.Latitude,
		Longitude:     loc.Longitude,
		Radius:        float64(loc.RadiusM),
	}
}

func (uc *LocationUseCase) Create(ctx context.Context, location *domain.Location) (*dtolocation.LocationResponseDTO, error) {
	createdLocationDomain, err := uc.locationRepo.Create(ctx, location)
	if err != nil {
		return nil, fmt.Errorf("failed to create location in repository: %w", err)
	}
	return toLocationResponseDTO(createdLocationDomain), nil
}

func (uc *LocationUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*dtolocation.LocationListResponseData, error) {
	domainLocations, totalItems, err := uc.locationRepo.List(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list locations from repository: %w", err)
	}

	locationDTOs := make([]*dtolocation.LocationResponseDTO, len(domainLocations))
	for i, loc := range domainLocations {
		locationDTOs[i] = toLocationResponseDTO(loc)
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

	response := &dtolocation.LocationListResponseData{
		Items: locationDTOs,
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

func (uc *LocationUseCase) ListByUser(ctx context.Context, userID uint, paginationParams domain.PaginationParams) (*dtolocation.LocationListResponseData, error) {
	domainLocations, totalItems, err := uc.locationRepo.ListByUser(ctx, userID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list locations by user from repository: %w", err)
	}

	locationDTOs := make([]*dtolocation.LocationResponseDTO, len(domainLocations))
	for i, loc := range domainLocations {
		locationDTOs[i] = toLocationResponseDTO(loc)
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

	response := &dtolocation.LocationListResponseData{
		Items: locationDTOs,
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

func (uc *LocationUseCase) GetByID(ctx context.Context, id uint) (*dtolocation.LocationResponseDTO, error) {
	locationDomain, err := uc.locationRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toLocationResponseDTO(locationDomain), nil
}

func (uc *LocationUseCase) GetByIDAndUser(ctx context.Context, id uint, userID uint) (*dtolocation.LocationResponseDTO, error) {
	locationDomain, err := uc.locationRepo.GetByIDAndUser(ctx, id, userID)
	if err != nil {
		return nil, err
	}
	return toLocationResponseDTO(locationDomain), nil
}

func (uc *LocationUseCase) Update(ctx context.Context, id uint, locationUpdates *domain.Location) (*dtolocation.LocationResponseDTO, error) {
	updatedLocationDomain, err := uc.locationRepo.Update(ctx, id, locationUpdates)
	if err != nil {
		return nil, fmt.Errorf("failed to update location: %w", err)
	}
	return toLocationResponseDTO(updatedLocationDomain), nil
}

func (uc *LocationUseCase) UpdateByUser(ctx context.Context, id uint, userID uint, locationUpdates *domain.Location) (*dtolocation.LocationResponseDTO, error) {
	updatedLocationDomain, err := uc.locationRepo.UpdateByUser(ctx, id, userID, locationUpdates)
	if err != nil {
		return nil, fmt.Errorf("failed to update location by user: %w", err)
	}
	return toLocationResponseDTO(updatedLocationDomain), nil
}

func (uc *LocationUseCase) Delete(ctx context.Context, id uint) error {
	// Check if location exists and is active before deleting
	exists, err := uc.locationRepo.Exists(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to check location existence: %w", err)
	}
	if !exists {
		return fmt.Errorf("location with ID %d not found or already deleted", id)
	}

	err = uc.locationRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete location: %w", err)
	}
	return nil
}

func (uc *LocationUseCase) DeleteByUser(ctx context.Context, id uint, userID uint) error {
	// Check if location exists and belongs to user before deleting
	exists, err := uc.locationRepo.ExistsByUser(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("failed to check location existence by user: %w", err)
	}
	if !exists {
		return domain.ErrLocationNotFound
	}

	err = uc.locationRepo.DeleteByUser(ctx, id, userID)
	if err != nil {
		return fmt.Errorf("failed to delete location by user: %w", err)
	}
	return nil
}

func (uc *LocationUseCase) Exists(ctx context.Context, id uint) (bool, error) {
	return uc.locationRepo.Exists(ctx, id)
}
