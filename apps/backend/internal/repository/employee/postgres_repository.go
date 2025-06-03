package employee

import (
	"context"
	"time"

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
	err := r.db.WithContext(ctx).Preload("User").First(&employee, id).Error
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

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.Employee, int64, error) {
	var employees []*domain.Employee
	var totalItems int64

	query := r.db.WithContext(ctx).Model(&domain.Employee{})

	for key, value := range filters {
		switch key {
		case "manager_id":
			query = query.Where("manager_id = ?", value)
		case "employment_status":
			query = query.Where("employment_status = ?", value)
		default:
			query = query.Where(key+" = ?", value)
		}
	}

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (pagination.Page - 1) * pagination.PageSize
	if err := query.Offset(offset).Limit(pagination.PageSize).Order("id ASC").Preload("User").Find(&employees).Error; err != nil {
		return nil, 0, err
	}

	return employees, totalItems, nil
}

func (r *PostgresRepository) GetStatistics(ctx context.Context) (
	totalEmployees, newEmployees, activeEmployees, resignedEmployees,
	permanentEmployees, contractEmployees, freelanceEmployees int64,
	err error,
) {

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).Count(&totalEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).Where("employment_status = ?", true).Count(&activeEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).Where("employment_status = ?", false).Count(&resignedEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).
		Where("hire_date >= ?", thirtyDaysAgo).
		Count(&newEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).Where("contract_type = ?", "permanent").Count(&permanentEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).Where("contract_type = ?", "contract").Count(&contractEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = r.db.WithContext(ctx).Model(&domain.Employee{}).Where("contract_type = ?", "freelance").Count(&freelanceEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	return totalEmployees, newEmployees, activeEmployees, resignedEmployees, permanentEmployees, contractEmployees, freelanceEmployees, nil
}

func (r *PostgresRepository) GetStatisticsByManager(ctx context.Context, managerID uint) (
	totalEmployees, newEmployees, activeEmployees, resignedEmployees,
	permanentEmployees, contractEmployees, freelanceEmployees int64,
	err error,
) {
	// Create base query function to avoid stacking WHERE conditions
	newQuery := func() *gorm.DB {
		return r.db.WithContext(ctx).Model(&domain.Employee{}).Where("manager_id = ?", managerID)
	}

	err = newQuery().Count(&totalEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("employment_status = ?", true).Count(&activeEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("employment_status = ?", false).Count(&resignedEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)

	err = newQuery().Where("hire_date >= ?", thirtyDaysAgo).Count(&newEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("contract_type = ?", "permanent").Count(&permanentEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("contract_type = ?", "contract").Count(&contractEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("contract_type = ?", "freelance").Count(&freelanceEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, err
	}

	return totalEmployees, newEmployees, activeEmployees, resignedEmployees, permanentEmployees, contractEmployees, freelanceEmployees, nil
}
