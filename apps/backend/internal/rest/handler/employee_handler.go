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
		ID:               createdEmployee.ID,
		FirstName:        createdEmployee.FirstName,
		LastName:         createdEmployee.LastName,
		Gender:           genderStrPointer,
		Phone:            phone,
		BranchID:         createdEmployee.BranchID,
		PositionID:       createdEmployee.PositionID,
		Grade:            createdEmployee.Grade,
		EmploymentStatus: createdEmployee.EmploymentStatus,
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
