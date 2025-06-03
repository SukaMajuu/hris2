package handler

import (
	"strconv"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	checkclocksettingsdto "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/check-clock/checkclock_settings"
	checkclocksettingsusecase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/checkclock_settings"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type CheckclockSettingsHandler struct {
	useCase *checkclocksettingsusecase.CheckclockSettingsUseCase
}

func NewCheckclockSettingsHandler(useCase *checkclocksettingsusecase.CheckclockSettingsUseCase) *CheckclockSettingsHandler {
	return &CheckclockSettingsHandler{
		useCase: useCase,
	}
}

func (h *CheckclockSettingsHandler) CreateCheckclockSettings(c *gin.Context) {
	var req checkclocksettingsdto.CreateCheckclockSettingsRequest
	if bindAndValidate(c, &req) {
		return
	}

	domainModel := &domain.CheckclockSettings{
		EmployeeID:     req.EmployeeID,
		WorkScheduleID: req.WorkScheduleID,
	}

	createdSetting, err := h.useCase.Create(c.Request.Context(), domainModel)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Created(c, "Check clock setting created successfully", createdSetting)
}

func (h *CheckclockSettingsHandler) GetCheckclockSettingsByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID parameter", nil)
		return
	}

	setting, err := h.useCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "Check clock setting retrieved successfully", setting)
}

func (h *CheckclockSettingsHandler) GetCheckclockSettingsByEmployeeID(c *gin.Context) {
	employeeID, err := strconv.ParseUint(c.Param("employee_id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID parameter", nil)
		return
	}

	setting, err := h.useCase.GetByEmployeeID(c.Request.Context(), uint(employeeID))
	if err != nil {
		response.NotFound(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "Check clock setting retrieved successfully", setting)
}

func (h *CheckclockSettingsHandler) GetAllCheckclockSettings(c *gin.Context) {
	// Define pagination parameters with defaults
	page := 1
	pageSize := 10

	// Parse query parameters
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if pageSizeStr := c.Query("page_size"); pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 {
			pageSize = ps
		}
	}

	settings, meta, err := h.useCase.GetAll(c.Request.Context(), page, pageSize)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	responseData := map[string]interface{}{
		"data": settings,
		"meta": meta,
	}

	response.Success(c, 200, "Check clock settings retrieved successfully", responseData)
}

func (h *CheckclockSettingsHandler) UpdateCheckclockSettings(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID parameter", nil)
		return
	}

	var req checkclocksettingsdto.UpdateCheckclockSettingsRequest
	if bindAndValidate(c, &req) {
		return
	}

	updateData := &domain.CheckclockSettings{
		EmployeeID:     req.EmployeeID,
		WorkScheduleID: req.WorkScheduleID,
	}

	updatedSetting, err := h.useCase.Update(c.Request.Context(), uint(id), updateData)
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "Check clock setting updated successfully", updatedSetting)
}

func (h *CheckclockSettingsHandler) DeleteCheckclockSettings(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID parameter", nil)
		return
	}

	err = h.useCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		response.BadRequest(c, err.Error(), nil)
		return
	}

	response.Success(c, 200, "Check clock setting deleted successfully", nil)
}
