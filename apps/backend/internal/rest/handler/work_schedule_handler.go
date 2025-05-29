package handler

import (
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

		domainDetail := &domain.WorkScheduleDetail{
			WorktypeDetail: enums.WorkType(detailDTO.WorkTypeDetail),
			WorkDays:       workDaysInDetail,
			CheckinStart:   utils.ParseTimeHelper(detailDTO.CheckInStart),
			CheckoutStart:     utils.ParseTimeHelper(detailDTO.CheckInEnd),
			BreakStart:     utils.ParseTimeHelper(detailDTO.BreakStart),
			BreakEnd:       utils.ParseTimeHelper(detailDTO.BreakEnd),
			CheckinEnd:  utils.ParseTimeHelper(detailDTO.CheckOutStart),
			CheckoutEnd:    utils.ParseTimeHelper(detailDTO.CheckOutEnd),
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
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, "Work schedule created successfully", createdWorkSchedule) // Memperbaiki panggilan response.Created
}
