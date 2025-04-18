package employee

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) interfaces.EmployeeRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, employee *domain.Employee) error {
	return r.db.WithContext(ctx).Create(employee).Error
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uint) (*domain.Employee, error) {
	var employee domain.Employee
	err := r.db.WithContext(ctx).First(&employee, id).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID uint) (*domain.Employee, error) {
	var employee domain.Employee
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&employee).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) GetByEmployeeCode(ctx context.Context, employeeCode string) (*domain.Employee, error) {
	var employee domain.Employee
	err := r.db.WithContext(ctx).Where("employee_code = ?", employeeCode).First(&employee).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) Update(ctx context.Context, employee *domain.Employee) error {
	return r.db.WithContext(ctx).Save(employee).Error
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Employee{}, id).Error
}

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Employee, error) {
	var employees []*domain.Employee
	query := r.db.WithContext(ctx)

	for key, value := range filters {
		query = query.Where(key, value)
	}

	err := query.Find(&employees).Error
	if err != nil {
		return nil, err
	}
	return employees, nil
}
