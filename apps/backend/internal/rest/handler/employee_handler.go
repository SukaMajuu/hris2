package handler

import (
	"fmt"
	"log"
	"net/http"

	"github.com/SukaMajuu/hris/apps/backend/domain"
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
