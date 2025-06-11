package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	attendanceDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/attendance"
	attendanceUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/attendance"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type AttendanceHandler struct {
	attendanceUseCase *attendanceUseCase.AttendanceUseCase
	employeeUseCase   *employeeUseCase.EmployeeUseCase
}

func NewAttendanceHandler(attendanceUC *attendanceUseCase.AttendanceUseCase, employeeUC *employeeUseCase.EmployeeUseCase) *AttendanceHandler {
	return &AttendanceHandler{
		attendanceUseCase: attendanceUC,
		employeeUseCase:   employeeUC,
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
		errMsg := err.Error()

		if strings.Contains(errMsg, "employee with ID") && strings.Contains(errMsg, "not found") {
			response.NotFound(c, "Employee not found", err)
			return
		}

		if strings.Contains(errMsg, "work schedule with ID") && strings.Contains(errMsg, "not found") {
			response.NotFound(c, "Work schedule not found", err)
			return
		}
		if strings.Contains(errMsg, "has already checked in") {
			response.Conflict(c, "Employee has already checked in today", err)
			return
		}

		if strings.Contains(errMsg, "has a leave record") {
			response.Conflict(c, "Cannot clock-in on a leave day", err)
			return
		}

		if strings.Contains(errMsg, "invalid") && (strings.Contains(errMsg, "format") || strings.Contains(errMsg, "date") || strings.Contains(errMsg, "time")) {
			response.BadRequest(c, "Invalid date or time format", err)
			return
		}

		if strings.Contains(errMsg, "no work schedule configured") || strings.Contains(errMsg, "has no details configured") {
			response.BadRequest(c, "Work schedule not properly configured. Please contact HR", err)
			return
		}

		response.InternalServerError(c, fmt.Errorf("failed to check in: %w", err))
		return
	}

	response.Success(c, http.StatusCreated, "Clock In successful", attendance)
}

func (h *AttendanceHandler) ClockOut(c *gin.Context) {
	var reqDTO attendanceDTO.ClockOutRequestDTO

	if err := c.ShouldBindJSON(&reqDTO); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	attendance, err := h.attendanceUseCase.ClockOut(c.Request.Context(), &reqDTO)
	if err != nil {
		errMsg := err.Error()

		if strings.Contains(errMsg, "employee with ID") && strings.Contains(errMsg, "not found") {
			response.NotFound(c, "Employee not found", err)
			return
		}

		if strings.Contains(errMsg, "no attendance record found") {
			response.BadRequest(c, "No check-in record found. Please check-in first", err)
			return
		}

		if strings.Contains(errMsg, "has not checked in") {
			response.BadRequest(c, "Employee has not checked in today. Please check-in first", err)
			return
		}

		if strings.Contains(errMsg, "has already checked out") {
			response.Conflict(c, "Employee has already checked out today", err)
			return
		}

		if strings.Contains(errMsg, "invalid") && (strings.Contains(errMsg, "format") || strings.Contains(errMsg, "date") || strings.Contains(errMsg, "time")) {
			response.BadRequest(c, "Invalid date or time format", err)
			return
		}

		if strings.Contains(errMsg, "no work schedule configured") {
			response.BadRequest(c, "Work schedule not properly configured. Please contact HR", err)
			return
		}

		response.InternalServerError(c, fmt.Errorf("failed to check out: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Clock Out successful", attendance)
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

	attendances, err := h.attendanceUseCase.ListByManager(c.Request.Context(), currentEmployee.ID, paginationParams)
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
		paginationParams.PageSize = 1000 // Increased default to match frontend expectation
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

func (h *AttendanceHandler) GetAttendanceStatistics(c *gin.Context) {
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
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
		return
	}

	statistics, err := h.attendanceUseCase.GetStatisticsByManager(c.Request.Context(), currentEmployee.ID)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get attendance statistics: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Attendance statistics retrieved successfully", statistics)
}

func (h *AttendanceHandler) GetTodayAttendancesByManager(c *gin.Context) {
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
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
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
		paginationParams.PageSize = 5
	}

	attendances, err := h.attendanceUseCase.GetTodayAttendancesByManager(c.Request.Context(), currentEmployee.ID, paginationParams)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get today's attendances: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Today's attendances retrieved successfully", attendances)
}

func (h *AttendanceHandler) GetEmployeeMonthlyStatistics(c *gin.Context) {
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
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
		return
	}

	yearStr := c.DefaultQuery("year", "")
	monthStr := c.DefaultQuery("month", "")

	var year, month int
	if yearStr == "" || monthStr == "" {
		now := time.Now()
		year = now.Year()
		month = int(now.Month())
	} else {
		year, err = strconv.Atoi(yearStr)
		if err != nil || year < 2000 || year > 2100 {
			response.BadRequest(c, "Invalid year parameter", fmt.Errorf("year must be a valid integer between 2000 and 2100"))
			return
		}

		month, err = strconv.Atoi(monthStr)
		if err != nil || month < 1 || month > 12 {
			response.BadRequest(c, "Invalid month parameter", fmt.Errorf("month must be a valid integer between 1 and 12"))
			return
		}
	}

	statistics, err := h.attendanceUseCase.GetEmployeeMonthlyStatistics(c.Request.Context(), currentEmployee.ID, year, month)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get employee monthly statistics: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Employee monthly statistics retrieved successfully", statistics)
}

// TestDailyAbsentCheck - Test endpoint for daily absent check (for development/testing)
func (h *AttendanceHandler) TestDailyAbsentCheck(c *gin.Context) {
	ctx := c.Request.Context()

	err := h.attendanceUseCase.ProcessDailyAbsentCheck(ctx)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to process daily absent check", err)
		return
	}

	response.OK(c, "Daily absent check completed successfully", nil)
}
