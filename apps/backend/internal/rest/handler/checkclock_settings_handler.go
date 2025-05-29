package handler

import (
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
