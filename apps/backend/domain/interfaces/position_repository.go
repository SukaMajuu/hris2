package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type PositionRepository interface {
	Create(ctx context.Context, position *domain.Position) error
	GetByID(ctx context.Context, id uint) (*domain.Position, error)
	GetByName(ctx context.Context, name string) (*domain.Position, error)
	GetByDepartmentID(ctx context.Context, departmentID uint) ([]*domain.Position, error)
	Update(ctx context.Context, position *domain.Position) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, filters map[string]interface{}) ([]*domain.Position, error)
}
