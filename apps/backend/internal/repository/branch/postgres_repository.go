package branch

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) interfaces.BranchRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, branch *domain.Branch) error {
	return r.db.WithContext(ctx).Create(branch).Error
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uint) (*domain.Branch, error) {
	var branch domain.Branch
	err := r.db.WithContext(ctx).First(&branch, id).Error
	if err != nil {
		return nil, err
	}
	return &branch, nil
}

func (r *PostgresRepository) GetByHrID(ctx context.Context, hrID uint) ([]*domain.Branch, error) {
	var branches []*domain.Branch
	err := r.db.WithContext(ctx).Where("hr_id = ?", hrID).Find(&branches).Error
	if err != nil {
		return nil, err
	}
	return branches, nil
}

func (r *PostgresRepository) Update(ctx context.Context, branch *domain.Branch) error {
	return r.db.WithContext(ctx).Save(branch).Error
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Branch{}, id).Error
}

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Branch, error) {
	var branches []*domain.Branch
	query := r.db.WithContext(ctx)

	for key, value := range filters {
		query = query.Where(key, value)
	}

	err := query.Find(&branches).Error
	if err != nil {
		return nil, err
	}
	return branches, nil
}
