package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type BranchRepository interface {
	Create(ctx context.Context, branch *domain.Branch) error
	GetByID(ctx context.Context, id uint) (*domain.Branch, error)
	GetByHrID(ctx context.Context, hrID uint) ([]*domain.Branch, error)
	Update(ctx context.Context, branch *domain.Branch) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, filters map[string]interface{}) ([]*domain.Branch, error)
}
