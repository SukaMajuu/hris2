package location

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
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

func (uc *LocationUseCase) CreateLocation(ctx context.Context, location *domain.Location) error {
	return uc.locationRepo.CreateLocation(ctx, location)
}

func (uc *LocationUseCase) GetAllLocations(ctx context.Context) ([]*domain.Location, error) {
	locations, err := uc.locationRepo.GetAllLocations(ctx)
	if err != nil {
		return nil, err
	}
	return locations, nil
}
