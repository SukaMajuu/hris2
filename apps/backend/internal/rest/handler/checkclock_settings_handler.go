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

	createdSetting, err := h.useCase.Create(c.Request.Context(), &domain.CheckclockSettings{
		EmployeeID:     req.EmployeeID,
		WorkScheduleID: req.WorkScheduleID,
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, "Checkclock setting created successfully", createdSetting)
}

func (h *CheckclockSettingsHandler) GetCheckclockSettingsByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	setting, err := h.useCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		response.NotFound(c, "Checkclock setting not found", err)
		return
	}

	response.OK(c, "Successfully retrieved checkclock setting", setting)
}

func (h *CheckclockSettingsHandler) GetCheckclockSettingsByEmployeeID(c *gin.Context) {
	employeeIDStr := c.Param("employee_id")
	employeeID, err := strconv.ParseUint(employeeIDStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	setting, err := h.useCase.GetByEmployeeID(c.Request.Context(), uint(employeeID))
	if err != nil {
		response.NotFound(c, "Checkclock setting not found for employee", err)
		return
	}

	response.OK(c, "Successfully retrieved checkclock setting", setting)
}

func (h *CheckclockSettingsHandler) GetAllCheckclockSettings(c *gin.Context) {
	var queryDTO checkclocksettingsdto.ListCheckclockSettingsRequestQuery

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

	settingsData, err := h.useCase.GetAll(c.Request.Context(), paginationParams)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully retrieved checkclock settings", settingsData)
}

func (h *CheckclockSettingsHandler) UpdateCheckclockSettings(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	var req checkclocksettingsdto.UpdateCheckclockSettingsRequest
	if bindAndValidate(c, &req) {
		return
	}

	updatedSetting, err := h.useCase.Update(c.Request.Context(), uint(id), &domain.CheckclockSettings{
		EmployeeID:     req.EmployeeID,
		WorkScheduleID: req.WorkScheduleID,
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully updated checkclock setting", updatedSetting)
}

func (h *CheckclockSettingsHandler) DeleteCheckclockSettings(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	err = h.useCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully deleted checkclock setting", nil)
}
