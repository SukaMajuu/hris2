package handler

import (
	"fmt"

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
		}
		domainDetails = append(domainDetails, domainDetail)
	}

	domainWorkSchedule := &domain.WorkSchedule{
		Name:     req.Name,
		WorkType: enums.WorkType(req.WorkType),
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

	// Correctly assign the two return values from h.workScheduleUseCase.List
	responseData, err := h.workScheduleUseCase.List(c.Request.Context(), paginationParams)
	if err != nil {
		// Pass the error directly to response.InternalServerError
		response.InternalServerError(c, fmt.Errorf("failed to list work schedules: %w", err))
		return
	}

	// Pass the responseData (which includes items and pagination) to response.OK
	response.OK(c, "Work schedules listed successfully", responseData)
}
