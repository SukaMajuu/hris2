package checkclock_settings

import (
	"context"
	"errors"

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
	err = r.db.WithContext(ctx).
		Preload("Employee.User").
		Preload("WorkSchedule.Details").
		First(checkclockSettings, checkclockSettings.ID).Error
	if err != nil {
		return nil, err
	}
	return checkclockSettings, nil
}

func (r *CheckclockRepository) GetByID(ctx context.Context, id uint) (*domain.CheckclockSettings, error) {
	var settings domain.CheckclockSettings
	err := r.db.WithContext(ctx).
		Preload("Employee.User").
		Preload("WorkSchedule.Details").
		First(&settings, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("checkclock settings not found")
		}
		return nil, err
	}
	return &settings, nil
}

func (r *CheckclockRepository) GetByEmployeeID(ctx context.Context, employeeID uint) (*domain.CheckclockSettings, error) {
	var settings domain.CheckclockSettings
	err := r.db.WithContext(ctx).
		Preload("Employee.User").
		Preload("WorkSchedule.Details").
		Where("employee_id = ?", employeeID).
		First(&settings).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("checkclock settings not found for employee")
		}
		return nil, err
	}
	return &settings, nil
}

func (r *CheckclockRepository) GetAll(ctx context.Context, offset, limit int) ([]*domain.CheckclockSettings, int64, error) {
	var settings []*domain.CheckclockSettings
	var total int64

	// Count total records
	err := r.db.WithContext(ctx).Model(&domain.CheckclockSettings{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated records
	err = r.db.WithContext(ctx).
		Preload("Employee.User").
		Preload("WorkSchedule.Details").
		Offset(offset).
		Limit(limit).
		Find(&settings).Error
	if err != nil {
		return nil, 0, err
	}

	return settings, total, nil
}

func (r *CheckclockRepository) Update(ctx context.Context, checkclockSettings *domain.CheckclockSettings) error {
	return r.db.WithContext(ctx).Save(checkclockSettings).Error
}

func (r *CheckclockRepository) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(&domain.CheckclockSettings{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("checkclock settings not found")
	}
	return nil
}
