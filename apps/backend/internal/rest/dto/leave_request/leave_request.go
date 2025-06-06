package leave_request

import (
	"mime/multipart"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type LeaveRequestQueryDTO struct {
	Page       int     `form:"page" binding:"omitempty,min=1"`
	PageSize   int     `form:"page_size" binding:"omitempty,min=1,max=100"`
	EmployeeID *uint   `form:"employee_id" binding:"omitempty"`
	Status     *string `form:"status" binding:"omitempty,oneof='Waiting Approval' Approved Rejected"`
	LeaveType  *string `form:"leave_type" binding:"omitempty"`
}

type CreateLeaveRequestDTO struct {
	LeaveType      enums.LeaveType       `form:"leave_type" binding:"required"`
	StartDate      string                `form:"start_date" binding:"required"`
	EndDate        string                `form:"end_date" binding:"required"`
	EmployeeNote   *string               `form:"employee_note,omitempty"`
	AttachmentFile *multipart.FileHeader `form:"attachment,omitempty"`
}

type UpdateLeaveRequestDTO struct {
	LeaveType      *enums.LeaveType      `form:"leave_type,omitempty"`
	StartDate      *string               `form:"start_date,omitempty"`
	EndDate        *string               `form:"end_date,omitempty"`
	EmployeeNote   *string               `form:"employee_note,omitempty"`
	AttachmentFile *multipart.FileHeader `form:"attachment,omitempty"`
}

type UpdateLeaveRequestStatusDTO struct {
	Status    domain.LeaveStatus `json:"status" binding:"required,oneof='Waiting Approval' Approved Rejected"`
	AdminNote *string            `json:"admin_note,omitempty"`
}

func (dto *CreateLeaveRequestDTO) ToDomain(employeeID uint) (*domain.LeaveRequest, error) {
	startDate, err := time.Parse("2006-01-02", dto.StartDate)
	if err != nil {
		return nil, err
	}

	endDate, err := time.Parse("2006-01-02", dto.EndDate)
	if err != nil {
		return nil, err
	}

	return &domain.LeaveRequest{
		EmployeeID:   employeeID,
		LeaveType:    dto.LeaveType,
		StartDate:    startDate,
		EndDate:      endDate,
		EmployeeNote: dto.EmployeeNote,
		Status:       domain.LeaveStatusPending,
	}, nil
}

func (dto *UpdateLeaveRequestDTO) ToDomain(employeeID uint) (*domain.LeaveRequest, error) {
	updateData := &domain.LeaveRequest{
		EmployeeID: employeeID,
	}

	if dto.LeaveType != nil {
		updateData.LeaveType = *dto.LeaveType
	}

	if dto.StartDate != nil {
		startDate, err := time.Parse("2006-01-02", *dto.StartDate)
		if err != nil {
			return nil, err
		}
		updateData.StartDate = startDate
	}

	if dto.EndDate != nil {
		endDate, err := time.Parse("2006-01-02", *dto.EndDate)
		if err != nil {
			return nil, err
		}
		updateData.EndDate = endDate
	}
	if dto.EmployeeNote != nil {
		updateData.EmployeeNote = dto.EmployeeNote
	}

	return updateData, nil
}
