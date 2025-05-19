package work_schedule

import (
	"context"
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type WorkScheduleRepository struct {
	db *gorm.DB
}

func NewWorkScheduleRepository(db *gorm.DB) interfaces.WorkScheduleRepository {
	return &WorkScheduleRepository{
		db: db,
	}
}

func (ws *WorkScheduleRepository) CreateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error {
	err := ws.db.WithContext(ctx).Create(workSchedule).Error
	if err != nil {
		return fmt.Errorf("failed to create work schedule: %w", err)
	}
	return nil
}

func (ws *WorkScheduleRepository) GetWorkScheduleByID(ctx context.Context, id uint) (*domain.WorkSchedule, error) {
	var workSchedule domain.WorkSchedule
	err := ws.db.WithContext(ctx).First(&workSchedule, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get work schedule by ID: %w", err)
	}
	return &workSchedule, nil
}

func (ws *WorkScheduleRepository) UpdateWorkSchedule(ctx context.Context, workSchedule *domain.WorkSchedule) error {
	err := ws.db.WithContext(ctx).Save(workSchedule).Error
	if err != nil {
		return fmt.Errorf("failed to update work schedule: %w", err)
	}
	return nil
}

func (ws *WorkScheduleRepository) DeleteWorkSchedule(ctx context.Context, id uint) error {
	err := ws.db.WithContext(ctx).Delete(&domain.WorkSchedule{}, id).Error
	if err != nil {
		return fmt.Errorf("failed to delete work schedule: %w", err)
	}
	return nil
}

func (ws *WorkScheduleRepository) ListWorkSchedule(ctx context.Context, filters map[string]interface{}) ([]*domain.WorkSchedule, error) {
	query := ws.db.WithContext(ctx).Model(&domain.WorkSchedule{})

	// Handle filter name (jika ada)
	if name, ok := filters["name"]; ok {
		query = query.Where("name LIKE ?", "%"+name.(string)+"%") // Pakai LIKE untuk partial match
	}

	var workSchedules []*domain.WorkSchedule
	if err := query.Find(&workSchedules).Error; err != nil {
		return nil, err
	}
	return workSchedules, nil
}
