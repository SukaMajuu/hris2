package handler

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	attendanceDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/attendance"
	attendanceUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/attendance"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AttendanceHandler struct {
	attendanceUseCase *attendanceUseCase.AttendanceUseCase
}

func NewAttendanceHandler(useCase *attendanceUseCase.AttendanceUseCase) *AttendanceHandler {
	return &AttendanceHandler{
		attendanceUseCase: useCase,
	}
}

func (h *AttendanceHandler) CreateAttendance(c *gin.Context) {
	var reqDTO attendanceDTO.CreateAttendanceRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.Create(c.Request.Context(), &reqDTO)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to create attendance: %w", err))
		return
	}

	response.Success(c, http.StatusCreated, "Attendance created successfully", attendance)
}

func (h *AttendanceHandler) CheckIn(c *gin.Context) {
	var reqDTO attendanceDTO.CheckInRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.CheckIn(c.Request.Context(), &reqDTO)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to check in: %w", err))
		return
	}

	response.Success(c, http.StatusCreated, "Check-in successful", attendance)
}

func (h *AttendanceHandler) CheckOut(c *gin.Context) {
	var reqDTO attendanceDTO.CheckOutRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.CheckOut(c.Request.Context(), &reqDTO)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to check out: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Check-out successful", attendance)
}

func (h *AttendanceHandler) GetAttendanceByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid attendance ID", err)
		return
	}

	attendance, err := h.attendanceUseCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get attendance: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Attendance retrieved successfully", attendance)
}

func (h *AttendanceHandler) ListAttendances(c *gin.Context) {
	var queryDTO attendanceDTO.ListAttendanceRequestQuery

	if err := c.ShouldBindQuery(&queryDTO); err != nil {
		response.BadRequest(c, "Invalid query parameters", err)
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

	attendances, err := h.attendanceUseCase.List(c.Request.Context(), paginationParams)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to list attendances: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Attendances retrieved successfully", attendances)
}

func (h *AttendanceHandler) ListAttendancesByEmployee(c *gin.Context) {
	employeeIDParam := c.Param("employeeId")
	employeeID, err := strconv.ParseUint(employeeIDParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID", err)
		return
	}

	var queryDTO attendanceDTO.ListAttendanceRequestQuery

	if err := c.ShouldBindQuery(&queryDTO); err != nil {
		response.BadRequest(c, "Invalid query parameters", err)
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

	attendances, err := h.attendanceUseCase.ListByEmployee(c.Request.Context(), uint(employeeID), paginationParams)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to list employee attendances: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Employee attendances retrieved successfully", attendances)
}

func (h *AttendanceHandler) UpdateAttendance(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid attendance ID", err)
		return
	}

	var reqDTO attendanceDTO.UpdateAttendanceRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.Update(c.Request.Context(), uint(id), &reqDTO)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to update attendance: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Attendance updated successfully", attendance)
}

func (h *AttendanceHandler) DeleteAttendance(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid attendance ID", err)
		return
	}

	err = h.attendanceUseCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to delete attendance: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Attendance deleted successfully", nil)
}
