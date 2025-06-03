package employee

import (
	"mime/multipart"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type ListEmployeesRequestQuery struct {
	Page     int     `form:"page" binding:"omitempty,min=1"`
	PageSize int     `form:"page_size" binding:"omitempty,min=1,max=100"`
	Status   *string `form:"status" binding:"omitempty,oneof=active inactive"`
}

type CreateEmployeeRequestDTO struct {
	Email    string  `form:"email" binding:"required,email"`
	Password string  `form:"password" binding:"omitempty,min=8"`
	Phone    *string `form:"phone,omitempty" binding:"omitempty,e164"`

	UserID                uint                  `form:"user_id,omitempty" binding:"omitempty"`
	FirstName             string                `form:"first_name" binding:"required"`
	LastName              *string               `form:"last_name,omitempty"`
	PositionID            uint                  `form:"position_id" binding:"required"`
	EmploymentStatus      *bool                 `form:"employment_status,omitempty"`
	EmployeeCode          *string               `form:"employee_code,omitempty" binding:"omitempty,alphanum,max=50"`
	BranchID              *uint                 `form:"branch_id,omitempty"`
	Gender                *enums.Gender         `form:"gender,omitempty" binding:"omitempty"`
	NIK                   *string               `form:"nik,omitempty" binding:"omitempty,numeric"`
	PlaceOfBirth          *string               `form:"place_of_birth,omitempty"`
	DateOfBirth           *string               `form:"date_of_birth,omitempty"`
	LastEducation         *enums.EducationLevel `form:"last_education,omitempty"`
	Grade                 *string               `form:"grade,omitempty"`
	ContractType          *enums.ContractType   `form:"contract_type,omitempty"`
	ResignationDate       *string               `form:"resignation_date,omitempty"`
	HireDate              *string               `form:"hire_date,omitempty"`
	BankName              *string               `form:"bank_name,omitempty"`
	BankAccountNumber     *string               `form:"bank_account_number,omitempty"`
	BankAccountHolderName *string               `form:"bank_account_holder_name,omitempty"`
	TaxStatus             *enums.TaxStatus      `form:"tax_status,omitempty"`
	ProfilePhotoURL       *string               `form:"profile_photo_url,omitempty"`

	// Optional photo file upload
	PhotoFile *multipart.FileHeader `form:"photo_file,omitempty"`
}

type UpdateEmployeeRequestDTO struct {
	Email                 *string               `form:"email,omitempty" binding:"omitempty,email"`
	Phone                 *string               `form:"phone,omitempty" binding:"omitempty,e164"`
	FirstName             *string               `form:"first_name,omitempty"`
	LastName              *string               `form:"last_name,omitempty"`
	PositionID            *uint                 `form:"position_id,omitempty"`
	EmploymentStatus      *bool                 `form:"employment_status,omitempty"`
	EmployeeCode          *string               `form:"employee_code,omitempty" binding:"omitempty,alphanum,max=50"`
	BranchID              *uint                 `form:"branch_id,omitempty"`
	Gender                *enums.Gender         `form:"gender,omitempty" binding:"omitempty"`
	NIK                   *string               `form:"nik,omitempty" binding:"omitempty,numeric"`
	PlaceOfBirth          *string               `form:"place_of_birth,omitempty"`
	DateOfBirth           *string               `form:"date_of_birth,omitempty"`
	LastEducation         *enums.EducationLevel `form:"last_education,omitempty"`
	Grade                 *string               `form:"grade,omitempty"`
	ContractType          *enums.ContractType   `form:"contract_type,omitempty"`
	ResignationDate       *string               `form:"resignation_date,omitempty"`
	HireDate              *string               `form:"hire_date,omitempty"`
	BankName              *string               `form:"bank_name,omitempty"`
	BankAccountNumber     *string               `form:"bank_account_number,omitempty"`
	BankAccountHolderName *string               `form:"bank_account_holder_name,omitempty"`
	TaxStatus             *enums.TaxStatus      `form:"tax_status,omitempty"`
	ProfilePhotoURL       *string               `form:"profile_photo_url,omitempty"`

	// Optional photo file upload
	PhotoFile *multipart.FileHeader `form:"photo_file,omitempty"`
}

type UploadEmployeePhotoRequestDTO struct {
	File *multipart.FileHeader `form:"file" binding:"required"`
}
