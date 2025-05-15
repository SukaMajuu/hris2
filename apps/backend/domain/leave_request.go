package domain

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"time"
)

type LeaveStatus string

const (
	LeaveStatusPending  LeaveStatus = "Waiting Approval"
	LeaveStatusApproved LeaveStatus = "Approved"
	LeaveStatusRejected LeaveStatus = "Rejected"
)

type LeaveRequest struct {
	ID           uint            `gorm:"primaryKey"`
	EmployeeID   uint            `gorm:"not null"`
	Employee     Employee        `gorm:"foreignKey:EmployeeID"`
	LeaveTypeID  uint            `gorm:"not null"`
	LeaveType    enums.LeaveType `gorm:"foreignKey:LeaveTypeID"`
	StartDate    *time.Time      `gorm:"not null"`
	EndDate      *time.Time      `gorm:"not null"`
	Attachment   *string         `gorm:"type:varchar(255)"`
	EmployeeNote *string         `gorm:"type:varchar(255)"`
	AdminNote    *string         `gorm:"type:varchar(255)"`
	Status       LeaveStatus     `gorm:"type:leave_status;not null;default:Waiting Approval"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (lr *LeaveRequest) TableName() string {
	return "leave_requests"
}
