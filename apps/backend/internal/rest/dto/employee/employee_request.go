package employee

import "github.com/SukaMajuu/hris/apps/backend/domain/enums"

type ListEmployeesRequestQuery struct {
	Page     int     `form:"page" binding:"omitempty,min=1"`
	PageSize int     `form:"page_size" binding:"omitempty,min=1,max=100"`
	Status   *string `form:"status" binding:"omitempty,oneof=active inactive"`
}

type CreateEmployeeRequestDTO struct {
	Email    string  `json:"email" binding:"required,email"`
	Password string  `json:"password" binding:"omitempty,min=8"`
	Phone    *string `json:"phone,omitempty" binding:"omitempty,e164"`

	UserID                uint                  `json:"user_id,omitempty" binding:"omitempty"`
	FirstName             string                `json:"first_name" binding:"required"`
	LastName              *string               `json:"last_name,omitempty"`
	PositionID            uint                  `json:"position_id" binding:"required"`
	EmploymentStatus      *bool                 `json:"employment_status,omitempty"`
	EmployeeCode          *string               `json:"employee_code,omitempty" binding:"omitempty,alphanum,max=50"`
	BranchID              *uint                 `json:"branch_id,omitempty"`
	Gender                *enums.Gender         `json:"gender,omitempty" binding:"omitempty"`
	NIK                   *string               `json:"nik,omitempty" binding:"omitempty,numeric"`
	PlaceOfBirth          *string               `json:"place_of_birth,omitempty"`
	LastEducation         *enums.EducationLevel `json:"last_education,omitempty"`
	Grade                 *string               `json:"grade,omitempty"`
	ContractType          *enums.ContractType   `json:"contract_type,omitempty"`
	ResignationDate       *string               `json:"resignation_date,omitempty"`
	HireDate              *string               `json:"hire_date,omitempty"`
	BankName              *string               `json:"bank_name,omitempty"`
	BankAccountNumber     *string               `json:"bank_account_number,omitempty"`
	BankAccountHolderName *string               `json:"bank_account_holder_name,omitempty"`
	TaxStatus             *enums.TaxStatus      `json:"tax_status,omitempty"`
	ProfilePhotoURL       *string               `json:"profile_photo_url,omitempty"`
}

type UpdateEmployeeRequestDTO struct {
	Email                 *string               `json:"email,omitempty" binding:"omitempty,email"`
	Phone                 *string               `json:"phone,omitempty" binding:"omitempty,e164"`
	FirstName             *string               `json:"first_name,omitempty"`
	LastName              *string               `json:"last_name,omitempty"`
	PositionID            *uint                 `json:"position_id,omitempty"`
	EmploymentStatus      *bool                 `json:"employment_status,omitempty"`
	EmployeeCode          *string               `json:"employee_code,omitempty" binding:"omitempty,alphanum,max=50"`
	BranchID              *uint                 `json:"branch_id,omitempty"`
	Gender                *enums.Gender         `json:"gender,omitempty" binding:"omitempty"`
	NIK                   *string               `json:"nik,omitempty" binding:"omitempty,numeric"`
	PlaceOfBirth          *string               `json:"place_of_birth,omitempty"`
	LastEducation         *enums.EducationLevel `json:"last_education,omitempty"`
	Grade                 *string               `json:"grade,omitempty"`
	ContractType          *enums.ContractType   `json:"contract_type,omitempty"`
	ResignationDate       *string               `json:"resignation_date,omitempty"`
	HireDate              *string               `json:"hire_date,omitempty"`
	BankName              *string               `json:"bank_name,omitempty"`
	BankAccountNumber     *string               `json:"bank_account_number,omitempty"`
	BankAccountHolderName *string               `json:"bank_account_holder_name,omitempty"`
	TaxStatus             *enums.TaxStatus      `json:"tax_status,omitempty"`
	ProfilePhotoURL       *string               `json:"profile_photo_url,omitempty" binding:"omitempty,url"`
}
