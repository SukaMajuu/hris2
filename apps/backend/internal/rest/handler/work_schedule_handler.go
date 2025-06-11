package handler

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	workSheduleDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/check-clock/work_schedule"
	workSchedule "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/SukaMajuu/hris/apps/backend/pkg/utils" // Added for ParseTimeHelper
	"github.com/gin-gonic/gin"
)

type WorkScheduleHandler struct {
	workScheduleUseCase *workSchedule.WorkScheduleUseCase
}

func NewWorkScheduleHandler(u *workSchedule.WorkScheduleUseCase) *WorkScheduleHandler {
	return &WorkScheduleHandler{
		workScheduleUseCase: u,
	}
}

func (h *WorkScheduleHandler) CreateWorkSchedule(c *gin.Context) {
	var req workSheduleDTO.CreateWorkScheduleRequest
	if bindAndValidate(c, &req) {
		// bindAndValidate likely sends a response on error
		return
	}

	// Get userID from context (set by auth middleware)
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	// Map DTO details to domain details
	var domainDetails []*domain.WorkScheduleDetail
	for _, detailDTO := range req.Details {
		var workDaysInDetail []domain.Days
		// Menggunakan fungsi utilitas baru untuk mengonversi []string ke []domain.Days
		// utils.StringToDays mengembalikan []string yang sudah divalidasi
		validDayStrings := utils.StringToDays(detailDTO.WorkDays) // Menggunakan detailDTO.WorkDays (plural)
		for _, dayStr := range validDayStrings {
			workDaysInDetail = append(workDaysInDetail, domain.Days(dayStr))
		}

		checkinStart := utils.ParseTimeHelper(detailDTO.CheckInStart)
		checkinEnd := utils.ParseTimeHelper(detailDTO.CheckInEnd)
		breakStart := utils.ParseTimeHelper(detailDTO.BreakStart)
		breakEnd := utils.ParseTimeHelper(detailDTO.BreakEnd)
		checkoutStart := utils.ParseTimeHelper(detailDTO.CheckOutStart)
		checkoutEnd := utils.ParseTimeHelper(detailDTO.CheckOutEnd)

		domainDetail := &domain.WorkScheduleDetail{
			WorktypeDetail: enums.WorkType(detailDTO.WorkTypeDetail),
			WorkDays:       workDaysInDetail,
			CheckinStart:   checkinStart,
			CheckinEnd:     checkinEnd,
			BreakStart:     breakStart,
			BreakEnd:       breakEnd,
			CheckoutStart:  checkoutStart,
			CheckoutEnd:    checkoutEnd,
			LocationID:     detailDTO.LocationID,
			IsActive:       detailDTO.IsActive == nil || *detailDTO.IsActive, // Default to true if not provided for new details
		}
		domainDetails = append(domainDetails, domainDetail)
	}

	domainWorkSchedule := &domain.WorkSchedule{
		Name:      req.Name,
		WorkType:  enums.WorkType(req.WorkType),
		CreatedBy: userID, // Set the admin user ID who creates the work schedule
		// Details are passed as a separate argument to the use case,
		// so domain.WorkSchedule.Details will be populated by the repository layer if needed.
	}

	createdWorkSchedule, err := h.workScheduleUseCase.Create(c.Request.Context(), domainWorkSchedule, domainDetails)

	if err != nil {
		response.BadRequest(c, err.Error(), nil) // Memberikan feedback error yang lebih baik
		return
	}

	response.Created(c, "Work schedule created successfully", createdWorkSchedule) // Memperbaiki panggilan response.Created
}

func (h *WorkScheduleHandler) ListWorkSchedules(c *gin.Context) {
	var queryDTO workSheduleDTO.ListWorkScheduleRequestQuery

	if bindAndValidateQuery(c, &queryDTO) {
		return
	}

	// Get userID from context (set by auth middleware)
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	paginationParams := domain.PaginationParams{
		Page:     queryDTO.Page,
		PageSize: queryDTO.PageSize,
	}

	// Set default pagination values if not provided
	if paginationParams.Page <= 0 {
		paginationParams.Page = 1
	}
	if paginationParams.PageSize <= 0 {
		paginationParams.PageSize = 10 // Default page size
	}

	// Use ListByUser to only show work schedules created by the authenticated user
	responseData, err := h.workScheduleUseCase.ListByUser(c.Request.Context(), userID, paginationParams)
	if err != nil {
		// Pass the error directly to response.InternalServerError
		response.InternalServerError(c, fmt.Errorf("failed to list work schedules: %w", err))
		return
	}

	// Pass the responseData (which includes items and pagination) to response.OK
	response.OK(c, "Work schedules listed successfully", responseData)
}

func (h *WorkScheduleHandler) UpdateWorkSchedule(c *gin.Context) {
	// Get ID from URL parameter
	idParam := c.Param("id")
	idUint64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid work schedule ID", nil)
		return
	}
	id := uint(idUint64)

	var req workSheduleDTO.UpdateWorkScheduleRequest
	if bindAndValidate(c, &req) {
		return
	}

	// Get userID from context (set by auth middleware)
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	// Map DTO details to domain details
	var domainDetails []*domain.WorkScheduleDetail
	for _, detailDTO := range req.Details {
		var workDaysInDetail []domain.Days
		validDayStrings := utils.StringToDays(detailDTO.WorkDays)
		for _, dayStr := range validDayStrings {
			workDaysInDetail = append(workDaysInDetail, domain.Days(dayStr))
		}

		checkinStart := utils.ParseTimeHelper(detailDTO.CheckInStart)
		checkinEnd := utils.ParseTimeHelper(detailDTO.CheckInEnd)
		breakStart := utils.ParseTimeHelper(detailDTO.BreakStart)
		breakEnd := utils.ParseTimeHelper(detailDTO.BreakEnd)
		checkoutStart := utils.ParseTimeHelper(detailDTO.CheckOutStart)
		checkoutEnd := utils.ParseTimeHelper(detailDTO.CheckOutEnd)

		domainDetail := &domain.WorkScheduleDetail{
			WorktypeDetail: enums.WorkType(detailDTO.WorkTypeDetail),
			WorkDays:       workDaysInDetail,
			CheckinStart:   checkinStart,
			CheckinEnd:     checkinEnd,
			BreakStart:     breakStart,
			BreakEnd:       breakEnd,
			CheckoutStart:  checkoutStart,
			CheckoutEnd:    checkoutEnd,
			LocationID:     detailDTO.LocationID,
			IsActive:       detailDTO.IsActive == nil || *detailDTO.IsActive, // Use provided value or default to true if not provided
		}

		// Set ID if it's an existing detail
		if detailDTO.ID != nil {
			domainDetail.ID = *detailDTO.ID
		}

		domainDetails = append(domainDetails, domainDetail)
	}
	domainWorkSchedule := &domain.WorkSchedule{
		Name:     req.Name,
		WorkType: enums.WorkType(req.WorkType),
		IsActive: true, // Explicitly set IsActive to true to maintain active status
	}

	updatedWorkSchedule, err := h.workScheduleUseCase.UpdateByUser(c.Request.Context(), id, userID, domainWorkSchedule, domainDetails, req.ToDelete)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.OK(c, "Work schedule updated successfully", updatedWorkSchedule)
}

func (h *WorkScheduleHandler) GetWorkSchedule(c *gin.Context) {
	// Get ID from URL parameter
	idParam := c.Param("id")
	idUint64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid work schedule ID", nil)
		return
	}
	id := uint(idUint64)

	// Get userID from context (set by auth middleware)
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	workSchedule, err := h.workScheduleUseCase.GetByIDAndUser(c.Request.Context(), id, userID)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.OK(c, "Work schedule retrieved successfully", workSchedule)
}

func (h *WorkScheduleHandler) GetWorkScheduleForEdit(c *gin.Context) {
	// Get ID from URL parameter
	idParam := c.Param("id")
	idUint64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid work schedule ID", nil)
		return
	}
	id := uint(idUint64)

	// Get userID from context (set by auth middleware)
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	workSchedule, err := h.workScheduleUseCase.GetByIDForEditByUser(c.Request.Context(), id, userID)
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.OK(c, "Work schedule retrieved for editing successfully", workSchedule)
}

func (h *WorkScheduleHandler) DeleteWorkSchedule(c *gin.Context) {
	// Get ID from URL parameter
	idParam := c.Param("id")
	idUint64, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid work schedule ID", nil)
		return
	}
	id := uint(idUint64)

	// Get userID from context (set by auth middleware)
	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	err = h.workScheduleUseCase.DeleteByUser(c.Request.Context(), id, userID)
	if err != nil {
		// Check if it's a not found error by looking for specific error messages
		errMsg := err.Error()
		if strings.Contains(errMsg, "not found") || strings.Contains(errMsg, "already deleted") {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, fmt.Errorf("failed to delete work schedule: %w", err))
		return
	}

	response.OK(c, "Work schedule deleted successfully", nil)
}
