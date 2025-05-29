package checkclock_settings

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

type CheckclockRepository struct {
	db *gorm.DB
}

func NewCheckclockSettingsRepository(db *gorm.DB) *CheckclockRepository {
	return &CheckclockRepository{db: db}
}

func (r *CheckclockRepository) Create(ctx context.Context, checkclockSettings *domain.CheckclockSettings) (*domain.CheckclockSettings, error) {
	err := r.db.WithContext(ctx).Create(checkclockSettings).Error
	if err != nil {
		return nil, err
	}
	// Preload associated data after creation
	err = r.db.WithContext(ctx).Preload("Employee").Preload("WorkSchedule.Details").First(checkclockSettings, checkclockSettings.ID).Error
	if err != nil {
		return nil, err // return error if preloading fails
	}
	return checkclockSettings, nil
}

func (r *CheckclockRepository) GetByEmployeeID(ctx context.Context, employeeID uint) (*domain.CheckclockSettings, error) {
	var settings domain.CheckclockSettings
	err := r.db.WithContext(ctx).Where("employee_id = ?", employeeID).First(&settings).Error
	if err != nil {
		return nil, err
	}
	return &settings, nil
}

func (r *CheckclockRepository) Update(ctx context.Context, checkclockSettings *domain.CheckclockSettings) error {
	return r.db.WithContext(ctx).Save(checkclockSettings).Error
}
