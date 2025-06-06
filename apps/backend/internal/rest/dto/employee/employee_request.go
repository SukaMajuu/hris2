package employee

import (
	"fmt"
	"log"
	"mime/multipart"
	"strings"
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

	PhotoFile *multipart.FileHeader `form:"photo_file,omitempty"`
}

type UploadEmployeePhotoRequestDTO struct {
	File *multipart.FileHeader `form:"file" binding:"required"`
}

type BulkImportEmployeesRequestDTO struct {
	File *multipart.FileHeader `form:"file" binding:"required"`
}

type BulkImportEmployeeData struct {
	Email                 string  `json:"email" binding:"required,email"`
	FirstName             string  `json:"first_name" binding:"required"`
	LastName              *string `json:"last_name,omitempty"`
	PositionName          string  `json:"position_name" binding:"required"`
	EmployeeCode          *string `json:"employee_code,omitempty"`
	Branch                *string `json:"branch,omitempty"`
	Gender                *string `json:"gender,omitempty"`
	Phone                 *string `json:"phone,omitempty"`
	NIK                   *string `json:"nik,omitempty"`
	PlaceOfBirth          *string `json:"place_of_birth,omitempty"`
	DateOfBirth           *string `json:"date_of_birth,omitempty"`
	LastEducation         *string `json:"last_education,omitempty"`
	Grade                 *string `json:"grade,omitempty"`
	ContractType          *string `json:"contract_type,omitempty"`
	HireDate              *string `json:"hire_date,omitempty"`
	TaxStatus             *string `json:"tax_status,omitempty"`
	BankName              *string `json:"bank_name,omitempty"`
	BankAccountNumber     *string `json:"bank_account_number,omitempty"`
	BankAccountHolderName *string `json:"bank_account_holder_name,omitempty"`
}

type BulkImportResult struct {
	SuccessCount    int                      `json:"success_count"`
	ErrorCount      int                      `json:"error_count"`
	SuccessfulRows  []BulkImportEmployeeData `json:"successful_rows"`
	FailedRows      []BulkImportFailedRow    `json:"failed_rows"`
	DuplicateEmails []string                 `json:"duplicate_emails,omitempty"`
	DuplicateNIKs   []string                 `json:"duplicate_niks,omitempty"`
	DuplicateCodes  []string                 `json:"duplicate_codes,omitempty"`
}

type BulkImportFailedRow struct {
	Row    int                    `json:"row"`
	Data   BulkImportEmployeeData `json:"data"`
	Errors []BulkImportError      `json:"errors"`
}

type BulkImportError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   string `json:"value,omitempty"`
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

	if err := parseDatesForCreate(reqDTO, employeeDomain); err != nil {
		return nil, err
	}

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

func MapUpdateDTOToDomain(employeeID uint, reqDTO *UpdateEmployeeRequestDTO) (*domain.Employee, error) {
	employeeUpdatePayload := &domain.Employee{
		ID: employeeID,
	}

	if reqDTO.Email != nil || reqDTO.Phone != nil {
		employeeUpdatePayload.User = domain.User{}
		if reqDTO.Email != nil {
			employeeUpdatePayload.User.Email = *reqDTO.Email
		}
		if reqDTO.Phone != nil {
			employeeUpdatePayload.User.Phone = *reqDTO.Phone
		}
	}

	if reqDTO.FirstName != nil {
		employeeUpdatePayload.FirstName = *reqDTO.FirstName
	}
	if reqDTO.LastName != nil {
		employeeUpdatePayload.LastName = reqDTO.LastName
	}
	if reqDTO.PositionName != nil {
		employeeUpdatePayload.PositionName = *reqDTO.PositionName
	}
	if reqDTO.EmploymentStatus != nil {
		employeeUpdatePayload.EmploymentStatus = *reqDTO.EmploymentStatus
	}
	if reqDTO.EmployeeCode != nil {
		employeeUpdatePayload.EmployeeCode = reqDTO.EmployeeCode
	}
	if reqDTO.Branch != nil {
		employeeUpdatePayload.Branch = reqDTO.Branch
	}
	if reqDTO.Gender != nil {
		employeeUpdatePayload.Gender = reqDTO.Gender
	}
	if reqDTO.NIK != nil {
		employeeUpdatePayload.NIK = reqDTO.NIK
	}
	if reqDTO.PlaceOfBirth != nil {
		employeeUpdatePayload.PlaceOfBirth = reqDTO.PlaceOfBirth
	}
	if reqDTO.DateOfBirth != nil && *reqDTO.DateOfBirth != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.DateOfBirth)
		if err != nil {
			return nil, fmt.Errorf("invalid DateOfBirth format. Please use YYYY-MM-DD. Value: %s", *reqDTO.DateOfBirth)
		}
		employeeUpdatePayload.DateOfBirth = &parsedDate
	}
	if reqDTO.LastEducation != nil {
		employeeUpdatePayload.LastEducation = reqDTO.LastEducation
	}
	if reqDTO.Grade != nil {
		employeeUpdatePayload.Grade = reqDTO.Grade
	}
	if reqDTO.ContractType != nil {
		employeeUpdatePayload.ContractType = reqDTO.ContractType
	}
	if reqDTO.ResignationDate != nil && *reqDTO.ResignationDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.ResignationDate)
		if err != nil {
			return nil, fmt.Errorf("invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate)
		}
		employeeUpdatePayload.ResignationDate = &parsedDate
	}
	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
			return nil, fmt.Errorf("invalid HireDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.HireDate)
		}
		employeeUpdatePayload.HireDate = &parsedDate
	}
	if reqDTO.BankName != nil {
		employeeUpdatePayload.BankName = reqDTO.BankName
	}
	if reqDTO.BankAccountNumber != nil {
		employeeUpdatePayload.BankAccountNumber = reqDTO.BankAccountNumber
	}
	if reqDTO.BankAccountHolderName != nil {
		employeeUpdatePayload.BankAccountHolderName = reqDTO.BankAccountHolderName
	}
	if reqDTO.TaxStatus != nil {
		employeeUpdatePayload.TaxStatus = reqDTO.TaxStatus
	}
	if reqDTO.ProfilePhotoURL != nil {
		employeeUpdatePayload.ProfilePhotoURL = reqDTO.ProfilePhotoURL
	}
	return employeeUpdatePayload, nil
}

func ParseEmployeeFromRecord(headers, record []string, rowNum int) (*domain.Employee, []BulkImportError) {
	var errors []BulkImportError

	fieldMap := createFieldMap(headers, record)

	if requiredErrors := validateRequiredFields(fieldMap, rowNum); len(requiredErrors) > 0 {
		return nil, requiredErrors
	}

	employee := createBasicEmployee(fieldMap)

	parseOptionalStringFields(employee, fieldMap)

	if dateErrors := parseDateFields(employee, fieldMap, rowNum); len(dateErrors) > 0 {
		errors = append(errors, dateErrors...)
	}

	if enumErrors := parseEnumFields(employee, fieldMap, rowNum); len(enumErrors) > 0 {
		errors = append(errors, enumErrors...)
	}

	parseBankFields(employee, fieldMap)

	if len(errors) > 0 {
		return nil, errors
	}

	return employee, nil
}

func createFieldMap(headers, record []string) map[string]string {
	fieldMap := make(map[string]string)
	for i, header := range headers {
		normalizedHeader := strings.ToLower(strings.TrimSpace(header))
		normalizedHeader = strings.ReplaceAll(normalizedHeader, " ", "_")
		if i < len(record) {
			fieldMap[normalizedHeader] = strings.TrimSpace(record[i])
		}
	}
	return fieldMap
}

func validateRequiredFields(fieldMap map[string]string, rowNum int) []BulkImportError {
	var errors []BulkImportError
	requiredFields := []string{"email", "first_name", "position_name"}

	for _, field := range requiredFields {
		if fieldMap[field] == "" {
			errors = append(errors, BulkImportError{
				Field:   field,
				Message: fmt.Sprintf("Row %d: %s is required", rowNum, field),
				Value:   fieldMap[field],
			})
		}
	}
	return errors
}

func createBasicEmployee(fieldMap map[string]string) *domain.Employee {
	user := domain.User{
		Email:    fieldMap["email"],
		Password: "password",
	}

	if fieldMap["phone"] != "" {
		user.Phone = fieldMap["phone"]
	}

	return &domain.Employee{
		User:         user,
		FirstName:    fieldMap["first_name"],
		PositionName: fieldMap["position_name"],
	}
}

func parseOptionalStringFields(employee *domain.Employee, fieldMap map[string]string) {
	if fieldMap["last_name"] != "" {
		lastName := fieldMap["last_name"]
		employee.LastName = &lastName
	}
	if fieldMap["employee_code"] != "" {
		employeeCode := fieldMap["employee_code"]
		employee.EmployeeCode = &employeeCode
	}
	if fieldMap["branch"] != "" {
		branch := fieldMap["branch"]
		employee.Branch = &branch
	}
	if fieldMap["nik"] != "" {
		nik := fieldMap["nik"]
		employee.NIK = &nik
	}
	if fieldMap["place_of_birth"] != "" {
		placeOfBirth := fieldMap["place_of_birth"]
		employee.PlaceOfBirth = &placeOfBirth
	}
	if fieldMap["grade"] != "" {
		grade := fieldMap["grade"]
		employee.Grade = &grade
	}
}

func parseDateFields(employee *domain.Employee, fieldMap map[string]string, rowNum int) []BulkImportError {
	var errors []BulkImportError

	if fieldMap["date_of_birth"] != "" {
		if date, err := time.Parse("2006-01-02", fieldMap["date_of_birth"]); err == nil {
			employee.DateOfBirth = &date
		} else {
			errors = append(errors, BulkImportError{
				Field:   "date_of_birth",
				Message: fmt.Sprintf("Row %d: date_of_birth must be in YYYY-MM-DD format", rowNum),
				Value:   fieldMap["date_of_birth"],
			})
		}
	}

	if fieldMap["hire_date"] != "" {
		if date, err := time.Parse("2006-01-02", fieldMap["hire_date"]); err == nil {
			employee.HireDate = &date
		} else {
			errors = append(errors, BulkImportError{
				Field:   "hire_date",
				Message: fmt.Sprintf("Row %d: hire_date must be in YYYY-MM-DD format", rowNum),
				Value:   fieldMap["hire_date"],
			})
		}
	}

	return errors
}

func parseEnumFields(employee *domain.Employee, fieldMap map[string]string, rowNum int) []BulkImportError {
	var errors []BulkImportError

	if fieldMap["gender"] != "" {
		if fieldMap["gender"] == "Male" || fieldMap["gender"] == "Female" {
			gender := enums.Gender(fieldMap["gender"])
			employee.Gender = &gender
		} else {
			errors = append(errors, BulkImportError{
				Field:   "gender",
				Message: fmt.Sprintf("Row %d: gender must be 'Male' or 'Female'", rowNum),
				Value:   fieldMap["gender"],
			})
		}
	}

	if fieldMap["last_education"] != "" {
		validEducation := []string{"SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "S1/D4", "S2", "S3", "Other"}
		if isValidEnum(fieldMap["last_education"], validEducation) {
			education := enums.EducationLevel(fieldMap["last_education"])
			employee.LastEducation = &education
		} else {
			errors = append(errors, BulkImportError{
				Field:   "last_education",
				Message: fmt.Sprintf("Row %d: invalid education level", rowNum),
				Value:   fieldMap["last_education"],
			})
		}
	}

	if fieldMap["contract_type"] != "" {
		validContracts := []string{"permanent", "contract", "freelance"}
		if isValidEnum(fieldMap["contract_type"], validContracts) {
			contract := enums.ContractType(fieldMap["contract_type"])
			employee.ContractType = &contract
		} else {
			errors = append(errors, BulkImportError{
				Field:   "contract_type",
				Message: fmt.Sprintf("Row %d: invalid contract type", rowNum),
				Value:   fieldMap["contract_type"],
			})
		}
	}

	if fieldMap["tax_status"] != "" {
		validTaxStatus := []string{"TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3", "K/I/0", "K/I/1", "K/I/2", "K/I/3"}
		if isValidEnum(fieldMap["tax_status"], validTaxStatus) {
			tax := enums.TaxStatus(fieldMap["tax_status"])
			employee.TaxStatus = &tax
		} else {
			errors = append(errors, BulkImportError{
				Field:   "tax_status",
				Message: fmt.Sprintf("Row %d: invalid tax status", rowNum),
				Value:   fieldMap["tax_status"],
			})
		}
	}

	return errors
}

func parseBankFields(employee *domain.Employee, fieldMap map[string]string) {
	if fieldMap["bank_name"] != "" {
		bankName := fieldMap["bank_name"]
		employee.BankName = &bankName
	}
	if fieldMap["bank_account_number"] != "" {
		bankAccountNumber := fieldMap["bank_account_number"]
		employee.BankAccountNumber = &bankAccountNumber
	}
	if fieldMap["bank_account_holder_name"] != "" {
		bankAccountHolderName := fieldMap["bank_account_holder_name"]
		employee.BankAccountHolderName = &bankAccountHolderName
	}
}

func isValidEnum(value string, validValues []string) bool {
	for _, valid := range validValues {
		if value == valid {
			return true
		}
	}
	return false
}
