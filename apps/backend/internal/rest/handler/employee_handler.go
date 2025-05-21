package handler

import (
	"fmt"
	"log"
	"net/http"

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

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding JSON for CreateEmployee: %v", err)
		response.BadRequest(c, "Invalid request data. Please check your input.", err)
		return
	}

	employeeDomain := &domain.Employee{
		UserID:       reqDTO.UserID,
		FirstName:    reqDTO.FirstName,
		LastName:     reqDTO.LastName,
		PositionID:   reqDTO.PositionID,
		EmployeeCode: reqDTO.EmployeeCode,
		BranchID:     reqDTO.BranchID,
		Gender:       reqDTO.Gender,
		NIK:          reqDTO.NIK,
	}

	if reqDTO.EmploymentStatus != nil {
		employeeDomain.EmploymentStatus = *reqDTO.EmploymentStatus
	} else {
		employeeDomain.EmploymentStatus = true
	}

	createdEmployee, err := h.employeeUseCase.Create(c.Request.Context(), employeeDomain)
	if err != nil {
		log.Printf("EmployeeHandler: Error creating employee from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to create employee: %w", err))
		return
	}

	var genderStrPointer *string
	if createdEmployee.Gender != nil {
		s := string(*createdEmployee.Gender)
		genderStrPointer = &s
	}

	var phone *string
	if createdEmployee.User != (domain.User{}) && createdEmployee.User.Phone != "" {
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
