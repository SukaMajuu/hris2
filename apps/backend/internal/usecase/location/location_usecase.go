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

func (uc *LocationUseCase) GetByID(ctx context.Context, id uint) (*dtolocation.LocationResponseDTO, error) {
	locationDomain, err := uc.locationRepo.GetByID(ctx, id)
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

func (uc *LocationUseCase) Delete(ctx context.Context, id uint) error {
	err := uc.locationRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (uc *LocationUseCase) Exists(ctx context.Context, id uint) (bool, error) {
	return uc.locationRepo.Exists(ctx, id)
}
