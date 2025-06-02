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

func (r *locationRepository) Create(ctx context.Context, location *domain.Location) (*domain.Location, error) {
	err := r.db.WithContext(ctx).Create(location).Error
	if err != nil {
		return nil, err
	}
	return location, nil
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

func (r *locationRepository) GetByID(ctx context.Context, id uint) (*domain.Location, error) {
	var location domain.Location
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&location).Error; err != nil {
		return nil, err
	}
	return &location, nil
}

func (r *locationRepository) Update(ctx context.Context, id uint, location *domain.Location) (*domain.Location, error) {
	if err := r.db.WithContext(ctx).Where("id = ?", id).Updates(location).Error; err != nil {
		return nil, err
	}
	var updatedLocation domain.Location
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&updatedLocation).Error; err != nil {
		return nil, err
	}
	return &updatedLocation, nil
}

func (r *locationRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Where("id = ?", id).Delete(&domain.Location{}).Error
}

// Exists checks if a location with the given ID exists.
func (r *locationRepository) Exists(ctx context.Context, id uint) (bool, error) {
	var location domain.Location
	err := r.db.WithContext(ctx).Model(&domain.Location{}).Where("id = ?", id).First(&location).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil // Record not found means it doesn't exist
		}
		return false, err // Other error
	}
	return true, nil // Record found
}
