package handler

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	subscriptionDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/subscription"
	subscriptionUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type SubscriptionHandler struct {
	subscriptionUseCase         *subscriptionUseCase.SubscriptionUseCase
	midtransSubscriptionUseCase *subscriptionUseCase.MidtransSubscriptionUseCase
}

func NewSubscriptionHandler(subscriptionUseCase *subscriptionUseCase.SubscriptionUseCase) *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionUseCase: subscriptionUseCase,
	}
}

func NewSubscriptionHandlerWithMidtrans(
	subscriptionUseCase *subscriptionUseCase.SubscriptionUseCase,
	midtransSubscriptionUseCase *subscriptionUseCase.MidtransSubscriptionUseCase,
) *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionUseCase:         subscriptionUseCase,
		midtransSubscriptionUseCase: midtransSubscriptionUseCase,
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

	// Use Midtrans for paid checkout if available, otherwise fall back to regular use case
	if h.midtransSubscriptionUseCase != nil {
		checkoutResponse, err := h.midtransSubscriptionUseCase.InitiatePaidCheckout(
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
		return
	}

	// Fallback to regular subscription use case (Xendit)
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

func (h *SubscriptionHandler) ProcessTripayWebhook(c *gin.Context) {
	// Get signature from header
	signature := c.GetHeader("X-Callback-Signature")
	if signature == "" {
		response.BadRequest(c, "Missing X-Callback-Signature header", nil)
		return
	}

	// Read raw body for signature validation
	body, err := c.GetRawData()
	if err != nil {
		response.BadRequest(c, "Failed to read request body", err)
		return
	}

	// Parse JSON payload
	var webhookData map[string]interface{}
	if err := json.Unmarshal(body, &webhookData); err != nil {
		response.BadRequest(c, "Invalid JSON payload", err)
		return
	}

	// Process webhook with signature validation
	if err := h.subscriptionUseCase.ProcessTripayWebhook(c.Request.Context(), webhookData, signature, string(body)); err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Tripay webhook processed successfully", nil)
}

func (h *SubscriptionHandler) ProcessMidtransWebhook(c *gin.Context) {
	// Read raw body for signature validation
	body, err := c.GetRawData()
	if err != nil {
		response.BadRequest(c, "Failed to read request body", err)
		return
	}

	// Parse JSON payload
	var notification map[string]interface{}
	if err := json.Unmarshal(body, &notification); err != nil {
		response.BadRequest(c, "Invalid JSON payload", err)
		return
	}

	// Log the notification for debugging
	fmt.Printf("Midtrans webhook received: %+v\n", notification)

	// Extract signature key for validation (optional but recommended)
	signatureKey := c.GetHeader("X-Signature-Key")
	if signatureKey == "" {
		if sig, ok := notification["signature_key"].(string); ok {
			signatureKey = sig
		}
	}

	// Basic validation - ensure required fields are present
	orderID, ok := notification["order_id"].(string)
	if !ok {
		response.BadRequest(c, "Missing order_id in notification", nil)
		return
	}

	transactionStatus, ok := notification["transaction_status"].(string)
	if !ok {
		response.BadRequest(c, "Missing transaction_status in notification", nil)
		return
	}

	fmt.Printf("Processing Midtrans webhook for order: %s, status: %s\n", orderID, transactionStatus)

	// Process Midtrans webhook notification using the regular subscription use case
	// (which already has ProcessMidtransWebhook implemented)
	if err := h.subscriptionUseCase.ProcessMidtransWebhook(c.Request.Context(), notification); err != nil {
		fmt.Printf("Error processing Midtrans webhook: %v\n", err)
		response.InternalServerError(c, err)
		return
	}

	fmt.Printf("Midtrans webhook processed successfully for order: %s\n", orderID)
	response.OK(c, "Midtrans webhook processed successfully", nil)
}

// TestMidtransWebhook - Helper endpoint to manually test Midtrans webhook processing
func (h *SubscriptionHandler) TestMidtransWebhook(c *gin.Context) {
	var req struct {
		OrderID           string `json:"order_id" binding:"required"`
		TransactionStatus string `json:"transaction_status" binding:"required"`
		TransactionID     string `json:"transaction_id"`
		GrossAmount       string `json:"gross_amount"`
		PaymentType       string `json:"payment_type"`
		TransactionTime   string `json:"transaction_time"`
		StatusCode        string `json:"status_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	// Create a test notification
	notification := map[string]interface{}{
		"order_id":           req.OrderID,
		"transaction_status": req.TransactionStatus,
		"transaction_id":     req.TransactionID,
		"gross_amount":       req.GrossAmount,
		"payment_type":       req.PaymentType,
		"transaction_time":   req.TransactionTime,
		"status_code":        req.StatusCode,
	}

	// Set defaults if not provided
	if notification["transaction_id"] == "" {
		notification["transaction_id"] = "test-" + req.OrderID
	}
	if notification["gross_amount"] == "" {
		notification["gross_amount"] = "100000"
	}
	if notification["payment_type"] == "" {
		notification["payment_type"] = "bank_transfer"
	}
	if notification["transaction_time"] == "" {
		notification["transaction_time"] = time.Now().Format("2006-01-02 15:04:05")
	}
	if notification["status_code"] == "" {
		notification["status_code"] = "200"
	}

	fmt.Printf("Testing Midtrans webhook with notification: %+v\n", notification)

	// Process the test webhook
	if err := h.subscriptionUseCase.ProcessMidtransWebhook(c.Request.Context(), notification); err != nil {
		fmt.Printf("Error processing test Midtrans webhook: %v\n", err)
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Test Midtrans webhook processed successfully", notification)
}

func (h *SubscriptionHandler) ActivateTrial(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", nil)
		return
	}

	err := h.subscriptionUseCase.CreateAutomaticTrialForPremiumUser(c.Request.Context(), userID.(uint))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Trial activated successfully", nil)
}

// HealthCheckWebhook - Health check endpoint for webhook connectivity testing
func (h *SubscriptionHandler) HealthCheckWebhook(c *gin.Context) {
	fmt.Printf("=== WEBHOOK HEALTH CHECK ===\n")
	fmt.Printf("Timestamp: %s\n", time.Now().Format(time.RFC3339))
	fmt.Printf("Method: %s\n", c.Request.Method)
	fmt.Printf("Remote Address: %s\n", c.ClientIP())
	fmt.Printf("User Agent: %s\n", c.GetHeader("User-Agent"))
	fmt.Printf("=== HEALTH CHECK END ===\n\n")

	response.OK(c, "Webhook endpoint is healthy and reachable", map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"endpoint":  "/v1/webhooks/midtrans",
		"method":    c.Request.Method,
		"server":    "HRIS Backend",
	})
}
