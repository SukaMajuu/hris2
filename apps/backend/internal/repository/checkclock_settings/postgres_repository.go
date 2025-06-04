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
		Joins("JOIN employees ON checkclock_settings.employee_id = employees.id").
		Where("checkclock_settings.employee_id = ? AND employees.employment_status = ?", employeeID, true).
		First(&settings).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("checkclock settings not found for active employee")
		}
		return nil, err
	}
	return &settings, nil
}

func (r *CheckclockRepository) GetAll(ctx context.Context, offset, limit int) ([]*domain.CheckclockSettings, int64, error) {
	var settings []*domain.CheckclockSettings
	var total int64

	// Join with employees table and filter by employment_status
	query := r.db.WithContext(ctx).Model(&domain.CheckclockSettings{}).
		Joins("JOIN employees ON checkclock_settings.employee_id = employees.id").
		Where("employees.employment_status = ?", true)

	// Count total records with employment_status filter
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated records with preloading
	err = r.db.WithContext(ctx).
		Preload("Employee.User").
		Preload("WorkSchedule.Details").
		Joins("JOIN employees ON checkclock_settings.employee_id = employees.id").
		Where("employees.employment_status = ?", true).
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
