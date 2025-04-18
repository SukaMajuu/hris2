package position

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) interfaces.PositionRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, position *domain.Position) error {
	return r.db.WithContext(ctx).Create(position).Error
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uint) (*domain.Position, error) {
	var position domain.Position
	err := r.db.WithContext(ctx).First(&position, id).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PostgresRepository) GetByName(ctx context.Context, name string) (*domain.Position, error) {
	var position domain.Position
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&position).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PostgresRepository) GetByDepartmentID(ctx context.Context, departmentID uint) ([]*domain.Position, error) {
	var positions []*domain.Position
	err := r.db.WithContext(ctx).Where("department_id = ?", departmentID).Find(&positions).Error
	if err != nil {
		return nil, err
	}
	return positions, nil
}

func (r *PostgresRepository) Update(ctx context.Context, position *domain.Position) error {
	return r.db.WithContext(ctx).Save(position).Error
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Position{}, id).Error
}

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Position, error) {
	var positions []*domain.Position
	query := r.db.WithContext(ctx)

	for key, value := range filters {
		query = query.Where(key, value)
	}

	err := query.Find(&positions).Error
	if err != nil {
		return nil, err
	}
	return positions, nil
}
