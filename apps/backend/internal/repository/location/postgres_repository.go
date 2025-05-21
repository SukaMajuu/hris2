package location

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

type locationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) *locationRepository {
	return &locationRepository{db}
}

func (r *locationRepository) CreateLocation(ctx context.Context, location *domain.Location) error {
	return r.db.WithContext(ctx).Create(location).Error
}

func (r *locationRepository) List(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.Location, int64, error) {
	var locations []*domain.Location
	var totalItems int64

	query := r.db.WithContext(ctx).Model(&domain.Location{})

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (paginationParams.Page - 1) * paginationParams.PageSize
	if err := query.Offset(offset).Limit(paginationParams.PageSize).Find(&locations).Error; err != nil {
		return nil, 0, err
	}

	return locations, totalItems, nil
}
