package employee

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type EmployeeResponseDTO struct {
	ID                    uint    `json:"id"`
	Email                 *string `json:"email,omitempty"`
	Phone                 *string `json:"phone,omitempty"`
	FirstName             string  `json:"first_name"`
	LastName              *string `json:"last_name,omitempty"`
	EmployeeCode          *string `json:"employee_code,omitempty"`
	Branch                *string `json:"branch,omitempty"`
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
	TotalEmployees       int64    `json:"total_employees"`
	NewEmployees         int64    `json:"new_employees"`
	ActiveEmployees      int64    `json:"active_employees"`
	ResignedEmployees    int64    `json:"resigned_employees"`
	PermanentEmployees   int64    `json:"permanent_employees"`
	ContractEmployees    int64    `json:"contract_employees"`
	FreelanceEmployees   int64    `json:"freelance_employees"`
	TotalEmployeesTrend  *float64 `json:"total_employees_trend,omitempty"`
	NewEmployeesTrend    *float64 `json:"new_employees_trend,omitempty"`
	ActiveEmployeesTrend *float64 `json:"active_employees_trend,omitempty"`
}

type EmployeeListResponseData struct {
	Items      []*EmployeeResponseDTO `json:"items"`
	Pagination domain.Pagination      `json:"pagination"`
}

// FromDomain converts a domain Employee to EmployeeResponseDTO
func (dto *EmployeeResponseDTO) FromDomain(employee *domain.Employee) *EmployeeResponseDTO {
	if employee == nil {
		return nil
	}

	var genderDTO *string
	if employee.Gender != nil {
		genderStr := string(*employee.Gender)
		genderDTO = &genderStr
	}

	var phoneDTO *string
	if employee.User.Phone != "" {
		phoneDTO = &employee.User.Phone
	}

	var emailDTO *string
	if employee.User.Email != "" {
		emailDTO = &employee.User.Email
	}

	responseDTO := &EmployeeResponseDTO{
		ID:                    employee.ID,
		Email:                 emailDTO,
		Phone:                 phoneDTO,
		FirstName:             employee.FirstName,
		LastName:              employee.LastName,
		EmployeeCode:          employee.EmployeeCode,
		PositionName:          employee.PositionName,
		Branch:                employee.Branch,
		Gender:                genderDTO,
		NIK:                   employee.NIK,
		PlaceOfBirth:          employee.PlaceOfBirth,
		Grade:                 employee.Grade,
		EmploymentStatus:      employee.EmploymentStatus,
		BankName:              employee.BankName,
		BankAccountNumber:     employee.BankAccountNumber,
		BankAccountHolderName: employee.BankAccountHolderName,
		ProfilePhotoURL:       employee.ProfilePhotoURL,
		CreatedAt:             employee.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             employee.UpdatedAt.Format(time.RFC3339),
	}

	if employee.LastEducation != nil {
		lastEducationStr := string(*employee.LastEducation)
		responseDTO.LastEducation = &lastEducationStr
	}
	if employee.ContractType != nil {
		contractTypeStr := string(*employee.ContractType)
		responseDTO.ContractType = &contractTypeStr
	}
	if employee.TaxStatus != nil {
		taxStatusStr := string(*employee.TaxStatus)
		responseDTO.TaxStatus = &taxStatusStr
	}
	if employee.DateOfBirth != nil {
		dateOfBirthStr := employee.DateOfBirth.Format("2006-01-02")
		responseDTO.DateOfBirth = &dateOfBirthStr
	}
	if employee.HireDate != nil {
		hireDateStr := employee.HireDate.Format("2006-01-02")
		responseDTO.HireDate = &hireDateStr
	}
	if employee.ResignationDate != nil {
		resignationDateStr := employee.ResignationDate.Format("2006-01-02")
		responseDTO.ResignationDate = &resignationDateStr
	}

	return responseDTO
}

// ToEmployeeResponseDTO is a convenience function to convert domain Employee to response DTO
func ToEmployeeResponseDTO(employee *domain.Employee) *EmployeeResponseDTO {
	return (&EmployeeResponseDTO{}).FromDomain(employee)
}

// ToEmployeeResponseDTOList converts a slice of domain Employees to response DTOs
func ToEmployeeResponseDTOList(employees []*domain.Employee) []*EmployeeResponseDTO {
	if employees == nil {
		return nil
	}

	dtos := make([]*EmployeeResponseDTO, len(employees))
	for i, emp := range employees {
		dtos[i] = ToEmployeeResponseDTO(emp)
	}
	return dtos
}
