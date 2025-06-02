package handler

import (
	"errors"
	"fmt"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	domainEmployeeDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	employeeDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/employee"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type EmployeeHandler struct {
	employeeUseCase *employeeUseCase.EmployeeUseCase
}

func NewEmployeeHandler(useCase *employeeUseCase.EmployeeUseCase) *EmployeeHandler {
	return &EmployeeHandler{
		employeeUseCase: useCase,
	}
}

func (h *EmployeeHandler) ListEmployees(c *gin.Context) {
	var queryDTO employeeDTO.ListEmployeesRequestQuery

	if bindAndValidateQuery(c, &queryDTO) {
		return
	}

	paginationParams := domain.PaginationParams{
		Page:     queryDTO.Page,
		PageSize: queryDTO.PageSize,
	}

	if paginationParams.Page == 0 {
		paginationParams.Page = 1
	}
	if paginationParams.PageSize == 0 {
		paginationParams.PageSize = 10
	}

	filters := make(map[string]interface{})
	if queryDTO.Status != nil {
		filters["status"] = *queryDTO.Status
	}

	log.Printf("EmployeeHandler: Listing employees with DTO: %+v, Parsed Filters: %+v, Pagination: %+v", queryDTO, filters, paginationParams)

	employeeData, err := h.employeeUseCase.List(c.Request.Context(), filters, paginationParams)
	if err != nil {
		log.Printf("EmployeeHandler: Error listing employees from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employees list"))
		return
	}

	response.Success(c, http.StatusOK, "Employees retrieved successfully", employeeData)
}

func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var reqDTO employeeDTO.CreateEmployeeRequestDTO

	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding form data for create: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	if reqDTO.PhotoFile != nil {
		log.Printf("EmployeeHandler: Photo file detected: %s", reqDTO.PhotoFile.Filename)
		// TODO: Add validation back after fixing upload issue
	}

	// Convert DTO to domain model
	employeeDomain, err := h.mapCreateDTOToDomain(&reqDTO)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	// Create employee
	createdEmployee, err := h.employeeUseCase.Create(c.Request.Context(), employeeDomain)
	if err != nil {
		h.handleCreateEmployeeError(c, err)
		return
	}

	// Handle photo upload if provided
	if reqDTO.PhotoFile != nil {
		createdEmployee = h.handlePhotoUploadForNewEmployee(c, createdEmployee, reqDTO.PhotoFile)
	}

	// Convert domain to response DTO
	respDTO := h.mapDomainToResponseDTO(createdEmployee)
	response.Success(c, http.StatusCreated, "Employee created successfully", respDTO)
}

func (h *EmployeeHandler) mapCreateDTOToDomain(reqDTO *employeeDTO.CreateEmployeeRequestDTO) (*domain.Employee, error) {
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
		PositionID:            reqDTO.PositionID,
		EmployeeCode:          reqDTO.EmployeeCode,
		BranchID:              reqDTO.BranchID,
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
	if err := h.parseDatesForCreate(reqDTO, employeeDomain); err != nil {
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

func (h *EmployeeHandler) parseDatesForCreate(reqDTO *employeeDTO.CreateEmployeeRequestDTO, employeeDomain *domain.Employee) error {
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

func (h *EmployeeHandler) handleCreateEmployeeError(c *gin.Context, err error) {
	log.Printf("EmployeeHandler: Error creating employee from use case: %v", err)
	if errors.Is(err, domain.ErrUserAlreadyExists) || errors.Is(err, domain.ErrEmailAlreadyExists) {
		response.Error(c, http.StatusConflict, "Failed to create employee: user or email already exists.", err)
	} else {
		response.InternalServerError(c, fmt.Errorf("failed to create employee: %w", err))
	}
}

func (h *EmployeeHandler) handlePhotoUploadForNewEmployee(c *gin.Context, createdEmployee *domain.Employee, photoFile *multipart.FileHeader) *domain.Employee {
	log.Printf("EmployeeHandler: Uploading photo for newly created employee ID: %d", createdEmployee.ID)

	updatedEmployee, err := h.employeeUseCase.UploadProfilePhoto(c.Request.Context(), createdEmployee.ID, photoFile)
	if err != nil {
		log.Printf("EmployeeHandler: Error uploading photo for new employee: %v", err)
		log.Printf("EmployeeHandler: Employee created successfully but photo upload failed")
		return createdEmployee
	}

	log.Printf("EmployeeHandler: Photo uploaded successfully for new employee")
	return updatedEmployee
}

func (h *EmployeeHandler) GetEmployeeByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	employeeDTO, err := h.employeeUseCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
			return
		}
		log.Printf("EmployeeHandler: Error getting employee by ID %d from use case: %v", id, err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employee"))
		return
	}

	response.Success(c, http.StatusOK, "Employee retrieved successfully", employeeDTO)
}

func (h *EmployeeHandler) mapUpdateDTOToDomain(employeeID uint, reqDTO *employeeDTO.UpdateEmployeeRequestDTO) (*domain.Employee, error) {
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
	if reqDTO.PositionID != nil {
		employeeUpdatePayload.PositionID = *reqDTO.PositionID
	}
	if reqDTO.EmploymentStatus != nil {
		employeeUpdatePayload.EmploymentStatus = *reqDTO.EmploymentStatus
	}
	if reqDTO.EmployeeCode != nil {
		employeeUpdatePayload.EmployeeCode = reqDTO.EmployeeCode
	}
	if reqDTO.BranchID != nil {
		employeeUpdatePayload.BranchID = reqDTO.BranchID
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
			log.Printf("EmployeeHandler: Error parsing DateOfBirth '%s': %v", *reqDTO.DateOfBirth, err)
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
			log.Printf("EmployeeHandler: Error parsing ResignationDate '%s': %v", *reqDTO.ResignationDate, err)
			return nil, fmt.Errorf("invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate)
		}
		employeeUpdatePayload.ResignationDate = &parsedDate
	}
	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing HireDate '%s': %v", *reqDTO.HireDate, err)
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

func (h *EmployeeHandler) mapDomainToResponseDTO(employee *domain.Employee) *domainEmployeeDTO.EmployeeResponseDTO {
	var genderDTO *string
	if employee.Gender != nil {
		genderStr := string(*employee.Gender)
		genderDTO = &genderStr
	}
	var phoneDTO *string
	if employee.User.Phone != "" {
		phoneDTO = &employee.User.Phone
	}

	respDTO := &domainEmployeeDTO.EmployeeResponseDTO{
		ID:                    employee.ID,
		Email:                 &employee.User.Email,
		Phone:                 phoneDTO,
		FirstName:             employee.FirstName,
		LastName:              employee.LastName,
		EmployeeCode:          employee.EmployeeCode,
		PositionName:          employee.Position.Name,
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

	if employee.Branch != nil {
		respDTO.BranchName = &employee.Branch.Name
	}
	if employee.LastEducation != nil {
		lastEducationStr := string(*employee.LastEducation)
		respDTO.LastEducation = &lastEducationStr
	}
	if employee.ContractType != nil {
		contractTypeStr := string(*employee.ContractType)
		respDTO.ContractType = &contractTypeStr
	}
	if employee.TaxStatus != nil {
		taxStatusStr := string(*employee.TaxStatus)
		respDTO.TaxStatus = &taxStatusStr
	}
	if employee.DateOfBirth != nil {
		dateOfBirthStr := employee.DateOfBirth.Format("2006-01-02")
		respDTO.DateOfBirth = &dateOfBirthStr
	}
	if employee.HireDate != nil {
		hireDateStr := employee.HireDate.Format("2006-01-02")
		respDTO.HireDate = &hireDateStr
	}
	if employee.ResignationDate != nil {
		resignationDateStr := employee.ResignationDate.Format("2006-01-02")
		respDTO.ResignationDate = &resignationDateStr
	}
	if employee.User.Email == "" {
		respDTO.Email = nil
	}
	return respDTO
}

func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	var reqDTO employeeDTO.UpdateEmployeeRequestDTO
	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding form data for update: %v", err)
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	// Validate photo file type if provided
	if reqDTO.PhotoFile != nil {
		mimeType := reqDTO.PhotoFile.Header.Get("Content-Type")
		log.Printf("EmployeeHandler: Photo file MIME type detected: %s", mimeType)

		if !isAllowedPhotoMimeType(mimeType) {
			log.Printf("EmployeeHandler: Photo MIME type not allowed: %s", mimeType)
			response.BadRequest(c, fmt.Sprintf("Photo file type not allowed. Detected: %s. Allowed types: %s", mimeType, strings.Join(allowedPhotoMimeTypes, ", ")), nil)
			return
		}
	}

	employeeUpdatePayload, err := h.mapUpdateDTOToDomain(uint(id), &reqDTO)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	updatedEmployee, err := h.employeeUseCase.Update(c.Request.Context(), employeeUpdatePayload)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found for update", err)
			return
		}
		log.Printf("EmployeeHandler: Error updating employee from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to update employee: %w", err))
		return
	}

	// If photo file is provided, upload it after employee update
	if reqDTO.PhotoFile != nil {
		log.Printf("EmployeeHandler: Uploading photo for updated employee ID: %d", uint(id))

		updatedEmployeeWithPhoto, err := h.employeeUseCase.UploadProfilePhoto(c.Request.Context(), uint(id), reqDTO.PhotoFile)
		if err != nil {
			log.Printf("EmployeeHandler: Error uploading photo for updated employee: %v", err)
			// Don't fail the whole update, just log the error
			log.Printf("EmployeeHandler: Employee updated successfully but photo upload failed")
		} else {
			updatedEmployee = updatedEmployeeWithPhoto
			log.Printf("EmployeeHandler: Photo uploaded successfully for updated employee")
		}
	}

	respDTO := h.mapDomainToResponseDTO(updatedEmployee)

	response.Success(c, http.StatusOK, "Employee updated successfully", respDTO)
}

func (h *EmployeeHandler) ResignEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	err = h.employeeUseCase.Resign(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found for resignation", err)
			return
		}
		log.Printf("EmployeeHandler: Error resigning employee from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to resign employee: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Employee resigned successfully", nil)
}

var allowedPhotoMimeTypes = []string{
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
}

func isAllowedPhotoMimeType(mimeType string) bool {
	for _, allowed := range allowedPhotoMimeTypes {
		if strings.EqualFold(mimeType, allowed) {
			return true
		}
	}
	return false
}

func (h *EmployeeHandler) UploadEmployeePhoto(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	var reqDTO employeeDTO.UploadEmployeePhotoRequestDTO
	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding photo upload request: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	// Validate file type
	if reqDTO.File != nil {
		mimeType := reqDTO.File.Header.Get("Content-Type")
		log.Printf("EmployeeHandler: Photo file MIME type detected: %s", mimeType)

		if !isAllowedPhotoMimeType(mimeType) {
			log.Printf("EmployeeHandler: Photo MIME type not allowed: %s", mimeType)
			response.BadRequest(c, fmt.Sprintf("File type not allowed. Detected: %s. Allowed types: %s", mimeType, strings.Join(allowedPhotoMimeTypes, ", ")), nil)
			return
		}
	}

	log.Printf("EmployeeHandler: Uploading photo for employee ID: %d", id)

	updatedEmployee, err := h.employeeUseCase.UploadProfilePhoto(c.Request.Context(), uint(id), reqDTO.File)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
			return
		}
		log.Printf("EmployeeHandler: Error uploading photo: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to upload photo"))
		return
	}

	respDTO := h.mapDomainToResponseDTO(updatedEmployee)
	response.Success(c, http.StatusOK, "Photo uploaded successfully", respDTO)
}

func (h *EmployeeHandler) GetEmployeeStatistics(c *gin.Context) {
	log.Printf("EmployeeHandler: GetEmployeeStatistics called")

	statisticsData, err := h.employeeUseCase.GetStatistics(c.Request.Context())
	if err != nil {
		log.Printf("EmployeeHandler: Error getting employee statistics from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employee statistics"))
		return
	}

	response.Success(c, http.StatusOK, "Employee statistics retrieved successfully", statisticsData)
}
