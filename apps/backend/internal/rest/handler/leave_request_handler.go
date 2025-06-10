package handler

import (
	"errors"
	"log"
	"strconv"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	leaveRequestDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/leave_request"
	leaveRequestUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/leave_request"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type LeaveRequestHandler struct {
	leaveRequestUseCase *leaveRequestUseCase.LeaveRequestUseCase
}

func NewLeaveRequestHandler(useCase *leaveRequestUseCase.LeaveRequestUseCase) *LeaveRequestHandler {
	return &LeaveRequestHandler{
		leaveRequestUseCase: useCase,
	}
}

func (h *LeaveRequestHandler) CreateLeaveRequest(c *gin.Context) {
	var req leaveRequestDTO.CreateLeaveRequestDTO
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}

	domainLeaveRequest, err := req.ToDomain(userID)
	if err != nil {
		response.BadRequest(c, "Invalid request data", err)
		return
	}

	createdLeaveRequest, err := h.leaveRequestUseCase.Create(c.Request.Context(), domainLeaveRequest, req.AttachmentFile)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.Created(c, "Leave request created successfully", createdLeaveRequest)
}

func (h *LeaveRequestHandler) CreateLeaveRequestForEmployee(c *gin.Context) {
	var req leaveRequestDTO.CreateLeaveRequestForEmployeeDTO
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	adminUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}

	log.Printf("Admin user ID %d is creating leave request for employee ID %d", adminUserID, req.EmployeeID)

	domainLeaveRequest, err := req.ToDomain()
	if err != nil {
		response.BadRequest(c, "Invalid request data", err)
		return
	}

	createdLeaveRequest, err := h.leaveRequestUseCase.CreateForEmployee(c.Request.Context(), domainLeaveRequest, req.AttachmentFile)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.Created(c, "Leave request created successfully for employee", createdLeaveRequest)
}

func (h *LeaveRequestHandler) GetLeaveRequestByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid leave request ID format", err)
		return
	}

	leaveRequest, err := h.leaveRequestUseCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrLeaveRequestNotFound) {
			response.NotFound(c, "Leave request not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.OK(c, "Leave request retrieved successfully", leaveRequest)
}

func (h *LeaveRequestHandler) ListLeaveRequests(c *gin.Context) {
	var query leaveRequestDTO.LeaveRequestQueryDTO
	if bindAndValidateQuery(c, &query) {
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	currentUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}

	currentEmployee, err := h.leaveRequestUseCase.GetEmployeeByUserID(c.Request.Context(), currentUserID)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	filters := make(map[string]interface{})
	if query.EmployeeID != nil {
		filters["employee_id"] = *query.EmployeeID
	}
	if query.Status != nil {
		filters["status"] = *query.Status
	}
	if query.LeaveType != nil {
		filters["leave_type"] = *query.LeaveType
	}

	filters["manager_id"] = currentEmployee.ID

	paginationParams := domain.PaginationParams{
		Page:     query.Page,
		PageSize: query.PageSize,
	}

	if paginationParams.Page <= 0 {
		paginationParams.Page = 1
	}
	if paginationParams.PageSize <= 0 {
		paginationParams.PageSize = 10
	}

	leaveRequests, err := h.leaveRequestUseCase.List(c.Request.Context(), filters, paginationParams)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Leave requests retrieved successfully", leaveRequests)
}

func (h *LeaveRequestHandler) GetMyLeaveRequests(c *gin.Context) {
	var query leaveRequestDTO.LeaveRequestQueryDTO
	if bindAndValidateQuery(c, &query) {
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}
	filters := make(map[string]interface{})
	if query.Status != nil {
		filters["status"] = *query.Status
	}
	if query.LeaveType != nil {
		filters["leave_type"] = *query.LeaveType
	}

	pagination := domain.PaginationParams{
		Page:     query.Page,
		PageSize: query.PageSize,
	}

	leaveRequests, err := h.leaveRequestUseCase.GetByEmployeeUserID(c.Request.Context(), userID, filters, pagination)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.OK(c, "My leave requests retrieved successfully", leaveRequests)
}

func (h *LeaveRequestHandler) UpdateLeaveRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid leave request ID format", err)
		return
	}

	var req leaveRequestDTO.UpdateLeaveRequestDTO
	if err := c.ShouldBind(&req); err != nil {
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}

	domainLeaveRequest, err := req.ToDomain(userID)
	if err != nil {
		response.BadRequest(c, "Invalid request data", err)
		return
	}

	updatedLeaveRequest, err := h.leaveRequestUseCase.Update(c.Request.Context(), uint(id), domainLeaveRequest, req.AttachmentFile)
	if err != nil {
		if errors.Is(err, domain.ErrLeaveRequestNotFound) {
			response.NotFound(c, "Leave request not found", err)
		} else if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.OK(c, "Leave request updated successfully", updatedLeaveRequest)
}

func (h *LeaveRequestHandler) DeleteLeaveRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid leave request ID format", err)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}

	leaveRequest, err := h.leaveRequestUseCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrLeaveRequestNotFound) {
			response.NotFound(c, "Leave request not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	employee, err := h.leaveRequestUseCase.GetEmployeeByUserID(c.Request.Context(), userID)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	if leaveRequest.EmployeeID != employee.ID {
		response.Forbidden(c, "You can only delete your own leave requests", errors.New("unauthorized to delete this leave request"))
		return
	}

	err = h.leaveRequestUseCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrLeaveRequestNotFound) {
			response.NotFound(c, "Leave request not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.OK(c, "Leave request deleted successfully", nil)
}

func (h *LeaveRequestHandler) UpdateLeaveRequestStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid leave request ID format", err)
		return
	}

	var req leaveRequestDTO.UpdateLeaveRequestStatusDTO
	if bindAndValidate(c, &req) {
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", errors.New("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, errors.New("invalid user ID type in context"))
		return
	}

	log.Printf("Leave request status update by admin user ID: %d", userID)

	updatedLeaveRequest, err := h.leaveRequestUseCase.UpdateStatus(c.Request.Context(), uint(id), req.Status, req.AdminNote)
	if err != nil {
		if errors.Is(err, domain.ErrLeaveRequestNotFound) {
			response.NotFound(c, "Leave request not found", err)
		} else {
			response.InternalServerError(c, err)
		}
		return
	}

	response.OK(c, "Leave request status updated successfully", updatedLeaveRequest)
}
