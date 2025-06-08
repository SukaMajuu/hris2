package employee

import (
	"context"
	"log"
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
	err := r.db.WithContext(ctx).Preload("User").Preload("WorkSchedule").Preload("WorkSchedule.Details").Preload("WorkSchedule.Details.Location").First(&employee, id).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) GetByUserID(ctx context.Context, userID uint) (*domain.Employee, error) {
	var employee domain.Employee
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Preload("User").Preload("WorkSchedule").Preload("WorkSchedule.Details").Preload("WorkSchedule.Details.Location").First(&employee).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) GetByEmployeeCode(ctx context.Context, employeeCode string) (*domain.Employee, error) {
	var employee domain.Employee
	err := r.db.WithContext(ctx).Where("employee_code = ?", employeeCode).Preload("WorkSchedule.Details.Location").First(&employee).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) GetByNIK(ctx context.Context, nik string) (*domain.Employee, error) {
	var employee domain.Employee
	err := r.db.WithContext(ctx).Where("nik = ?", nik).Preload("WorkSchedule.Details.Location").First(&employee).Error
	if err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *PostgresRepository) Update(ctx context.Context, employee *domain.Employee) error {
	// Create a map of values to update to bypass GORM's change tracking
	updateMap := map[string]interface{}{
		"user_id":                  employee.UserID,
		"first_name":               employee.FirstName,
		"last_name":                employee.LastName,
		"employee_code":            employee.EmployeeCode,
		"branch":                   employee.Branch,
		"gender":                   employee.Gender,
		"nik":                      employee.NIK,
		"place_of_birth":           employee.PlaceOfBirth,
		"date_of_birth":            employee.DateOfBirth,
		"last_education":           employee.LastEducation,
		"grade":                    employee.Grade,
		"contract_type":            employee.ContractType,
		"position_name":            employee.PositionName,
		"employment_status":        employee.EmploymentStatus,
		"resignation_date":         employee.ResignationDate,
		"hire_date":                employee.HireDate,
		"bank_name":                employee.BankName,
		"bank_account_number":      employee.BankAccountNumber,
		"bank_account_holder_name": employee.BankAccountHolderName,
		"tax_status":               employee.TaxStatus,
		"profile_photo_url":        employee.ProfilePhotoURL,
		"work_schedule_id":         employee.WorkScheduleID,
		"annual_leave_allowance":   employee.AnnualLeaveAllowance,
		"manager_id":               employee.ManagerID,
		"updated_at":               time.Now(),
	}

	// Log the WorkScheduleID value being updated
	log.Printf("PostgresRepository: Updating employee ID %d with WorkScheduleID: %v", employee.ID, employee.WorkScheduleID)

	result := r.db.WithContext(ctx).Model(&domain.Employee{}).Where("id = ?", employee.ID).Updates(updateMap)
	if result.Error != nil {
		return result.Error
	}

	// Log the number of affected rows for debugging
	log.Printf("PostgresRepository: Update affected %d rows for employee ID %d", result.RowsAffected, employee.ID)

	return nil
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&domain.Employee{}, id).Error
}

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.Employee, int64, error) {
	var employees []*domain.Employee
	var totalItems int64

	query := r.db.WithContext(ctx).Model(&domain.Employee{}).Joins("LEFT JOIN users ON employees.user_id = users.id")

	for key, value := range filters {
		switch key {
		case "manager_id":
			query = query.Where("employees.manager_id = ?", value)
		case "employment_status":
			query = query.Where("employees.employment_status = ?", value)
		case "gender":
			query = query.Where("employees.gender = ?", value)
		case "search":

			searchTerm := "%" + value.(string) + "%"
			query = query.Where(
				"LOWER(employees.first_name || ' ' || COALESCE(employees.last_name, '')) LIKE LOWER(?) OR "+
					"users.phone LIKE ? OR "+
					"LOWER(COALESCE(employees.branch, '')) LIKE LOWER(?) OR "+
					"LOWER(COALESCE(employees.position_name, '')) LIKE LOWER(?) OR "+
					"LOWER(COALESCE(employees.grade, '')) LIKE LOWER(?)",
				searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
		default:
			query = query.Where("employees."+key+" = ?", value)
		}
	}

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (pagination.Page - 1) * pagination.PageSize
	err := query.Offset(offset).Limit(pagination.PageSize).Order("employees.id ASC").
		Preload("User").
		Preload("WorkSchedule").
		Preload("WorkSchedule.Details").
		Preload("WorkSchedule.Details.Location").
		Find(&employees).Error
	if err != nil {
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

func (r *PostgresRepository) GetStatisticsWithTrendsByManager(ctx context.Context, managerID uint) (
	totalEmployees, newEmployees, activeEmployees, resignedEmployees,
	permanentEmployees, contractEmployees, freelanceEmployees int64,
	totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend float64,
	err error,
) {
	newQuery := func() *gorm.DB {
		return r.db.WithContext(ctx).Model(&domain.Employee{}).Where("manager_id = ?", managerID)
	}

	err = newQuery().Count(&totalEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("employment_status = ?", true).Count(&activeEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("employment_status = ?", false).Count(&resignedEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	sixtyDaysAgo := now.AddDate(0, 0, -60)

	err = newQuery().Where("hire_date >= ?", thirtyDaysAgo).Count(&newEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	var previousNewEmployees int64
	err = newQuery().Where("hire_date >= ? AND hire_date < ?", sixtyDaysAgo, thirtyDaysAgo).Count(&previousNewEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	if previousNewEmployees > 0 {
		newEmployeesTrend = float64(newEmployees-previousNewEmployees) / float64(previousNewEmployees) * 100
	} else if newEmployees > 0 {
		newEmployeesTrend = 100
	} else {
		newEmployeesTrend = 0
	}

	currentMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	var totalEmployeesBeforeCurrentMonth int64
	err = newQuery().Where("hire_date < ?", currentMonth).Count(&totalEmployeesBeforeCurrentMonth).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	if totalEmployeesBeforeCurrentMonth > 0 {
		totalEmployeesTrend = float64(totalEmployees-totalEmployeesBeforeCurrentMonth) / float64(totalEmployeesBeforeCurrentMonth) * 100
	} else if totalEmployees > 0 {
		totalEmployeesTrend = 100
	} else {
		totalEmployeesTrend = 0
	}

	var previousMonthActiveEmployees int64
	err = newQuery().Where(
		"hire_date < ? AND (employment_status = ? OR (employment_status = ? AND resignation_date >= ?))",
		currentMonth, true, false, currentMonth,
	).Count(&previousMonthActiveEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	if previousMonthActiveEmployees > 0 {
		activeEmployeesTrend = float64(activeEmployees-previousMonthActiveEmployees) / float64(previousMonthActiveEmployees) * 100
	} else if activeEmployees > 0 {
		activeEmployeesTrend = 100
	} else {
		activeEmployeesTrend = 0
	}

	err = newQuery().Where("contract_type = ?", "permanent").Count(&permanentEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("contract_type = ?", "contract").Count(&contractEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	err = newQuery().Where("contract_type = ?", "freelance").Count(&freelanceEmployees).Error
	if err != nil {
		return 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, err
	}

	return totalEmployees, newEmployees, activeEmployees, resignedEmployees, permanentEmployees, contractEmployees, freelanceEmployees, totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend, nil
}
