package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type CheckclockSettingsRepository interface {
	Create(ctx context.Context, checkclockSettings *domain.CheckclockSettings) (*domain.CheckclockSettings, error)
	GetByEmployeeID(ctx context.Context, employeeID uint) (*domain.CheckclockSettings, error)
	Update(ctx context.Context, checkclockSettings *domain.CheckclockSettings) error
}
