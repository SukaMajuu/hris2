package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type DocumentRepository interface {
	Create(ctx context.Context, document *domain.Document) error
	GetByID(ctx context.Context, id uint) (*domain.Document, error)
	GetByEmployeeID(ctx context.Context, employeeID uint) ([]*domain.Document, error)
	Delete(ctx context.Context, id uint) error
}
