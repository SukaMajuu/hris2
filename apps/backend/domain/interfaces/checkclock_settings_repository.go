package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type CheckclockSettingsRepository interface {
	Create(ctx context.Context, checkclockSettings *domain.CheckclockSettings) (*domain.CheckclockSettings, error)
	GetByID(ctx context.Context, id uint) (*domain.CheckclockSettings, error)
	GetByEmployeeID(ctx context.Context, employeeID uint) (*domain.CheckclockSettings, error)
	GetAll(ctx context.Context, offset, limit int) ([]*domain.CheckclockSettings, int64, error)
	Update(ctx context.Context, checkclockSettings *domain.CheckclockSettings) error
	Delete(ctx context.Context, id uint) error
}
