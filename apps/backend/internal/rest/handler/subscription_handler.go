package handler

import (
	"strconv"

	subscriptionDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/subscription"
	subscriptionUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	subscriptionUseCase *subscriptionUseCase.SubscriptionUseCase
}

func NewSubscriptionHandler(subscriptionUseCase *subscriptionUseCase.SubscriptionUseCase) *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionUseCase: subscriptionUseCase,
	}
}

func (h *SubscriptionHandler) GetSubscriptionPlans(c *gin.Context) {
	planResponses, err := h.subscriptionUseCase.GetSubscriptionPlans(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Subscription plans retrieved successfully", planResponses)
}

func (h *SubscriptionHandler) GetSeatPlans(c *gin.Context) {
	subscriptionPlanIDStr := c.Param("subscription_plan_id")
	subscriptionPlanID, err := strconv.ParseUint(subscriptionPlanIDStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Subscription plan ID must be a valid number", err)
		return
	}

	seatPlanResponses, err := h.subscriptionUseCase.GetSeatPlans(c.Request.Context(), uint(subscriptionPlanID))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Seat plans retrieved successfully", seatPlanResponses)
}

func (h *SubscriptionHandler) InitiateTrialCheckout(c *gin.Context) {
	var req subscriptionDTO.InitiateTrialCheckoutRequest
	if bindAndValidate(c, &req) {
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", nil)
		return
	}

	sessionResponse, err := h.subscriptionUseCase.InitiateTrialCheckout(
		c.Request.Context(),
		userID.(uint),
		req.SubscriptionPlanID,
		req.SeatPlanID,
	)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Trial checkout initiated successfully", sessionResponse)
}

func (h *SubscriptionHandler) InitiatePaidCheckout(c *gin.Context) {
	var req subscriptionDTO.InitiatePaidCheckoutRequest
	if bindAndValidate(c, &req) {
		return
	}

	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", nil)
		return
	}

	checkoutResponse, err := h.subscriptionUseCase.InitiatePaidCheckout(
		c.Request.Context(),
		userID.(uint),
		req.SubscriptionPlanID,
		req.SeatPlanID,
		req.IsMonthly,
	)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Paid checkout initiated successfully", checkoutResponse)
}

func (h *SubscriptionHandler) CompleteTrialCheckout(c *gin.Context) {
	var req subscriptionDTO.CompleteTrialCheckoutRequest
	if bindAndValidate(c, &req) {
		return
	}

	billingInfo := subscriptionDTO.FromCompleteTrialCheckoutRequest(&req)

	subscriptionResponse, err := h.subscriptionUseCase.CompleteTrialCheckout(
		c.Request.Context(),
		req.SessionID,
		billingInfo,
	)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Trial checkout completed successfully", subscriptionResponse)
}

func (h *SubscriptionHandler) GetUserSubscription(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", nil)
		return
	}

	subscriptionResponse, err := h.subscriptionUseCase.GetUserSubscription(c.Request.Context(), userID.(uint))
	if err != nil {
		response.NotFound(c, "Subscription not found", err)
		return
	}

	response.OK(c, "User subscription retrieved successfully", subscriptionResponse)
}

func (h *SubscriptionHandler) GetCheckoutSession(c *gin.Context) {
	sessionID := c.Param("session_id")
	if sessionID == "" {
		response.BadRequest(c, "Session ID is required", nil)
		return
	}

	sessionResponse, err := h.subscriptionUseCase.GetCheckoutSession(c.Request.Context(), sessionID)
	if err != nil {
		response.NotFound(c, "Checkout session not found", err)
		return
	}

	response.OK(c, "Checkout session retrieved successfully", sessionResponse)
}

func (h *SubscriptionHandler) ProcessWebhook(c *gin.Context) {
	callbackToken := c.GetHeader("X-CALLBACK-TOKEN")
	if callbackToken == "" {
		response.BadRequest(c, "Missing callback token", nil)
		return
	}

	var webhookData map[string]interface{}
	if err := c.ShouldBindJSON(&webhookData); err != nil {
		response.BadRequest(c, "Invalid webhook payload", err)
		return
	}

	if err := h.subscriptionUseCase.ProcessPaymentWebhook(c.Request.Context(), webhookData); err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Webhook processed successfully", nil)
}
