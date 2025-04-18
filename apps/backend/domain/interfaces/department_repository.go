package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type DepartmentRepository interface {
	Create(ctx context.Context, department *domain.Department) error
	GetByID(ctx context.Context, id uint) (*domain.Department, error)
	GetByName(ctx context.Context, name string) (*domain.Department, error)
	Update(ctx context.Context, department *domain.Department) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, filters map[string]interface{}) ([]*domain.Department, error)
}
