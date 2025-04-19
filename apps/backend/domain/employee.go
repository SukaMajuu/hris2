package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type Employee struct {
	ID                    uint                 `gorm:"primaryKey"`
	UserID                uint                 `gorm:"not null"`
	User                  User                 `gorm:"foreignKey:UserID"`
	EmployeeCode          string               `gorm:"type:varchar(255);unique;not null;index"`
	FirstName             string               `gorm:"type:varchar(255);not null"`
	LastName              string               `gorm:"type:varchar(255);not null"`
	Gender                enums.Gender         `gorm:"type:gender"`
	Phone                 string               `gorm:"type:varchar(255)"`
	NIK                   string               `gorm:"type:varchar(255);unique;not null"`
	PlaceOfBirth          string               `gorm:"type:varchar(255)"`
	LastEducation         enums.EducationLevel `gorm:"type:education_level"`
	BranchID              uint                 `gorm:"not null"`
	Branch                Branch               `gorm:"foreignKey:BranchID"`
	PositionID            uint                 `gorm:"not null"`
	Position              Position             `gorm:"foreignKey:PositionID"`
	Grade                 string               `gorm:"type:varchar(50)"`
	ContractType          enums.ContractType   `gorm:"type:contract_type"`
	EmploymentStatus      bool                 `gorm:"type:boolean;default:true"`
	ResignationDate       time.Time            `gorm:"type:date"`
	HireDate              time.Time            `gorm:"type:date"`
	BankName              string               `gorm:"type:varchar(100)"`
	BankAccountNumber     string               `gorm:"type:varchar(100)"`
	BankAccountHolderName string               `gorm:"type:varchar(255)"`
	TaxStatus             enums.TaxStatus      `gorm:"type:varchar(10)"`
	ProfilePhotoURL       string               `gorm:"type:varchar(255)"`
	CreatedAt             time.Time            `gorm:"autoCreateTime"`
	UpdatedAt             time.Time            `gorm:"autoUpdateTime"`
}
