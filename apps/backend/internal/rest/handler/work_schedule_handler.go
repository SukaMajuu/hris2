package handler

import (
	"errors"
	// "net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	workScheduleDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/work_schedule"
	workScheduleUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
)

type WorkScheduleHandler struct {
	workScheduleUseCase *workScheduleUseCase.WorkScheduleUsecase
}

func NewWorkScheduleHandler(workScheduleUseCase *workScheduleUseCase.WorkScheduleUsecase) *WorkScheduleHandler {
	return &WorkScheduleHandler{
		workScheduleUseCase: workScheduleUseCase,
	}
}

func (h *WorkScheduleHandler) CreateWorkSchedule(c *gin.Context) {
	var dto workScheduleDTO.CreateWorkScheduleRequest
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.BadRequest(c, "Invalid request body", nil)
		return
	}

	workSchedule := &domain.WorkSchedule{
		Name:          dto.Name,
		WorkType:      dto.WorkType,
		CheckInStart:  dto.CheckInStart,
		CheckInEnd:    dto.CheckInEnd,
		BreakStart:    dto.BreakStart,
		BreakEnd:      dto.BreakEnd,
		CheckOutStart: dto.CheckOutStart,
		CheckOutEnd:   dto.CheckOutEnd,
	}

	err := h.workScheduleUseCase.CreateWorkSchedule(c.Request.Context(), workSchedule)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, "Work schedule created successfully", workSchedule)
}

func (h *WorkScheduleHandler) GetWorkScheduleByID(c *gin.Context) {
	id, err := getIDFromPath(c)
	if err != nil {
		response.BadRequest(c, "Invalid ID", nil)
		return
	}

	workSchedule, err := h.workScheduleUseCase.GetWorkScheduleByID(c.Request.Context(), uint(id))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	if workSchedule == nil {
		response.NotFound(c, "Work schedule not found", nil)
		return
	}

	dto := workScheduleDTO.WorkScheduleResponse{
		ID:            workSchedule.ID,
		Name:          workSchedule.Name,
		WorkType:      workSchedule.WorkType,
		CheckInStart:  workSchedule.CheckInStart,
		CheckInEnd:    workSchedule.CheckInEnd,
		BreakStart:    workSchedule.BreakStart,
		BreakEnd:      workSchedule.BreakEnd,
		CheckOutStart: workSchedule.CheckOutStart,
		CheckOutEnd:   workSchedule.CheckOutEnd,
		CreatedAt:     workSchedule.CreatedAt,
		UpdatedAt:     workSchedule.UpdatedAt,
	}

	response.OK(c, "Work schedule retrieved successfully", dto)

}

func (h *WorkScheduleHandler) UpdateWorkSchedule(c *gin.Context) {
	id, err := getIDFromPath(c)
	if err != nil {
		response.BadRequest(c, "Invalid ID", nil)
		return
	}

	var dto workScheduleDTO.UpdateWorkScheduleRequest
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.BadRequest(c, "Invalid request body", nil)
		return
	}

	workSchedule := &domain.WorkSchedule{
		ID:            uint(id),
		Name:          dto.Name,
		WorkType:      dto.WorkType,
		CheckInStart:  dto.CheckInStart,
		CheckInEnd:    dto.CheckInEnd,
		BreakStart:    dto.BreakStart,
		BreakEnd:      dto.BreakEnd,
		CheckOutStart: dto.CheckOutStart,
		CheckOutEnd:   dto.CheckOutEnd,
	}

	err = h.workScheduleUseCase.UpdateWorkSchedule(c.Request.Context(), workSchedule)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	dtoResponse := workScheduleDTO.WorkScheduleResponse{
		ID:            workSchedule.ID,
		Name:          workSchedule.Name,
		WorkType:      workSchedule.WorkType,
		CheckInStart:  workSchedule.CheckInStart,
		CheckInEnd:    workSchedule.CheckInEnd,
		BreakStart:    workSchedule.BreakStart,
		BreakEnd:      workSchedule.BreakEnd,
		CheckOutStart: workSchedule.CheckOutStart,
		CheckOutEnd:   workSchedule.CheckOutEnd,
	}

	response.OK(c, "Work schedule updated successfully", dtoResponse)
}

func (h *WorkScheduleHandler) DeleteWorkSchedule(c *gin.Context) {
	id, err := getIDFromPath(c)
	if err != nil {
		response.BadRequest(c, "Invalid ID", nil)
		return
	}

	err = h.workScheduleUseCase.DeleteWorkSchedule(c.Request.Context(), uint(id))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Work schedule deleted successfully", nil)
}

func (h *WorkScheduleHandler) ListWorkSchedules(c *gin.Context) {
	workType := c.Query("work_type") // contoh filter opsional

	filters := make(map[string]interface{})
	if workType != "" {
		filters["work_type"] = workType
	}

	workSchedules, err := h.workScheduleUseCase.ListWorkSchedule(c.Request.Context(), filters)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Work schedules fetched successfully", workSchedules)
}

// Helper: Get ID from path
func getIDFromPath(c *gin.Context) (int64, error) {
	idParam := c.Param("id")
	if idParam == "" {
		return 0, errors.New("id parameter is required")
	}
	id, err := strconv.ParseInt(idParam, 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}