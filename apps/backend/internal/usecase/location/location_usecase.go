package location

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

type locationUsecase struct {
	locationRepo interfaces.LocationRepository
}

func NewLocationUsecase(repo interfaces.LocationRepository) *locationUsecase {
	return &locationUsecase{repo}
}

func (uc *locationUsecase) CreateLocation(ctx context.Context, location *domain.Location) error {
	return uc.locationRepo.Create(ctx, location)
}

func (uc *locationUsecase) GetAllLocations(ctx context.Context) ([]domain.Location, error) {
	return uc.locationRepo.GetAll(ctx)
}
