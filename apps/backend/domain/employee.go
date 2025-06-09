package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type Employee struct {
	// Required Fields (Non-Nullable)
	ID               uint   `gorm:"primaryKey"`
	UserID           uint   `gorm:"not null"`
	User             User   `gorm:"foreignKey:UserID"`
	FirstName        string `gorm:"type:varchar(255);not null"`
	PositionName     string `gorm:"type:varchar(255)"`
	EmploymentStatus bool   `gorm:"type:boolean;default:true;not null"`

	// Work Schedule Relationship
	WorkScheduleID *uint         `gorm:"type:index"`
	WorkSchedule   *WorkSchedule `gorm:"foreignKey:WorkScheduleID"`

	// Annual Leave Fields
	AnnualLeaveAllowance uint `gorm:"type:uint;default:12;not null"`

	// Self-Reference for Manager-Subordinate Relationship
	ManagerID    *uint      `gorm:"type:uint"`
	Manager      *Employee  `gorm:"foreignKey:ManagerID"`
	Subordinates []Employee `gorm:"foreignKey:ManagerID"`

	// Nullable Fields (Optional)
	LastName              *string               `gorm:"type:varchar(255)"`
	EmployeeCode          *string               `gorm:"type:varchar(255);unique"`
	Branch                *string               `gorm:"type:varchar(255)"`
	Gender                *enums.Gender         `gorm:"type:gender"`
	NIK                   *string               `gorm:"type:varchar(255);unique"`
	PlaceOfBirth          *string               `gorm:"type:varchar(255)"`
	DateOfBirth           *time.Time            `gorm:"type:date"`
	LastEducation         *enums.EducationLevel `gorm:"type:education_level"`
	Grade                 *string               `gorm:"type:varchar(50)"`
	ContractType          *enums.ContractType   `gorm:"type:contract_type"`
	ResignationDate       *time.Time            `gorm:"type:date"`
	HireDate              *time.Time            `gorm:"type:date"`
	BankName              *string               `gorm:"type:varchar(100)"`
	BankAccountNumber     *string               `gorm:"type:varchar(100)"`
	BankAccountHolderName *string               `gorm:"type:varchar(255)"`
	TaxStatus             *enums.TaxStatus      `gorm:"type:tax_status"`
	ProfilePhotoURL       *string               `gorm:"type:varchar(255)"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (a *Employee) TableName() string {
	return "employees"
}
