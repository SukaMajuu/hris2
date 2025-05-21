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

func (uc *LocationUseCase) Create(ctx context.Context, location *domain.Location) (*domain.Location, error) {
	createdLocation, err := uc.locationRepo.Create(ctx, location)
	if err != nil {
		return nil, fmt.Errorf("failed to create location: %w", err)
	}
	return createdLocation, nil
}

func (uc *LocationUseCase) List(ctx context.Context, paginationParams domain.PaginationParams) (*domain.LocationListResponseData, error) {
	domainLocations, totalItems, err := uc.locationRepo.List(ctx, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list locations from repository: %w", err)
	}

	locationDTOs := make([]*dtolocation.LocationResponseDTO, len(domainLocations))
	for i, loc := range domainLocations {
		locationDTOs[i] = &dtolocation.LocationResponseDTO{
			ID:        loc.ID,
			Name:      loc.Name,
			Latitude:  loc.Latitude,
			Longitude: loc.Longitude,
			Radius:    float64(loc.RadiusM),
		}
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

	response := &domain.LocationListResponseData{
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

func (uc *LocationUseCase) GetByID(ctx context.Context, id string) (*domain.Location, error) {
	return uc.locationRepo.GetByID(ctx, id)
}

func (uc *LocationUseCase) Update(ctx context.Context, id string, location *domain.Location) (*domain.Location, error) {
	updatedLocation, err := uc.locationRepo.Update(ctx, id, location)
	if err != nil {
		return nil, fmt.Errorf("failed to update location: %w", err)
	}
	return updatedLocation, nil
}

func (uc *LocationUseCase) Delete(ctx context.Context, id string) error {
	return uc.locationRepo.Delete(ctx, id)
}
