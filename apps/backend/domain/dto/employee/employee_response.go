package employee

import "github.com/SukaMajuu/hris/apps/backend/domain"

type EmployeeResponseDTO struct {
	ID                    uint    `json:"id"`
	Email                 *string `json:"email,omitempty"`
	Phone                 *string `json:"phone,omitempty"`
	FirstName             string  `json:"first_name"`
	LastName              *string `json:"last_name,omitempty"`
	EmployeeCode          *string `json:"employee_code,omitempty"`
	BranchName            *string `json:"branch_name,omitempty"`
	PositionName          string  `json:"position_name"`
	Gender                *string `json:"gender,omitempty"`
	NIK                   *string `json:"nik,omitempty"`
	PlaceOfBirth          *string `json:"place_of_birth,omitempty"`
	DateOfBirth           *string `json:"date_of_birth,omitempty"`
	LastEducation         *string `json:"last_education,omitempty"`
	Grade                 *string `json:"grade,omitempty"`
	ContractType          *string `json:"contract_type,omitempty"`
	EmploymentStatus      bool    `json:"employment_status"`
	HireDate              *string `json:"hire_date,omitempty"`
	ResignationDate       *string `json:"resignation_date,omitempty"`
	BankName              *string `json:"bank_name,omitempty"`
	BankAccountNumber     *string `json:"bank_account_number,omitempty"`
	BankAccountHolderName *string `json:"bank_account_holder_name,omitempty"`
	TaxStatus             *string `json:"tax_status,omitempty"`
	ProfilePhotoURL       *string `json:"profile_photo_url,omitempty"`
	CreatedAt             string  `json:"created_at"`
	UpdatedAt             string  `json:"updated_at"`
}

type EmployeeStatisticsResponseDTO struct {
	TotalEmployees     int64 `json:"total_employees"`
	NewEmployees       int64 `json:"new_employees"`
	ActiveEmployees    int64 `json:"active_employees"`
	ResignedEmployees  int64 `json:"resigned_employees"`
	PermanentEmployees int64 `json:"permanent_employees"`
	ContractEmployees  int64 `json:"contract_employees"`
	FreelanceEmployees int64 `json:"freelance_employees"`
}

type EmployeeListResponseData struct {
	Items      []*EmployeeResponseDTO `json:"items"`
	Pagination domain.Pagination      `json:"pagination"`
}
