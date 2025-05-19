package location

import (
	"context"
	"yourapp/domain"
	"gorm.io/gorm"
)

type locationRepository struct {
	db *gorm.DB
}

func NewLocationRepository(db *gorm.DB) *locationRepository {
	return &locationRepository{db}
}

func (r *locationRepository) Create(ctx context.Context, location *domain.Location) error {
	return r.db.WithContext(ctx).Create(location).Error
}

func (r *locationRepository) GetAll(ctx context.Context) ([]domain.Location, error) {
	var locations []domain.Location
	err := r.db.WithContext(ctx).Find(&locations).Error
	return locations, err
}
