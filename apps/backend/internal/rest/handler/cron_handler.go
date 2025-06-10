package handler

import (
	"net/http"

	attendanceUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/attendance"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type CronHandler struct {
	subscriptionUC *subscription.SubscriptionUseCase
	attendanceUC   *attendanceUseCase.AttendanceUseCase
}

func NewCronHandler(subscriptionUC *subscription.SubscriptionUseCase, attendanceUC *attendanceUseCase.AttendanceUseCase) *CronHandler {
	return &CronHandler{
		subscriptionUC: subscriptionUC,
		attendanceUC:   attendanceUC,
	}
}

func (h *CronHandler) CheckTrialExpiry(c *gin.Context) {
	ctx := c.Request.Context()

	err := h.subscriptionUC.ProcessExpiredTrials(ctx)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to check trial expiry", err)
		return
	}

	response.OK(c, "Trial expiry check completed", nil)
}

func (h *CronHandler) SendTrialWarnings(c *gin.Context) {
	ctx := c.Request.Context()

	err := h.subscriptionUC.SendTrialWarningNotifications(ctx)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to send trial warnings", err)
		return
	}

	response.OK(c, "Trial warnings sent", nil)
}

func (h *CronHandler) ProcessAutoRenewals(c *gin.Context) {
	ctx := c.Request.Context()

	err := h.subscriptionUC.ProcessAutoRenewals(ctx)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to process auto renewals", err)
		return
	}

	response.OK(c, "Auto renewals processed", nil)
}

func (h *CronHandler) UpdateUsageStatistics(c *gin.Context) {
	ctx := c.Request.Context()

	err := h.subscriptionUC.UpdateUsageStatistics(ctx)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to update usage statistics", err)
		return
	}

	response.OK(c, "Usage statistics updated", nil)
}

func (h *CronHandler) ProcessDailyAbsentCheck(c *gin.Context) {
	ctx := c.Request.Context()

	err := h.attendanceUC.ProcessDailyAbsentCheck(ctx)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Failed to process daily absent check", err)
		return
	}

	response.OK(c, "Daily absent check completed", nil)
}
