package employee

import (
	"fmt"
	"log"
	"mime/multipart"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type ListEmployeesRequestQuery struct {
	Page     int     `form:"page" binding:"omitempty,min=1"`
	PageSize int     `form:"page_size" binding:"omitempty,min=1,max=100"`
	Status   *string `form:"status" binding:"omitempty,oneof=active inactive"`
	Search   *string `form:"search" binding:"omitempty"`
	Gender   *string `form:"gender" binding:"omitempty,oneof=Male Female"`
}

type CreateEmployeeRequestDTO struct {
	Email    string  `form:"email" binding:"required,email"`
	Password string  `form:"password" binding:"omitempty,min=8"`
	Phone    *string `form:"phone,omitempty" binding:"omitempty,e164"`

	UserID                uint                  `form:"user_id,omitempty" binding:"omitempty"`
	FirstName             string                `form:"first_name" binding:"required"`
	LastName              *string               `form:"last_name,omitempty"`
	PositionName          string                `form:"position_name" binding:"required"`
	EmploymentStatus      *bool                 `form:"employment_status,omitempty"`
	EmployeeCode          *string               `form:"employee_code,omitempty" binding:"omitempty,alphanum,max=50"`
	Branch                *string               `form:"branch,omitempty"`
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
	PositionName          *string               `form:"position_name,omitempty"`
	EmploymentStatus      *bool                 `form:"employment_status,omitempty"`
	EmployeeCode          *string               `form:"employee_code,omitempty" binding:"omitempty,alphanum,max=50"`
	Branch                *string               `form:"branch,omitempty"`
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

func MapCreateDTOToDomain(reqDTO *CreateEmployeeRequestDTO) (*domain.Employee, error) {
	userDomain := domain.User{
		Email:    reqDTO.Email,
		Password: reqDTO.Password,
	}
	if reqDTO.Phone != nil {
		userDomain.Phone = *reqDTO.Phone
	}

	employeeDomain := &domain.Employee{
		User:                  userDomain,
		FirstName:             reqDTO.FirstName,
		LastName:              reqDTO.LastName,
		PositionName:          reqDTO.PositionName,
		EmployeeCode:          reqDTO.EmployeeCode,
		Branch:                reqDTO.Branch,
		Gender:                reqDTO.Gender,
		NIK:                   reqDTO.NIK,
		PlaceOfBirth:          reqDTO.PlaceOfBirth,
		LastEducation:         reqDTO.LastEducation,
		Grade:                 reqDTO.Grade,
		ContractType:          reqDTO.ContractType,
		BankName:              reqDTO.BankName,
		BankAccountNumber:     reqDTO.BankAccountNumber,
		BankAccountHolderName: reqDTO.BankAccountHolderName,
		TaxStatus:             reqDTO.TaxStatus,
		ProfilePhotoURL:       reqDTO.ProfilePhotoURL,
	}

	// Parse dates
	if err := parseDatesForCreate(reqDTO, employeeDomain); err != nil {
		return nil, err
	}

	// Set employment status
	if reqDTO.EmploymentStatus != nil {
		employeeDomain.EmploymentStatus = *reqDTO.EmploymentStatus
	} else {
		employeeDomain.EmploymentStatus = true
	}

	return employeeDomain, nil
}

func parseDatesForCreate(reqDTO *CreateEmployeeRequestDTO, employeeDomain *domain.Employee) error {
	if reqDTO.DateOfBirth != nil && *reqDTO.DateOfBirth != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.DateOfBirth)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing DateOfBirth '%s': %v", *reqDTO.DateOfBirth, err)
			return fmt.Errorf("invalid DateOfBirth format. Please use YYYY-MM-DD. Value: %s", *reqDTO.DateOfBirth)
		}
		employeeDomain.DateOfBirth = &parsedDate
	}

	if reqDTO.ResignationDate != nil && *reqDTO.ResignationDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.ResignationDate)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing ResignationDate '%s': %v", *reqDTO.ResignationDate, err)
			return fmt.Errorf("invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate)
		}
		employeeDomain.ResignationDate = &parsedDate
	}

	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing HireDate '%s': %v", *reqDTO.HireDate, err)
			return fmt.Errorf("invalid HireDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.HireDate)
		}
		employeeDomain.HireDate = &parsedDate
	}

	return nil
}
