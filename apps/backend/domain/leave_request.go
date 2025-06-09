package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
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
	LeaveType    enums.LeaveType `gorm:"type:leave_type;not null"`
	StartDate    time.Time       `gorm:"type:timestamp;not null"`
	EndDate      time.Time       `gorm:"type:timestamp;not null"`
	Attachment   *string         `gorm:"type:varchar(255)"`
	EmployeeNote *string         `gorm:"type:varchar(255)"`
	AdminNote    *string         `gorm:"type:varchar(255)"`
	Duration     uint            `gorm:"type:uint;not null"`
	Status       LeaveStatus     `gorm:"type:leave_status;not null;default:'Waiting Approval'"`

	DateRequested time.Time  `gorm:"type:timestamp;not null"`
	DateApproved  *time.Time `gorm:"type:timestamp"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (lr *LeaveRequest) TableName() string {
	return "leave_requests"
}
