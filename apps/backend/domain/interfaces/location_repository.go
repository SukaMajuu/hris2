package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type LocationRepository interface {
	Create(ctx context.Context, location *domain.Location) (*domain.Location, error)
	List(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.Location, int64, error)
	GetByID(ctx context.Context, id uint) (*domain.Location, error)
	Update(ctx context.Context, id uint, location *domain.Location) (*domain.Location, error)
	Delete(ctx context.Context, id uint) error
	Exists(ctx context.Context, id uint) (bool, error)
}
