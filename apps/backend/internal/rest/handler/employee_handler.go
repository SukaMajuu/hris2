package handler

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
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

	if bindAndValidate(c, &reqDTO) {
		return
	}

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

	if reqDTO.ResignationDate != nil && *reqDTO.ResignationDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.ResignationDate)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing ResignationDate '%s': %v", *reqDTO.ResignationDate, err)
			response.BadRequest(c, fmt.Sprintf("Invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate), err)
			return
		}
		employeeDomain.ResignationDate = &parsedDate
	}

	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing HireDate '%s': %v", *reqDTO.HireDate, err)
			response.BadRequest(c, fmt.Sprintf("Invalid HireDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.HireDate), err)
			return
		}
		employeeDomain.HireDate = &parsedDate
	}

	if reqDTO.EmploymentStatus != nil {
		employeeDomain.EmploymentStatus = *reqDTO.EmploymentStatus
	} else {
		employeeDomain.EmploymentStatus = true
	}

	createdEmployee, err := h.employeeUseCase.Create(c.Request.Context(), employeeDomain)
	if err != nil {
		log.Printf("EmployeeHandler: Error creating employee from use case: %v", err)
		if errors.Is(err, domain.ErrUserAlreadyExists) || errors.Is(err, domain.ErrEmailAlreadyExists) {
			response.Error(c, http.StatusConflict, "Failed to create employee: user or email already exists.", err)
		} else {
			response.InternalServerError(c, fmt.Errorf("failed to create employee: %w", err))
		}
		return
	}

	var genderStrPointer *string
	if createdEmployee.Gender != nil {
		s := string(*createdEmployee.Gender)
		genderStrPointer = &s
	}

	var phone *string
	if createdEmployee.User.Phone != "" {
		phone = &createdEmployee.User.Phone
	}

	respDTO := domainEmployeeDTO.EmployeeResponseDTO{
		ID:                    createdEmployee.ID,
		Email:                 &createdEmployee.User.Email,
		Phone:                 phone,
		FirstName:             createdEmployee.FirstName,
		LastName:              createdEmployee.LastName,
		EmployeeCode:          createdEmployee.EmployeeCode,
		BranchID:              createdEmployee.BranchID,
		PositionID:            createdEmployee.PositionID,
		Gender:                genderStrPointer,
		NIK:                   createdEmployee.NIK,
		PlaceOfBirth:          createdEmployee.PlaceOfBirth,
		Grade:                 createdEmployee.Grade,
		EmploymentStatus:      createdEmployee.EmploymentStatus,
		BankName:              createdEmployee.BankName,
		BankAccountNumber:     createdEmployee.BankAccountNumber,
		BankAccountHolderName: createdEmployee.BankAccountHolderName,
		ProfilePhotoURL:       createdEmployee.ProfilePhotoURL,
		CreatedAt:             createdEmployee.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             createdEmployee.UpdatedAt.Format(time.RFC3339),
	}

	if createdEmployee.LastEducation != nil {
		lastEducationStr := string(*createdEmployee.LastEducation)
		respDTO.LastEducation = &lastEducationStr
	}
	if createdEmployee.ContractType != nil {
		contractTypeStr := string(*createdEmployee.ContractType)
		respDTO.ContractType = &contractTypeStr
	}
	if createdEmployee.TaxStatus != nil {
		taxStatusStr := string(*createdEmployee.TaxStatus)
		respDTO.TaxStatus = &taxStatusStr
	}
	if createdEmployee.HireDate != nil {
		hireDateStr := createdEmployee.HireDate.Format("2006-01-02")
		respDTO.HireDate = &hireDateStr
	}
	if createdEmployee.ResignationDate != nil {
		resignationDateStr := createdEmployee.ResignationDate.Format("2006-01-02")
		respDTO.ResignationDate = &resignationDateStr
	}

	if createdEmployee.User.Email == "" {
		respDTO.Email = nil
	}

	response.Success(c, http.StatusCreated, "Employee created successfully", respDTO)
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

func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	var reqDTO employeeDTO.UpdateEmployeeRequestDTO
	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding JSON for update: %v", err)
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	employeeUpdatePayload := &domain.Employee{
		ID: uint(id),
	}

	// Populate User fields if provided
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
			response.BadRequest(c, fmt.Sprintf("Invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate), err)
			return
		}
		employeeUpdatePayload.ResignationDate = &parsedDate
	}
	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing HireDate '%s': %v", *reqDTO.HireDate, err)
			response.BadRequest(c, fmt.Sprintf("Invalid HireDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.HireDate), err)
			return
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

	var genderDTO *string
	if updatedEmployee.Gender != nil {
		genderStr := string(*updatedEmployee.Gender)
		genderDTO = &genderStr
	}
	var phoneDTO *string
	if updatedEmployee.User.Phone != "" {
		phoneDTO = &updatedEmployee.User.Phone
	}

	respDTO := domainEmployeeDTO.EmployeeResponseDTO{
		ID:                    updatedEmployee.ID,
		Email:                 &updatedEmployee.User.Email,
		Phone:                 phoneDTO,
		FirstName:             updatedEmployee.FirstName,
		LastName:              updatedEmployee.LastName,
		EmployeeCode:          updatedEmployee.EmployeeCode,
		BranchID:              updatedEmployee.BranchID,
		PositionID:            updatedEmployee.PositionID,
		Gender:                genderDTO,
		NIK:                   updatedEmployee.NIK,
		PlaceOfBirth:          updatedEmployee.PlaceOfBirth,
		Grade:                 updatedEmployee.Grade,
		EmploymentStatus:      updatedEmployee.EmploymentStatus,
		BankName:              updatedEmployee.BankName,
		BankAccountNumber:     updatedEmployee.BankAccountNumber,
		BankAccountHolderName: updatedEmployee.BankAccountHolderName,
		ProfilePhotoURL:       updatedEmployee.ProfilePhotoURL,
		CreatedAt:             updatedEmployee.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             updatedEmployee.UpdatedAt.Format(time.RFC3339),
	}

	if updatedEmployee.LastEducation != nil {
		lastEducationStr := string(*updatedEmployee.LastEducation)
		respDTO.LastEducation = &lastEducationStr
	}
	if updatedEmployee.ContractType != nil {
		contractTypeStr := string(*updatedEmployee.ContractType)
		respDTO.ContractType = &contractTypeStr
	}
	if updatedEmployee.TaxStatus != nil {
		taxStatusStr := string(*updatedEmployee.TaxStatus)
		respDTO.TaxStatus = &taxStatusStr
	}
	if updatedEmployee.HireDate != nil {
		hireDateStr := updatedEmployee.HireDate.Format("2006-01-02")
		respDTO.HireDate = &hireDateStr
	}
	if updatedEmployee.ResignationDate != nil {
		resignationDateStr := updatedEmployee.ResignationDate.Format("2006-01-02")
		respDTO.ResignationDate = &resignationDateStr
	}

	if updatedEmployee.User.Email == "" {
		respDTO.Email = nil
	}

	response.Success(c, http.StatusOK, "Employee updated successfully", respDTO)
}
