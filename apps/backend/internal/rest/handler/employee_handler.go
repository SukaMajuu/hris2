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

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	currentUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	currentEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), currentUserID)
	if err != nil {
		log.Printf("EmployeeHandler: Error getting current employee for UserID %d: %v", currentUserID, err)
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
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
		filters["employment_status"] = *queryDTO.Status == "active"
	}

	// Add manager filter to only show employees managed by current user
	filters["manager_id"] = currentEmployee.ID

	log.Printf("EmployeeHandler: Listing employees for manager ID %d with DTO: %+v, Parsed Filters: %+v, Pagination: %+v", currentEmployee.ID, queryDTO, filters, paginationParams)

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

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	creatorUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	creatorEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), creatorUserID)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get creator employee information: %w", err))
		return
	}

	if reqDTO.PhotoFile != nil {
		log.Printf("EmployeeHandler: Photo file detected: %s", reqDTO.PhotoFile.Filename)
		// TODO: Add validation back after fixing upload issue
	}

	// Convert DTO to domain model
	employeeDomain, err := employeeDTO.MapCreateDTOToDomain(&reqDTO)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	// Create employee
	createdEmployee, err := h.employeeUseCase.Create(c.Request.Context(), employeeDomain, creatorEmployee.ID)
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

	// Get current user ID from context
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	currentUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	// Get current employee information
	currentEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), currentUserID)
	if err != nil {
		log.Printf("EmployeeHandler: Error getting current employee for UserID %d: %v", currentUserID, err)
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
		return
	}

	// Get statistics filtered by current manager
	statisticsData, err := h.employeeUseCase.GetStatisticsByManager(c.Request.Context(), currentEmployee.ID)
	if err != nil {
		log.Printf("EmployeeHandler: Error getting employee statistics from use case for manager %d: %v", currentEmployee.ID, err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employee statistics"))
		return
	}

	response.Success(c, http.StatusOK, "Employee statistics retrieved successfully", statisticsData)
}
