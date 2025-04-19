package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type Employee struct {
    // Required Fields (Non-Nullable)
    ID               uint              `gorm:"primaryKey"`
    UserID           uint              `gorm:"not null"`
    User             User              `gorm:"foreignKey:UserID"`
    FirstName        string            `gorm:"type:varchar(255);not null"`
    LastName         string            `gorm:"type:varchar(255);not null"`
    PositionID       uint              `gorm:"type:uint"`
    Position         Position          `gorm:"foreignKey:PositionID"`
    EmploymentStatus bool              `gorm:"type:boolean;default:true;not null"`

    // Nullable Fields (Optional)
    EmployeeCode          *string               `gorm:"type:varchar(255);unique"`
    BranchID              *uint                 `gorm:"type:uint"`
    Branch                *Branch               `gorm:"foreignKey:BranchID"`
    Gender                *enums.Gender         `gorm:"type:gender"`
    Phone                 *string               `gorm:"type:varchar(255)"`
    NIK                   *string               `gorm:"type:varchar(255);unique"`
    PlaceOfBirth          *string               `gorm:"type:varchar(255)"`
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

    // Auto-Timestamps
    CreatedAt time.Time `gorm:"autoCreateTime"`
    UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (a *Employee) TableName() string {
	return "employees"
}
