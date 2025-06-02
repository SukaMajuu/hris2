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
			response.BadRequest(c, fmt.Sprintf("Invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate), err)
			return
		}
		employeeDomain.ResignationDate = &parsedDate
	}

	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
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

	createdEmployee, err := h.employeeUseCase.Create(c.Request.Context(), employeeDomain, creatorEmployee.ID)
	if err != nil {
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
		PositionName:          createdEmployee.Position.Name,
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

	if createdEmployee.Branch != nil {
		respDTO.BranchName = &createdEmployee.Branch.Name
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
	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding JSON for update: %v", err)
		response.BadRequest(c, "Invalid request payload", err)
		return
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
