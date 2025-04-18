package department

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) interfaces.DepartmentRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, department *domain.Department) error {
	return r.db.WithContext(ctx).Create(department).Error
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uint) (*domain.Department, error) {
	var department domain.Department
	err := r.db.WithContext(ctx).First(&department, id).Error
	if err != nil {
		return nil, err
	}
	return &department, nil
}

func (r *PostgresRepository) GetByName(ctx context.Context, name string) (*domain.Department, error) {
	var department domain.Department
	err := r.db.WithContext(ctx).Where("name = ?", name).First(&department).Error
	if err != nil {
		return nil, err
	}
	return &department, nil
}

func (r *PostgresRepository) Update(ctx context.Context, department *domain.Department) error {
	return r.db.WithContext(ctx).Save(department).Error
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Department{}, id).Error
}

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Department, error) {
	var departments []*domain.Department
	query := r.db.WithContext(ctx)

	for key, value := range filters {
		query = query.Where(key, value)
	}

	err := query.Find(&departments).Error
	if err != nil {
		return nil, err
	}
	return departments, nil
}
