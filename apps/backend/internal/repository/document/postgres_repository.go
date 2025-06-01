package document

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) interfaces.DocumentRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, document *domain.Document) error {
	return r.db.WithContext(ctx).Create(document).Error
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uint) (*domain.Document, error) {
	var document domain.Document
	err := r.db.WithContext(ctx).Preload("Employee").First(&document, id).Error
	if err != nil {
		return nil, err
	}
	return &document, nil
}

func (r *PostgresRepository) GetByEmployeeID(ctx context.Context, employeeID uint) ([]*domain.Document, error) {
	var documents []*domain.Document
	err := r.db.WithContext(ctx).Where("employee_id = ?", employeeID).Find(&documents).Error
	if err != nil {
		return nil, err
	}
	return documents, nil
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Document{}, id).Error
}
