package leave_request

import (
	"context"
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) interfaces.LeaveRequestRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) Create(ctx context.Context, leaveRequest *domain.LeaveRequest) error {
	return r.db.WithContext(ctx).Create(leaveRequest).Error
}

func (r *PostgresRepository) GetByID(ctx context.Context, id uint) (*domain.LeaveRequest, error) {
	var leaveRequest domain.LeaveRequest
	err := r.db.WithContext(ctx).Preload("Employee").First(&leaveRequest, id).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrLeaveRequestNotFound
		}
		return nil, err
	}
	return &leaveRequest, nil
}

func (r *PostgresRepository) GetByEmployeeID(ctx context.Context, employeeID uint, pagination domain.PaginationParams) ([]*domain.LeaveRequest, int64, error) {
	var leaveRequests []*domain.LeaveRequest
	var totalItems int64

	query := r.db.WithContext(ctx).Model(&domain.LeaveRequest{}).Where("employee_id = ?", employeeID)

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (pagination.Page - 1) * pagination.PageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pagination.PageSize).Preload("Employee").Find(&leaveRequests).Error; err != nil {
		return nil, 0, err
	}

	return leaveRequests, totalItems, nil
}

func (r *PostgresRepository) Update(ctx context.Context, leaveRequest *domain.LeaveRequest) error {
	return r.db.WithContext(ctx).Save(leaveRequest).Error
}

func (r *PostgresRepository) Delete(ctx context.Context, id uint) error {
	result := r.db.WithContext(ctx).Delete(&domain.LeaveRequest{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrLeaveRequestNotFound
	}
	return nil
}

func (r *PostgresRepository) List(ctx context.Context, filters map[string]interface{}, pagination domain.PaginationParams) ([]*domain.LeaveRequest, int64, error) {
	var leaveRequests []*domain.LeaveRequest
	var totalItems int64

	query := r.db.WithContext(ctx).Model(&domain.LeaveRequest{})

	// Apply filters
	for key, value := range filters {
		switch key {
		case "employee_id":
			query = query.Where("employee_id = ?", value)
		case "status":
			query = query.Where("status = ?", value)
		case "leave_type":
			query = query.Where("leave_type = ?", value)
		case "start_date_gte":
			query = query.Where("start_date >= ?", value)
		case "end_date_lte":
			query = query.Where("end_date <= ?", value)
		case "manager_id":
			// Join with employees table to filter by manager
			query = query.Joins("JOIN employees ON leave_requests.employee_id = employees.id").
				Where("employees.manager_id = ?", value)
		default:
			query = query.Where(fmt.Sprintf("%s = ?", key), value)
		}
	}

	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, err
	}

	offset := (pagination.Page - 1) * pagination.PageSize
	if err := query.Order("leave_requests.created_at DESC").Offset(offset).Limit(pagination.PageSize).Preload("Employee").Find(&leaveRequests).Error; err != nil {
		return nil, 0, err
	}

	return leaveRequests, totalItems, nil
}

func (r *PostgresRepository) UpdateStatus(ctx context.Context, id uint, status domain.LeaveStatus, adminNote *string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if adminNote != nil {
		updates["admin_note"] = *adminNote
	}

	result := r.db.WithContext(ctx).Model(&domain.LeaveRequest{}).Where("id = ?", id).Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return domain.ErrLeaveRequestNotFound
	}
	return nil
}
