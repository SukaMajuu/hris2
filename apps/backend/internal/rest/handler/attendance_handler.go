package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

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

func (h *AttendanceHandler) ClockIn(c *gin.Context) {
	var reqDTO attendanceDTO.ClockInRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.ClockIn(c.Request.Context(), &reqDTO)
	if err != nil {
		// Check for specific error types and return appropriate status codes
		errMsg := err.Error()

		// Employee not found
		if strings.Contains(errMsg, "employee with ID") && strings.Contains(errMsg, "not found") {
			response.NotFound(c, "Employee not found", err)
			return
		}

		// Work schedule not found
		if strings.Contains(errMsg, "work schedule with ID") && strings.Contains(errMsg, "not found") {
			response.NotFound(c, "Work schedule not found", err)
			return
		}

		// Already checked in (conflict)
		if strings.Contains(errMsg, "has already checked in") {
			response.Conflict(c, "Employee has already checked in today", err)
			return
		}

		// Invalid date/time format
		if strings.Contains(errMsg, "invalid") && (strings.Contains(errMsg, "format") || strings.Contains(errMsg, "date") || strings.Contains(errMsg, "time")) {
			response.BadRequest(c, "Invalid date or time format", err)
			return
		}

		// Work schedule configuration issues
		if strings.Contains(errMsg, "no work schedule configured") || strings.Contains(errMsg, "has no details configured") {
			response.BadRequest(c, "Work schedule not properly configured. Please contact HR", err)
			return
		}

		// Default to internal server error for other cases
		response.InternalServerError(c, fmt.Errorf("failed to check in: %w", err))
		return
	}

	response.Success(c, http.StatusCreated, "Check-in successful", attendance)
}

func (h *AttendanceHandler) ClockOut(c *gin.Context) {
	var reqDTO attendanceDTO.ClockOutRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.ClockOut(c.Request.Context(), &reqDTO)
	if err != nil {
		// Check for specific error types and return appropriate status codes
		errMsg := err.Error()

		// Employee not found
		if strings.Contains(errMsg, "employee with ID") && strings.Contains(errMsg, "not found") {
			response.NotFound(c, "Employee not found", err)
			return
		}

		// No attendance record found (need to check in first)
		if strings.Contains(errMsg, "no attendance record found") {
			response.BadRequest(c, "No check-in record found. Please check-in first", err)
			return
		}

		// Not checked in yet
		if strings.Contains(errMsg, "has not checked in") {
			response.BadRequest(c, "Employee has not checked in today. Please check-in first", err)
			return
		}

		// Already checked out (conflict)
		if strings.Contains(errMsg, "has already checked out") {
			response.Conflict(c, "Employee has already checked out today", err)
			return
		}

		// Invalid date/time format
		if strings.Contains(errMsg, "invalid") && (strings.Contains(errMsg, "format") || strings.Contains(errMsg, "date") || strings.Contains(errMsg, "time")) {
			response.BadRequest(c, "Invalid date or time format", err)
			return
		}

		// Work schedule configuration issues
		if strings.Contains(errMsg, "no work schedule configured") {
			response.BadRequest(c, "Work schedule not properly configured. Please contact HR", err)
			return
		}

		// Default to internal server error for other cases
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
	employeeIDParam := c.Param("employee_id")
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
