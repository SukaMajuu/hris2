package subscription

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	subscriptionDto "github.com/SukaMajuu/hris/apps/backend/domain/dto/subscription"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/tripay"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// Constants for repeated string values
const (
	OrderIDPrefix     = "HRIS-"
	SeatUpgradeType   = "seat_upgrade"
	PlanUpgradeType   = "plan_upgrade"
	PlanDowngradeType = "plan_downgrade"
	SeatDowngradeType = "seat_downgrade"
)

// convertToIDRWholeNumber converts decimal amount to whole number for IDR currency
// Midtrans requires whole numbers for IDR, no cents allowed
func convertToIDRWholeNumber(amount decimal.Decimal) decimal.Decimal {
	// Round to nearest whole number
	rounded := amount.Round(0)

	// Ensure minimum amount for Midtrans (avoid zero amounts)
	minAmount := decimal.NewFromInt(1000) // 1000 IDR minimum
	if rounded.LessThan(minAmount) {
		return minAmount
	}

	return rounded
}

type SubscriptionUseCase struct {
	xenditRepo     interfaces.PaymentRepository
	employeeRepo   interfaces.EmployeeRepository
	authRepo       interfaces.AuthRepository
	midtransClient interfaces.MidtransClient
}

func NewSubscriptionUseCase(
	xenditRepo interfaces.PaymentRepository,
	employeeRepo interfaces.EmployeeRepository,
	authRepo interfaces.AuthRepository,
	midtransClient interfaces.MidtransClient,
) *SubscriptionUseCase {
	return &SubscriptionUseCase{
		xenditRepo:     xenditRepo,
		employeeRepo:   employeeRepo,
		authRepo:       authRepo,
		midtransClient: midtransClient,
	}
}

func (uc *SubscriptionUseCase) GetSubscriptionPlans(ctx context.Context) ([]subscriptionDto.SubscriptionPlanResponse, error) {
	plans, err := uc.xenditRepo.GetSubscriptionPlans(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription plans: %w", err)
	}

	var planResponses []subscriptionDto.SubscriptionPlanResponse
	for _, plan := range plans {
		planResponses = append(planResponses, *subscriptionDto.ToSubscriptionPlanResponse(&plan))
	}

	return planResponses, nil
}

func (uc *SubscriptionUseCase) GetSeatPlans(ctx context.Context, subscriptionPlanID uint) ([]subscriptionDto.SeatPlanResponse, error) {
	seatPlans, err := uc.xenditRepo.GetSeatPlansBySubscriptionPlan(ctx, subscriptionPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get seat plans: %w", err)
	}

	var seatPlanResponses []subscriptionDto.SeatPlanResponse
	for _, seatPlan := range seatPlans {
		seatPlanResponses = append(seatPlanResponses, *subscriptionDto.ToSeatPlanResponse(&seatPlan))
	}

	return seatPlanResponses, nil
}

func (uc *SubscriptionUseCase) InitiateTrialCheckout(ctx context.Context, userID, subscriptionPlanID, seatPlanID uint) (*subscriptionDto.CheckoutSessionResponse, error) {
	_, err := uc.xenditRepo.GetSeatPlan(ctx, seatPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get seat plan: %w", err)
	}

	sessionID := uuid.New().String()
	checkoutSession := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             userID,
		SubscriptionPlanID: subscriptionPlanID,
		SeatPlanID:         seatPlanID,
		IsTrialCheckout:    true,
		Amount:             decimal.NewFromInt(0),
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now().UTC(),
		ExpiresAt:          func() *time.Time { t := time.Now().UTC().Add(24 * time.Hour); return &t }(),
	}

	if err := uc.xenditRepo.CreateCheckoutSession(ctx, checkoutSession); err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	return subscriptionDto.ToCheckoutSessionResponse(checkoutSession), nil
}

func (uc *SubscriptionUseCase) InitiatePaidCheckout(ctx context.Context, userID, subscriptionPlanID, seatPlanID uint, isMonthly bool) (*subscriptionDto.InitiatePaidCheckoutResponse, error) {
	seatPlan, err := uc.xenditRepo.GetSeatPlan(ctx, seatPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get seat plan: %w", err)
	}

	var amount decimal.Decimal
	if isMonthly {
		amount = seatPlan.PricePerMonth
	} else {
		amount = seatPlan.PricePerYear
	}

	sessionID := uuid.New().String()
	checkoutSession := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             userID,
		SubscriptionPlanID: subscriptionPlanID,
		SeatPlanID:         seatPlanID,
		IsTrialCheckout:    false,
		Amount:             amount,
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now().UTC(),
		ExpiresAt:          func() *time.Time { t := time.Now().UTC().Add(24 * time.Hour); return &t }(),
	}

	if err := uc.xenditRepo.CreateCheckoutSession(ctx, checkoutSession); err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	description := fmt.Sprintf("HRIS %s Subscription - %d-%d employees",
		func() string {
			if isMonthly {
				return "Monthly"
			}
			return "Yearly"
		}(),
		seatPlan.MinEmployees,
		seatPlan.MaxEmployees)

	// Get user for Midtrans customer details
	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Create Midtrans Snap transaction instead of Xendit invoice
	orderID := fmt.Sprintf("%s%s", OrderIDPrefix, sessionID)

	// Ensure amount meets Midtrans minimum requirement (1000 IDR)
	paymentAmount := amount
	if paymentAmount.LessThan(decimal.NewFromInt(1000)) {
		paymentAmount = decimal.NewFromInt(1000)
	}

	// Convert to whole number for IDR currency (Midtrans requirement)
	paymentAmount = convertToIDRWholeNumber(paymentAmount)

	snapReq := interfaces.MidtransSnapRequest{
		TransactionDetails: interfaces.MidtransTransactionDetails{
			OrderID:     orderID,
			GrossAmount: paymentAmount.IntPart(), // Convert to int64
		},
		CustomerDetails: &interfaces.MidtransCustomerDetails{
			Email: user.Email,
		},
		ItemDetails: []interfaces.MidtransItemDetails{
			{
				ID:       fmt.Sprintf("subscription-%d", seatPlanID),
				Name:     description,
				Price:    paymentAmount.IntPart(), // Convert to int64
				Quantity: 1,
				Category: func() *string { s := "subscription"; return &s }(),
			},
		},
		Callbacks: &interfaces.MidtransCallbacks{
			Finish:  "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/success",
			Error:   "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/error",
			Pending: "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/pending",
		},
		Expiry: &interfaces.MidtransExpiry{
			Unit:     "hour",
			Duration: 24,
		},
		PageExpiry: &interfaces.MidtransPageExpiry{
			Duration: 24,
			Unit:     "hour",
		},
		CustomField1: &sessionID, // Store session ID for reference
	}

	snapResp, err := uc.midtransClient.CreateSnapTransaction(ctx, snapReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create Midtrans Snap transaction: %w", err)
	}

	// Update checkout session with Midtrans info
	checkoutSession.PaymentToken = &snapResp.Token
	checkoutSession.PaymentURL = &snapResp.RedirectURL
	checkoutSession.PaymentReference = &orderID
	checkoutSession.Status = enums.CheckoutPending

	if err := uc.xenditRepo.UpdateCheckoutSession(ctx, checkoutSession); err != nil {
		return nil, fmt.Errorf("failed to update checkout session: %w", err)
	}

	return &subscriptionDto.InitiatePaidCheckoutResponse{
		CheckoutSession: subscriptionDto.ToCheckoutSessionResponse(checkoutSession),
		Invoice: &subscriptionDto.InvoiceResponse{
			ID:         snapResp.Token,
			Amount:     amount,
			Currency:   "IDR",
			ExpiryDate: time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339),
		},
	}, nil
}

func (uc *SubscriptionUseCase) CompleteTrialCheckout(ctx context.Context, sessionID string, billingInfo *domain.CustomerBillingInfo) (*subscriptionDto.SubscriptionResponse, error) {
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get checkout session: %w", err)
	}

	if !session.IsTrialCheckout {
		return nil, fmt.Errorf("session is not for trial checkout")
	}

	if session.Status != enums.CheckoutInitiated {
		return nil, fmt.Errorf("checkout session is not in initiated status")
	}

	subscription := &domain.Subscription{
		AdminUserID:          session.UserID,
		SubscriptionPlanID:   session.SubscriptionPlanID,
		SeatPlanID:           session.SeatPlanID,
		Status:               enums.StatusTrial,
		StartDate:            time.Now().UTC(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 0,
	}

	subscription.StartTrial()

	if err := uc.xenditRepo.CreateSubscription(ctx, subscription); err != nil {
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	billingInfo.SubscriptionID = subscription.ID
	if err := uc.xenditRepo.CreateCustomerBillingInfo(ctx, billingInfo); err != nil {
		return nil, fmt.Errorf("failed to create billing info: %w", err)
	}

	trialActivity := &domain.TrialActivity{
		SubscriptionID: subscription.ID,
		UserID:         session.UserID,
		EmployeesAdded: 0,
		FeaturesUsed:   "[]",
	}
	if err := uc.xenditRepo.CreateTrialActivity(ctx, trialActivity); err != nil {
		return nil, fmt.Errorf("failed to create trial activity: %w", err)
	}

	session.MarkAsCompleted(subscription.ID, nil)
	if err := uc.xenditRepo.UpdateCheckoutSession(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to update checkout session: %w", err)
	}

	return subscriptionDto.ToSubscriptionResponse(subscription), nil
}

func (uc *SubscriptionUseCase) ProcessPaymentWebhook(ctx context.Context, webhookData map[string]interface{}) error {
	webhookType, ok := webhookData["webhook_type"].(string)
	if !ok {
		return fmt.Errorf("missing webhook_type")
	}

	switch webhookType {
	case "invoice.paid":
		return uc.processInvoicePaidWebhook(ctx, webhookData)
	case "invoice.expired":
		return uc.processInvoiceExpiredWebhook(ctx, webhookData)
	case "invoice.failed":
		return uc.processInvoiceFailedWebhook(ctx, webhookData)
	default:
		return fmt.Errorf("unsupported webhook type: %s", webhookType)
	}
}

func (uc *SubscriptionUseCase) processInvoicePaidWebhook(ctx context.Context, data map[string]interface{}) error {
	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID")
	}

	invoiceID, ok := data["id"].(string)
	if !ok {
		return fmt.Errorf("missing invoice ID")
	}

	// Try to extract session ID from order ID if it has HRIS prefix
	if strings.HasPrefix(externalID, OrderIDPrefix) {
		sessionID := externalID[len(OrderIDPrefix):] // Remove prefix
		session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
		if err != nil {
			return fmt.Errorf("failed to get checkout session: %w", err)
		}

		paidAtStr, _ := data["paid_at"].(string)
		paidAt, _ := time.Parse(time.RFC3339, paidAtStr)

		// Convert data to JSON string for storage
		gatewayResponseJSON, _ := json.Marshal(data)
		gatewayResponseStr := string(gatewayResponseJSON)

		transaction := &domain.PaymentTransaction{
			SubscriptionID:  *session.SubscriptionID,
			TransactionID:   &invoiceID,
			OrderID:         externalID,
			Amount:          session.Amount,
			Currency:        session.Currency,
			Status:          enums.PaymentPaid,
			PaymentMethod:   func() *string { s, _ := data["payment_method"].(string); return &s }(),
			Description:     "Subscription payment",
			PaidAt:          &paidAt,
			GatewayResponse: &gatewayResponseStr,
		}

		if err := uc.xenditRepo.CreatePaymentTransaction(ctx, transaction); err != nil {
			return fmt.Errorf("failed to create payment transaction: %w", err)
		}

		subscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, session.UserID)
		if err != nil {
			return fmt.Errorf("failed to get subscription: %w", err)
		}

		if subscription.Status == enums.StatusTrial {
			subscription.ConvertFromTrialWithCheckoutSession(session.Amount)
			if err := uc.xenditRepo.UpdateSubscription(ctx, subscription); err != nil {
				return fmt.Errorf("failed to update subscription: %w", err)
			}

			trialActivity, err := uc.xenditRepo.GetTrialActivityBySubscription(ctx, subscription.ID)
			if err == nil {
				trialActivity.MarkAsConverted()
				_ = uc.xenditRepo.UpdateTrialActivity(ctx, trialActivity)
			}
		}

		session.MarkAsCompleted(subscription.ID, &transaction.ID)
		return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
	}

	return fmt.Errorf("missing or invalid external ID format")
}

func (uc *SubscriptionUseCase) processInvoiceExpiredWebhook(ctx context.Context, data map[string]interface{}) error {
	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID")
	}

	// Try to extract session ID from order ID if it has HRIS prefix
	if strings.HasPrefix(externalID, OrderIDPrefix) {
		sessionID := externalID[len(OrderIDPrefix):]
		session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
		if err != nil {
			return fmt.Errorf("failed to get checkout session: %w", err)
		}

		session.Status = enums.CheckoutExpired
		return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
	}

	return fmt.Errorf("invalid external ID format")
}

func (uc *SubscriptionUseCase) processInvoiceFailedWebhook(ctx context.Context, data map[string]interface{}) error {
	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID")
	}

	sessionID := externalID[9:]
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	session.MarkAsFailed()
	return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
}

func (uc *SubscriptionUseCase) GetUserSubscription(ctx context.Context, userID uint) (*subscriptionDto.SubscriptionResponse, error) {
	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	var adminUserID uint

	switch user.Role {
	case enums.RoleAdmin:
		adminUserID = userID
	case enums.RoleUser:
		employee, err := uc.employeeRepo.GetByUserID(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to get employee: %w", err)
		}

		adminUserID, err = uc.findAdminUserID(ctx, employee)
		if err != nil {
			return nil, fmt.Errorf("failed to find admin user: %w", err)
		}
	default:
		return nil, fmt.Errorf("invalid user role: %s", user.Role)
	}

	subscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, adminUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user subscription: %w", err)
	}
	return subscriptionDto.ToSubscriptionResponse(subscription), nil
}

func (uc *SubscriptionUseCase) findAdminUserID(ctx context.Context, employee *domain.Employee) (uint, error) {
	if employee.User.ID == 0 {
		emp, err := uc.employeeRepo.GetByID(ctx, employee.ID)
		if err != nil {
			return 0, fmt.Errorf("failed to get employee with user info: %w", err)
		}
		employee = emp
	}

	if employee.User.Role == enums.RoleAdmin {
		return employee.User.ID, nil
	}

	if employee.ManagerID == nil {
		return 0, fmt.Errorf("employee has no manager and is not admin")
	}

	manager, err := uc.employeeRepo.GetByID(ctx, *employee.ManagerID)
	if err != nil {
		return 0, fmt.Errorf("failed to get manager employee: %w", err)
	}

	return uc.findAdminUserID(ctx, manager)
}

func (uc *SubscriptionUseCase) GetCheckoutSession(ctx context.Context, sessionID string) (*subscriptionDto.CheckoutSessionResponse, error) {
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get checkout session: %w", err)
	}
	return subscriptionDto.ToCheckoutSessionResponse(session), nil
}

func (uc *SubscriptionUseCase) ProcessTripayWebhook(ctx context.Context, webhookData map[string]interface{}, signature, rawBody string) error {
	// Validasi signature Tripay
	if err := uc.validateTripaySignature(signature, rawBody); err != nil {
		return fmt.Errorf("signature validation failed: %w", err)
	}

	reference, ok := webhookData["reference"].(string)
	if !ok {
		return fmt.Errorf("missing reference")
	}

	status, ok := webhookData["status"].(string)
	if !ok {
		return fmt.Errorf("missing status")
	}

	merchantRef, ok := webhookData["merchant_ref"].(string)
	if !ok {
		return fmt.Errorf("missing merchant_ref")
	}

	switch status {
	case "PAID":
		return uc.processTripayPaidWebhook(ctx, webhookData, reference, merchantRef)
	case "EXPIRED":
		return uc.processTripayExpiredWebhook(ctx, merchantRef)
	case "FAILED":
		return uc.processTripayFailedWebhook(ctx, merchantRef)
	default:
		return fmt.Errorf("unsupported tripay status: %s", status)
	}
}

func (uc *SubscriptionUseCase) processTripayPaidWebhook(ctx context.Context, data map[string]interface{}, reference, merchantRef string) error {
	// Extract session ID from merchant_ref (format: "checkout_sessionID")
	sessionID := merchantRef[9:]
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	// Parse payment time from Unix timestamp
	var paidAt time.Time
	if paidAtUnix, ok := data["paid_at"].(float64); ok {
		paidAt = time.Unix(int64(paidAtUnix), 0)
	} else {
		paidAt = time.Now().UTC()
	}

	// Get payment method from Tripay callback
	paymentMethod := "Unknown"
	if method, ok := data["payment_method"].(string); ok {
		paymentMethod = method
	}

	// Get total amount received
	var amountReceived decimal.Decimal
	if totalAmount, ok := data["total_amount"].(float64); ok {
		amountReceived = decimal.NewFromFloat(totalAmount)
	} else {
		amountReceived = session.Amount
	}

	// Convert data to JSON string for storage
	gatewayResponseJSON, _ := json.Marshal(data)
	gatewayResponseStr := string(gatewayResponseJSON)

	// Create payment transaction record
	transaction := &domain.PaymentTransaction{
		SubscriptionID:  *session.SubscriptionID,
		TransactionID:   &reference, // Use Tripay reference as transaction ID
		OrderID:         merchantRef,
		Amount:          amountReceived,
		Currency:        session.Currency,
		Status:          enums.PaymentPaid,
		PaymentMethod:   &paymentMethod,
		Description:     "Subscription payment via Tripay",
		PaidAt:          &paidAt,
		GatewayResponse: &gatewayResponseStr,
	}

	if err := uc.xenditRepo.CreatePaymentTransaction(ctx, transaction); err != nil {
		return fmt.Errorf("failed to create payment transaction: %w", err)
	}

	// Get subscription and update if needed
	subscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, session.UserID)
	if err != nil {
		return fmt.Errorf("failed to get subscription: %w", err)
	}

	// Convert from trial if applicable
	if subscription.Status == enums.StatusTrial {
		subscription.ConvertFromTrialWithCheckoutSession(amountReceived)
		if err := uc.xenditRepo.UpdateSubscription(ctx, subscription); err != nil {
			return fmt.Errorf("failed to update subscription: %w", err)
		}

		// Update trial activity
		trialActivity, err := uc.xenditRepo.GetTrialActivityBySubscription(ctx, subscription.ID)
		if err == nil {
			trialActivity.MarkAsConverted()
			_ = uc.xenditRepo.UpdateTrialActivity(ctx, trialActivity)
		}
	}

	// Mark checkout session as completed
	session.MarkAsCompleted(subscription.ID, &transaction.ID)
	return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
}

func (uc *SubscriptionUseCase) processTripayExpiredWebhook(ctx context.Context, merchantRef string) error {
	sessionID := merchantRef[9:]
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	session.Status = enums.CheckoutExpired
	return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
}

func (uc *SubscriptionUseCase) processTripayFailedWebhook(ctx context.Context, merchantRef string) error {
	sessionID := merchantRef[9:]
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	session.MarkAsFailed()
	return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
}

func (uc *SubscriptionUseCase) validateTripaySignature(signature, rawBody string) error {
	// TODO: Get Tripay private key from config
	// For now, we'll use a placeholder
	privateKey := "your-tripay-private-key-here" // This should come from config

	if !tripay.ValidateCallbackSignature(privateKey, signature, rawBody) {
		return fmt.Errorf("invalid signature")
	}

	return nil
}

func (uc *SubscriptionUseCase) ProcessMidtransWebhook(ctx context.Context, notification map[string]interface{}) error {
	// Validate required fields
	orderID, exists := notification["order_id"].(string)
	if !exists || orderID == "" {
		return fmt.Errorf("missing order_id")
	}

	// Validate transaction status
	transactionStatus, exists := notification["transaction_status"].(string)
	if !exists || transactionStatus == "" {
		return fmt.Errorf("missing transaction_status")
	}

	// Extract session ID from order ID (format: HRIS-{sessionID})
	if len(orderID) < 6 || !strings.HasPrefix(orderID, OrderIDPrefix) {
		return fmt.Errorf("invalid order ID format: %s", orderID)
	}
	sessionID := orderID[len(OrderIDPrefix):] // Remove prefix

	fmt.Printf("ProcessMidtransWebhook: Processing order %s with status %s\n", orderID, transactionStatus)

	// Find checkout session
	checkoutSession, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		fmt.Printf("ProcessMidtransWebhook: Failed to get checkout session for sessionID %s: %v\n", sessionID, err)
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	fmt.Printf("ProcessMidtransWebhook: Found checkout session: UserID=%d, Status=%s, Amount=%s\n",
		checkoutSession.UserID, checkoutSession.Status, checkoutSession.Amount.String())

	// Update checkout session status based on Midtrans transaction status
	switch transactionStatus {
	case statusCapture, statusSettlement:
		// Payment successful
		fmt.Printf("ProcessMidtransWebhook: Payment successful for order %s, activating subscription\n", orderID)

		checkoutSession.Status = enums.CheckoutCompleted
		checkoutSession.CompletedAt = func() *time.Time { t := time.Now().UTC(); return &t }()

		// Activate subscription first (this sets the subscription ID)
		if err := uc.activateMidtransSubscription(ctx, checkoutSession); err != nil {
			fmt.Printf("ProcessMidtransWebhook: Failed to activate subscription: %v\n", err)
			return fmt.Errorf("failed to activate subscription: %w", err)
		}

		// Safely access subscription ID
		if checkoutSession.SubscriptionID != nil {
			fmt.Printf("ProcessMidtransWebhook: Subscription activated successfully, SubscriptionID=%d\n",
				*checkoutSession.SubscriptionID)
		} else {
			fmt.Printf("ProcessMidtransWebhook: Warning: Subscription activation completed but SubscriptionID is nil\n")
		}

		// Create payment transaction record (after subscription is created)
		if err := uc.createMidtransPaymentTransaction(ctx, checkoutSession, notification); err != nil {
			fmt.Printf("ProcessMidtransWebhook: Failed to create payment transaction: %v\n", err)
			return fmt.Errorf("failed to create payment transaction: %w", err)
		}

		fmt.Printf("ProcessMidtransWebhook: Payment transaction created successfully\n")

	case statusPending:
		// Payment pending (e.g., bank transfer waiting)
		fmt.Printf("ProcessMidtransWebhook: Payment pending for order %s\n", orderID)
		checkoutSession.Status = enums.CheckoutPending

	case statusDeny, statusCancel, statusExpire:
		// Payment failed or canceled
		fmt.Printf("ProcessMidtransWebhook: Payment failed/canceled for order %s\n", orderID)
		checkoutSession.MarkAsFailed()

	default:
		return fmt.Errorf("unknown transaction status: %s", transactionStatus)
	}

	// Update checkout session
	if err := uc.xenditRepo.UpdateCheckoutSession(ctx, checkoutSession); err != nil {
		fmt.Printf("ProcessMidtransWebhook: Failed to update checkout session: %v\n", err)
		return fmt.Errorf("failed to update checkout session: %w", err)
	}

	fmt.Printf("ProcessMidtransWebhook: Checkout session updated successfully\n")
	return nil
}

func (uc *SubscriptionUseCase) createMidtransPaymentTransaction(ctx context.Context, session *domain.CheckoutSession, notification map[string]interface{}) error {
	// Check if subscription ID is set
	if session.SubscriptionID == nil {
		return fmt.Errorf("subscription ID is nil - subscription activation may have failed")
	}

	transactionID, _ := notification["transaction_id"].(string)
	paymentType, _ := notification["payment_type"].(string)
	transactionTime, _ := notification["transaction_time"].(string)

	// Parse transaction time
	paidAt, _ := time.Parse("2006-01-02 15:04:05", transactionTime)

	// Convert notification to JSON string for storage
	gatewayResponseJSON, _ := json.Marshal(notification)
	gatewayResponseStr := string(gatewayResponseJSON)

	transaction := &domain.PaymentTransaction{
		SubscriptionID:  *session.SubscriptionID,
		TransactionID:   &transactionID,
		OrderID:         fmt.Sprintf("%s%s", OrderIDPrefix, session.SessionID),
		Amount:          session.Amount,
		Currency:        session.Currency,
		Status:          enums.PaymentPaid,
		PaymentMethod:   &paymentType,
		PaymentType:     &paymentType,
		Description:     "Midtrans subscription payment",
		PaidAt:          &paidAt,
		GatewayResponse: &gatewayResponseStr,
	}

	return uc.xenditRepo.CreatePaymentTransaction(ctx, transaction)
}

func (uc *SubscriptionUseCase) activateMidtransSubscription(ctx context.Context, checkoutSession *domain.CheckoutSession) error {
	fmt.Printf("activateMidtransSubscription: Starting activation for UserID=%d\n", checkoutSession.UserID)

	// Try to get existing subscription (for trial users)
	subscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, checkoutSession.UserID)

	if err != nil {
		// No existing subscription found - create new paid subscription
		return uc.createNewPaidSubscription(ctx, checkoutSession)
	}

	fmt.Printf("activateMidtransSubscription: Found existing subscription ID=%d, Status=%s\n",
		subscription.ID, subscription.Status)

	// Existing subscription found - handle trial conversion OR active subscription upgrade
	switch subscription.Status {
	case enums.StatusTrial:
		return uc.convertTrialSubscription(ctx, checkoutSession, subscription)
	case enums.StatusActive:
		return uc.upgradeActiveSubscription(ctx, checkoutSession, subscription)
	default:
		fmt.Printf("activateMidtransSubscription: Existing subscription has status %s, skipping modification\n", subscription.Status)
		checkoutSession.SubscriptionID = &subscription.ID
		return nil
	}
}

// createNewPaidSubscription creates a new paid subscription for users without existing subscriptions
func (uc *SubscriptionUseCase) createNewPaidSubscription(ctx context.Context, checkoutSession *domain.CheckoutSession) error {
	fmt.Printf("activateMidtransSubscription: No existing subscription found, creating new subscription\n")

	// Get seat plan to calculate subscription period
	seatPlan, err := uc.xenditRepo.GetSeatPlan(ctx, checkoutSession.SeatPlanID)
	if err != nil {
		fmt.Printf("activateMidtransSubscription: Failed to get seat plan: %v\n", err)
		return fmt.Errorf("failed to get seat plan: %w", err)
	}

	fmt.Printf("activateMidtransSubscription: Got seat plan: %s (%d-%d employees)\n",
		seatPlan.SubscriptionPlan.Name, seatPlan.MinEmployees, seatPlan.MaxEmployees)

	// Calculate subscription period
	var startDate, endDate time.Time
	startDate = time.Now().UTC()

	// Determine if it's monthly or yearly based on amount
	if checkoutSession.Amount.Cmp(seatPlan.PricePerMonth) == 0 {
		// Monthly subscription
		endDate = startDate.AddDate(0, 1, 0)
		fmt.Printf("activateMidtransSubscription: Creating monthly subscription (ends: %s)\n", endDate.Format("2006-01-02"))
	} else {
		// Yearly subscription
		endDate = startDate.AddDate(1, 0, 0)
		fmt.Printf("activateMidtransSubscription: Creating yearly subscription (ends: %s)\n", endDate.Format("2006-01-02"))
	}

	// Create new subscription
	newSubscription := &domain.Subscription{
		AdminUserID:          checkoutSession.UserID,
		SubscriptionPlanID:   checkoutSession.SubscriptionPlanID,
		SeatPlanID:           checkoutSession.SeatPlanID,
		Status:               enums.StatusActive,
		StartDate:            time.Now().UTC(),
		EndDate:              &endDate,
		IsAutoRenew:          true,
		CurrentEmployeeCount: 0,
	}

	if err := uc.xenditRepo.CreateSubscription(ctx, newSubscription); err != nil {
		fmt.Printf("activateMidtransSubscription: Failed to create subscription: %v\n", err)
		return fmt.Errorf("failed to create subscription: %w", err)
	}

	fmt.Printf("activateMidtransSubscription: Created subscription with ID=%d, Status=%s\n",
		newSubscription.ID, newSubscription.Status)

	// Get user info for billing
	user, err := uc.authRepo.GetUserByID(ctx, checkoutSession.UserID)
	if err != nil {
		fmt.Printf("activateMidtransSubscription: Failed to get user: %v\n", err)
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Create basic billing info for paid subscriptions
	billingInfo := &domain.CustomerBillingInfo{
		SubscriptionID:      newSubscription.ID,
		CompanyName:         fmt.Sprintf("%s Company", user.Email), // Use email as fallback
		CompanyAddress:      "Address not provided",                // Default address
		CompanyEmail:        user.Email,
		BillingContactName:  user.Email, // Use email as contact name
		BillingContactEmail: user.Email,
	}

	if err := uc.xenditRepo.CreateCustomerBillingInfo(ctx, billingInfo); err != nil {
		fmt.Printf("activateMidtransSubscription: Failed to create billing info: %v\n", err)
		return fmt.Errorf("failed to create billing info: %w", err)
	}

	fmt.Printf("activateMidtransSubscription: Created billing info for subscription\n")

	// Update checkout session with subscription ID
	checkoutSession.SubscriptionID = &newSubscription.ID
	fmt.Printf("activateMidtransSubscription: Updated checkout session with SubscriptionID=%d\n", newSubscription.ID)
	return nil
}

// convertTrialSubscription converts a trial subscription to paid
func (uc *SubscriptionUseCase) convertTrialSubscription(ctx context.Context, checkoutSession *domain.CheckoutSession, subscription *domain.Subscription) error {
	fmt.Printf("activateMidtransSubscription: Converting trial subscription to paid\n")

	// Use explicit field update to fix GORM tracking issue
	err := uc.xenditRepo.UpdateSubscriptionFields(ctx, subscription.ID, map[string]interface{}{
		"subscription_plan_id": checkoutSession.SubscriptionPlanID,
		"seat_plan_id":         checkoutSession.SeatPlanID,
		"status":               enums.StatusActive,
	})
	if err != nil {
		fmt.Printf("activateMidtransSubscription: Failed to update subscription: %v\n", err)
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	// Verify the update was successful by reloading from database
	updatedSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, checkoutSession.UserID)
	if err != nil {
		fmt.Printf("activateMidtransSubscription: Warning: Failed to verify subscription update: %v\n", err)
	} else {
		fmt.Printf("activateMidtransSubscription: Database verification - PlanID=%d, SeatPlanID=%d\n",
			updatedSubscription.SubscriptionPlanID, updatedSubscription.SeatPlanID)
	}

	fmt.Printf("activateMidtransSubscription: Trial converted to paid subscription (PlanID=%d, SeatPlanID=%d)\n",
		checkoutSession.SubscriptionPlanID, checkoutSession.SeatPlanID)

	// Update trial activity to mark as converted
	trialActivity, err := uc.xenditRepo.GetTrialActivityBySubscription(ctx, subscription.ID)
	if err == nil && trialActivity != nil {
		trialActivity.MarkAsConverted()
		if updateErr := uc.xenditRepo.UpdateTrialActivity(ctx, trialActivity); updateErr != nil {
			fmt.Printf("activateMidtransSubscription: Failed to update trial activity: %v\n", updateErr)
		} else {
			fmt.Printf("activateMidtransSubscription: Updated trial activity\n")
		}
	}

	checkoutSession.SubscriptionID = &subscription.ID
	fmt.Printf("activateMidtransSubscription: Updated checkout session with existing SubscriptionID=%d\n", subscription.ID)
	return nil
}

// upgradeActiveSubscription upgrades an active subscription
func (uc *SubscriptionUseCase) upgradeActiveSubscription(ctx context.Context, checkoutSession *domain.CheckoutSession, subscription *domain.Subscription) error {
	fmt.Printf("activateMidtransSubscription: Upgrading active subscription\n")

	// Debug: Show checkout session values before assignment
	fmt.Printf("activateMidtransSubscription: CheckoutSession values - PlanID=%d, SeatPlanID=%d\n",
		checkoutSession.SubscriptionPlanID, checkoutSession.SeatPlanID)
	fmt.Printf("activateMidtransSubscription: Current subscription values - PlanID=%d, SeatPlanID=%d\n",
		subscription.SubscriptionPlanID, subscription.SeatPlanID)

	// Use explicit field update to fix GORM tracking issue
	err := uc.xenditRepo.UpdateSubscriptionFields(ctx, subscription.ID, map[string]interface{}{
		"subscription_plan_id": checkoutSession.SubscriptionPlanID,
		"seat_plan_id":         checkoutSession.SeatPlanID,
	})
	if err != nil {
		fmt.Printf("activateMidtransSubscription: Failed to update subscription: %v\n", err)
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	// Verify the update was successful by reloading from database
	updatedSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, checkoutSession.UserID)
	if err != nil {
		fmt.Printf("activateMidtransSubscription: Warning: Failed to verify subscription update: %v\n", err)
	} else {
		fmt.Printf("activateMidtransSubscription: Database verification - PlanID=%d, SeatPlanID=%d\n",
			updatedSubscription.SubscriptionPlanID, updatedSubscription.SeatPlanID)
	}

	fmt.Printf("activateMidtransSubscription: Active subscription upgraded (PlanID=%d, SeatPlanID=%d)\n",
		checkoutSession.SubscriptionPlanID, checkoutSession.SeatPlanID)

	checkoutSession.SubscriptionID = &subscription.ID
	fmt.Printf("activateMidtransSubscription: Updated checkout session with existing SubscriptionID=%d\n", subscription.ID)
	return nil
}

// PreviewSubscriptionPlanChange previews the changes when upgrading/downgrading subscription plan
func (uc *SubscriptionUseCase) PreviewSubscriptionPlanChange(ctx context.Context, userID uint, newPlanID uint, newSeatPlanID *uint, isMonthly bool) (*subscriptionDto.UpgradePreviewResponse, error) {
	// Get current subscription
	currentSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current subscription: %w", err)
	}

	// Get new plan
	newPlan, err := uc.xenditRepo.GetSubscriptionPlan(ctx, newPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get new subscription plan: %w", err)
	}

	var newSeatPlan *domain.SeatPlan

	// If specific seat plan ID is provided, use it
	if newSeatPlanID != nil {
		seatPlan, err := uc.xenditRepo.GetSeatPlan(ctx, *newSeatPlanID)
		if err != nil {
			return nil, fmt.Errorf("failed to get specified seat plan: %w", err)
		}

		// Verify seat plan belongs to the new subscription plan
		if seatPlan.SubscriptionPlanID != newPlanID {
			return nil, fmt.Errorf("specified seat plan does not belong to the new subscription plan")
		}

		newSeatPlan = seatPlan
	} else {
		// Auto-match seat plan by employee range (existing logic)
		newSeatPlans, err := uc.xenditRepo.GetSeatPlansBySubscriptionPlan(ctx, newPlanID)
		if err != nil {
			return nil, fmt.Errorf("failed to get seat plans for new plan: %w", err)
		}

		// Find matching seat plan by employee range
		currentMinEmployees := currentSubscription.SeatPlan.MinEmployees
		currentMaxEmployees := currentSubscription.SeatPlan.MaxEmployees

		for _, seatPlan := range newSeatPlans {
			if seatPlan.MinEmployees == currentMinEmployees && seatPlan.MaxEmployees == currentMaxEmployees {
				newSeatPlan = &seatPlan
				break
			}
		}

		if newSeatPlan == nil {
			return nil, fmt.Errorf("no matching seat plan found for new subscription plan")
		}
	}

	// Calculate price difference
	var currentPrice, newPrice decimal.Decimal
	if isMonthly {
		currentPrice = currentSubscription.SeatPlan.PricePerMonth
		newPrice = newSeatPlan.PricePerMonth
	} else {
		currentPrice = currentSubscription.SeatPlan.PricePerYear
		newPrice = newSeatPlan.PricePerYear
	}

	priceDifference := newPrice.Sub(currentPrice)
	isUpgrade := priceDifference.GreaterThan(decimal.Zero)

	// Calculate proration (simplified - based on remaining days in billing cycle)
	prorationAmount := decimal.Zero
	effectiveDate := time.Now().UTC()
	nextBillingDate := effectiveDate

	// Debug logging
	fmt.Printf("DEBUG: Starting proration calculation - Status=%s, NextBillingDate=%v, PriceDifference=%s\n",
		currentSubscription.Status, currentSubscription.NextBillingDate, priceDifference.String())

	if currentSubscription.NextBillingDate != nil {
		nextBillingDate = *currentSubscription.NextBillingDate

		// Calculate remaining days
		if currentSubscription.Status == enums.StatusActive {
			remainingDays := int(nextBillingDate.Sub(effectiveDate).Hours() / 24)
			totalDays := 30 // Monthly
			if !isMonthly {
				totalDays = 365 // Yearly
			}

			if remainingDays > 0 && isUpgrade {
				// For upgrades, charge prorated amount for remaining period
				dailyDifference := priceDifference.Div(decimal.NewFromInt(int64(totalDays)))
				prorationAmount = dailyDifference.Mul(decimal.NewFromInt(int64(remainingDays)))

				// Debug logging
				fmt.Printf("DEBUG: remainingDays=%d, totalDays=%d, priceDifference=%s, dailyDifference=%s, prorationAmount=%s\n",
					remainingDays, totalDays, priceDifference.String(), dailyDifference.String(), prorationAmount.String())
			}
		}
	} else {
		// For trial users or users without billing date, set next billing based on billing frequency
		if isMonthly {
			nextBillingDate = effectiveDate.AddDate(0, 1, 0)
		} else {
			nextBillingDate = effectiveDate.AddDate(1, 0, 0)
		}

		// For trial users or users without billing date, calculate proration for full billing period
		if isUpgrade {
			// For trial users upgrading, calculate proration based on remaining time until next billing
			totalDays := 30 // Monthly
			if !isMonthly {
				totalDays = 365 // Yearly
			}

			remainingDays := int(nextBillingDate.Sub(effectiveDate).Hours() / 24)
			if remainingDays > 0 {
				dailyDifference := priceDifference.Div(decimal.NewFromInt(int64(totalDays)))
				prorationAmount = dailyDifference.Mul(decimal.NewFromInt(int64(remainingDays)))

				// Debug logging
				fmt.Printf("DEBUG: Trial user proration - remainingDays=%d, totalDays=%d, priceDifference=%s, dailyDifference=%s, prorationAmount=%s\n",
					remainingDays, totalDays, priceDifference.String(), dailyDifference.String(), prorationAmount.String())
			}
		}
	}

	return &subscriptionDto.UpgradePreviewResponse{
		CurrentPlan:     subscriptionDto.ToSubscriptionPlanResponse(&currentSubscription.SubscriptionPlan),
		NewPlan:         subscriptionDto.ToSubscriptionPlanResponse(newPlan),
		CurrentSeatPlan: subscriptionDto.ToSeatPlanResponse(&currentSubscription.SeatPlan),
		NewSeatPlan:     subscriptionDto.ToSeatPlanResponse(newSeatPlan),
		PriceDifference: priceDifference,
		ProrationAmount: func() decimal.Decimal {
			// For upgrades, ensure we always have a minimum payment amount for Midtrans (min: 1000 IDR)
			if isUpgrade {
				minAmount := decimal.NewFromInt(1000) // Minimum 1000 IDR for Midtrans

				// Start with proration amount
				finalAmount := prorationAmount

				// Ensure it meets minimum requirement
				if finalAmount.LessThan(minAmount) {
					finalAmount = minAmount
				}

				// Convert to whole number for IDR currency
				return convertToIDRWholeNumber(finalAmount)
			}
			return convertToIDRWholeNumber(prorationAmount)
		}(),
		IsUpgrade:       isUpgrade,
		EffectiveDate:   effectiveDate,
		NextBillingDate: nextBillingDate,
		RequiresPayment: isUpgrade, // Always require payment for upgrades
	}, nil
}

// createUpgradeCheckoutSession creates a checkout session for subscription upgrade
func (uc *SubscriptionUseCase) createUpgradeCheckoutSession(
	ctx context.Context,
	userID uint,
	newPlanID uint,
	sessionID string,
	preview *subscriptionDto.UpgradePreviewResponse,
	currentSubscription *domain.Subscription,
) (*subscriptionDto.CheckoutSessionResponse, *subscriptionDto.InvoiceResponse, error) {
	session := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             userID,
		SubscriptionPlanID: newPlanID,
		SeatPlanID:         preview.NewSeatPlan.ID,
		IsTrialCheckout:    false,
		Amount:             preview.ProrationAmount,
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now().UTC(),
		ExpiresAt:          func() *time.Time { t := time.Now().UTC().Add(24 * time.Hour); return &t }(),
	}

	if err := uc.xenditRepo.CreateCheckoutSession(ctx, session); err != nil {
		return nil, nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	// Get user for payment details
	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Create Midtrans Snap transaction
	orderID := fmt.Sprintf("%s%s", OrderIDPrefix, sessionID)
	description := fmt.Sprintf("HRIS Plan Upgrade - %s to %s",
		currentSubscription.SubscriptionPlan.Name,
		preview.NewPlan.Name)

	// Ensure amount meets Midtrans minimum requirement (1000 IDR)
	paymentAmount := preview.ProrationAmount
	fmt.Printf("DEBUG PLAN UPGRADE: Original preview.ProrationAmount=%s\n", preview.ProrationAmount.String())

	if paymentAmount.LessThan(decimal.NewFromInt(1000)) {
		paymentAmount = decimal.NewFromInt(1000)
		fmt.Printf("DEBUG PLAN UPGRADE: Amount too small, using minimum: %s\n", paymentAmount.String())
	}

	// Convert to whole number for IDR currency
	paymentAmount = convertToIDRWholeNumber(paymentAmount)
	fmt.Printf("DEBUG PLAN UPGRADE: Final paymentAmount after convertToIDRWholeNumber=%s\n", paymentAmount.String())

	// Debug logging
	fmt.Printf("DEBUG: Sending to Midtrans - preview.ProrationAmount=%s, paymentAmount=%s\n",
		preview.ProrationAmount.String(), paymentAmount.String())

	snapResp, err := uc.createMidtransSnapTransaction(ctx, orderID, description, paymentAmount, user.Email, sessionID, fmt.Sprintf("upgrade-%d", newPlanID), "subscription_upgrade")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create Midtrans Snap transaction: %w", err)
	}

	// Update checkout session with Midtrans info
	session.PaymentToken = &snapResp.Token
	session.PaymentURL = &snapResp.RedirectURL
	session.PaymentReference = &orderID
	session.Status = enums.CheckoutPending

	if err := uc.xenditRepo.UpdateCheckoutSession(ctx, session); err != nil {
		return nil, nil, fmt.Errorf("failed to update checkout session: %w", err)
	}

	checkoutSession := subscriptionDto.ToCheckoutSessionResponse(session)
	invoice := &subscriptionDto.InvoiceResponse{
		ID:         snapResp.Token,
		Amount:     paymentAmount, // Use the actual payment amount sent to Midtrans
		Currency:   "IDR",
		ExpiryDate: time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339),
	}

	return checkoutSession, invoice, nil
}

// createMidtransSnapTransaction creates a Midtrans Snap transaction
func (uc *SubscriptionUseCase) createMidtransSnapTransaction(
	ctx context.Context,
	orderID, description string,
	paymentAmount decimal.Decimal,
	userEmail, sessionID, itemID, category string,
) (*interfaces.MidtransSnapResponse, error) {
	fmt.Printf("DEBUG MIDTRANS: createMidtransSnapTransaction called with paymentAmount=%s\n", paymentAmount.String())

	// Convert decimal to int64 for proper JSON serialization
	amountInt := paymentAmount.IntPart()

	snapReq := interfaces.MidtransSnapRequest{
		TransactionDetails: interfaces.MidtransTransactionDetails{
			OrderID:     orderID,
			GrossAmount: amountInt, // Use int64 instead of decimal.Decimal
		},
		CustomerDetails: &interfaces.MidtransCustomerDetails{
			Email: userEmail,
		},
		ItemDetails: []interfaces.MidtransItemDetails{
			{
				ID:       itemID,
				Name:     description,
				Price:    amountInt, // Use int64 instead of decimal.Decimal
				Quantity: 1,
				Category: func() *string { s := category; return &s }(),
			},
		},
		Callbacks: &interfaces.MidtransCallbacks{
			Finish:  "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/success",
			Error:   "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/error",
			Pending: "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/pending",
		},
		Expiry: &interfaces.MidtransExpiry{
			Unit:     "hour",
			Duration: 24,
		},
		PageExpiry: &interfaces.MidtransPageExpiry{
			Duration: 24,
			Unit:     "hour",
		},
		CustomField1: &sessionID,
	}

	fmt.Printf("DEBUG MIDTRANS: Request GrossAmount=%d, ItemDetails[0].Price=%d\n",
		snapReq.TransactionDetails.GrossAmount, snapReq.ItemDetails[0].Price)

	return uc.midtransClient.CreateSnapTransaction(ctx, snapReq)
}

// applySubscriptionUpgrade applies the subscription upgrade immediately (for downgrades or free upgrades)
func (uc *SubscriptionUseCase) applySubscriptionUpgrade(
	ctx context.Context,
	userID uint,
	newPlanID uint,
	preview *subscriptionDto.UpgradePreviewResponse,
	isMonthly bool,
) (*domain.Subscription, error) {
	// Get current subscription
	currentSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current subscription: %w", err)
	}

	// Update billing dates
	if isMonthly {
		nextBilling := time.Now().UTC().AddDate(0, 1, 0)
		currentSubscription.NextBillingDate = &nextBilling
	} else {
		nextBilling := time.Now().UTC().AddDate(1, 0, 0)
		currentSubscription.NextBillingDate = &nextBilling
	}

	// Use explicit field update to fix GORM tracking issue
	err = uc.xenditRepo.UpdateSubscriptionFields(ctx, currentSubscription.ID, map[string]interface{}{
		"subscription_plan_id": newPlanID,
		"seat_plan_id":         preview.NewSeatPlan.ID,
		"next_billing_date":    currentSubscription.NextBillingDate,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update subscription: %w", err)
	}

	// Reload subscription with new relationships
	updatedSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated subscription: %w", err)
	}

	return updatedSubscription, nil
}

// UpgradeSubscriptionPlan upgrades or downgrades subscription plan
func (uc *SubscriptionUseCase) UpgradeSubscriptionPlan(ctx context.Context, userID uint, newPlanID uint, newSeatPlanID *uint, isMonthly bool) (*subscriptionDto.SubscriptionChangeResponse, error) {
	// Get preview first
	preview, err := uc.PreviewSubscriptionPlanChange(ctx, userID, newPlanID, newSeatPlanID, isMonthly)
	if err != nil {
		return nil, err
	}

	// Get current subscription
	currentSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current subscription: %w", err)
	}

	changeType := PlanDowngradeType
	if preview.IsUpgrade {
		changeType = PlanUpgradeType
	}

	// If payment is required for upgrade, create checkout session
	if preview.RequiresPayment {
		sessionID := uuid.New().String()
		checkoutSession, invoice, err := uc.createUpgradeCheckoutSession(ctx, userID, newPlanID, sessionID, preview, currentSubscription)
		if err != nil {
			return nil, err
		}

		// Return response indicating payment is required
		return &subscriptionDto.SubscriptionChangeResponse{
			Subscription:    subscriptionDto.ToSubscriptionResponse(currentSubscription),
			ChangeType:      changeType,
			PaymentRequired: true,
			PaymentAmount:   &preview.ProrationAmount,
			CheckoutSession: checkoutSession,
			Invoice:         invoice,
			EffectiveDate:   preview.EffectiveDate,
			Message:         fmt.Sprintf("Payment of %s required to complete plan upgrade", preview.ProrationAmount.String()),
		}, nil
	}

	// No payment required (downgrade or trial), apply changes immediately
	updatedSubscription, err := uc.applySubscriptionUpgrade(ctx, userID, newPlanID, preview, isMonthly)
	if err != nil {
		return nil, err
	}

	message := fmt.Sprintf("Successfully %s to %s plan",
		func() string {
			if preview.IsUpgrade {
				return "upgraded"
			}
			return "downgraded"
		}(),
		preview.NewPlan.Name)

	return &subscriptionDto.SubscriptionChangeResponse{
		Subscription:    subscriptionDto.ToSubscriptionResponse(updatedSubscription),
		ChangeType:      changeType,
		PaymentRequired: false,
		EffectiveDate:   preview.EffectiveDate,
		Message:         message,
	}, nil
}

// PreviewSeatPlanChange previews the changes when changing seat plan
func (uc *SubscriptionUseCase) PreviewSeatPlanChange(ctx context.Context, userID uint, newSeatPlanID uint, isMonthly bool) (*subscriptionDto.UpgradePreviewResponse, error) {
	// Get current subscription
	currentSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current subscription: %w", err)
	}

	// Get new seat plan
	newSeatPlan, err := uc.xenditRepo.GetSeatPlan(ctx, newSeatPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get new seat plan: %w", err)
	}

	// Verify seat plan belongs to current subscription plan
	if newSeatPlan.SubscriptionPlanID != currentSubscription.SubscriptionPlanID {
		return nil, fmt.Errorf("seat plan does not belong to current subscription plan")
	}

	// Calculate price difference
	var currentPrice, newPrice decimal.Decimal
	if isMonthly {
		currentPrice = currentSubscription.SeatPlan.PricePerMonth
		newPrice = newSeatPlan.PricePerMonth
	} else {
		currentPrice = currentSubscription.SeatPlan.PricePerYear
		newPrice = newSeatPlan.PricePerYear
	}

	priceDifference := newPrice.Sub(currentPrice)
	isUpgrade := priceDifference.GreaterThan(decimal.Zero)

	// Calculate proration
	prorationAmount := decimal.Zero
	effectiveDate := time.Now().UTC()
	nextBillingDate := effectiveDate

	if currentSubscription.NextBillingDate != nil {
		nextBillingDate = *currentSubscription.NextBillingDate

		if currentSubscription.Status == enums.StatusActive {
			remainingDays := int(nextBillingDate.Sub(effectiveDate).Hours() / 24)
			totalDays := 30 // Monthly
			if !isMonthly {
				totalDays = 365 // Yearly
			}

			if remainingDays > 0 && isUpgrade {
				dailyDifference := priceDifference.Div(decimal.NewFromInt(int64(totalDays)))
				prorationAmount = dailyDifference.Mul(decimal.NewFromInt(int64(remainingDays)))
			}
		}
	} else {
		if isMonthly {
			nextBillingDate = effectiveDate.AddDate(0, 1, 0)
		} else {
			nextBillingDate = effectiveDate.AddDate(1, 0, 0)
		}

		// For trial users or users without billing date, calculate proration for full billing period
		if isUpgrade {
			// For trial users upgrading, calculate proration based on remaining time until next billing
			totalDays := 30 // Monthly
			if !isMonthly {
				totalDays = 365 // Yearly
			}

			remainingDays := int(nextBillingDate.Sub(effectiveDate).Hours() / 24)
			if remainingDays > 0 {
				dailyDifference := priceDifference.Div(decimal.NewFromInt(int64(totalDays)))
				prorationAmount = dailyDifference.Mul(decimal.NewFromInt(int64(remainingDays)))

				// Debug logging
				fmt.Printf("DEBUG: Trial user proration - remainingDays=%d, totalDays=%d, priceDifference=%s, dailyDifference=%s, prorationAmount=%s\n",
					remainingDays, totalDays, priceDifference.String(), dailyDifference.String(), prorationAmount.String())
			}
		}
	}

	return &subscriptionDto.UpgradePreviewResponse{
		CurrentPlan:     subscriptionDto.ToSubscriptionPlanResponse(&currentSubscription.SubscriptionPlan),
		NewPlan:         subscriptionDto.ToSubscriptionPlanResponse(&currentSubscription.SubscriptionPlan), // Same plan
		CurrentSeatPlan: subscriptionDto.ToSeatPlanResponse(&currentSubscription.SeatPlan),
		NewSeatPlan:     subscriptionDto.ToSeatPlanResponse(newSeatPlan),
		PriceDifference: priceDifference,
		ProrationAmount: func() decimal.Decimal {
			// For upgrades, ensure we always have a minimum payment amount for Midtrans (min: 1000 IDR)
			if isUpgrade {
				minAmount := decimal.NewFromInt(1000) // Minimum 1000 IDR for Midtrans

				// Start with proration amount
				finalAmount := prorationAmount

				// Ensure it meets minimum requirement
				if finalAmount.LessThan(minAmount) {
					finalAmount = minAmount
				}

				// Convert to whole number for IDR currency
				return convertToIDRWholeNumber(finalAmount)
			}
			return convertToIDRWholeNumber(prorationAmount)
		}(),
		IsUpgrade:       isUpgrade,
		EffectiveDate:   effectiveDate,
		NextBillingDate: nextBillingDate,
		RequiresPayment: isUpgrade, // Always require payment for upgrades
	}, nil
}

// ChangeSeatPlan changes the seat plan within the same subscription plan
func (uc *SubscriptionUseCase) ChangeSeatPlan(ctx context.Context, userID uint, newSeatPlanID uint, isMonthly bool) (*subscriptionDto.SubscriptionChangeResponse, error) {
	// Get preview first
	preview, err := uc.PreviewSeatPlanChange(ctx, userID, newSeatPlanID, isMonthly)
	if err != nil {
		return nil, err
	}

	// Get current subscription
	currentSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current subscription: %w", err)
	}

	changeType := SeatDowngradeType
	if preview.IsUpgrade {
		changeType = SeatUpgradeType
	}

	// Check if current employee count fits in new seat plan
	if currentSubscription.CurrentEmployeeCount > preview.NewSeatPlan.MaxEmployees {
		return nil, fmt.Errorf("cannot downgrade: current employee count (%d) exceeds new seat plan limit (%d)",
			currentSubscription.CurrentEmployeeCount, preview.NewSeatPlan.MaxEmployees)
	}

	// If payment is required for upgrade
	var checkoutSession *subscriptionDto.CheckoutSessionResponse
	var invoice *subscriptionDto.InvoiceResponse

	if preview.RequiresPayment {
		sessionID := uuid.New().String()
		session := &domain.CheckoutSession{
			SessionID:          sessionID,
			UserID:             userID,
			SubscriptionPlanID: currentSubscription.SubscriptionPlanID,
			SeatPlanID:         newSeatPlanID,
			IsTrialCheckout:    false,
			Amount:             preview.ProrationAmount,
			Currency:           "IDR",
			Status:             enums.CheckoutInitiated,
			InitiatedAt:        time.Now().UTC(),
			ExpiresAt:          func() *time.Time { t := time.Now().UTC().Add(24 * time.Hour); return &t }(),
		}

		if err := uc.xenditRepo.CreateCheckoutSession(ctx, session); err != nil {
			return nil, fmt.Errorf("failed to create checkout session: %w", err)
		}

		// Get user for payment details
		user, err := uc.authRepo.GetUserByID(ctx, userID)
		if err != nil {
			return nil, fmt.Errorf("failed to get user: %w", err)
		}

		// Create Midtrans Snap transaction instead of Xendit invoice
		orderID := fmt.Sprintf("%s%s", OrderIDPrefix, sessionID)
		description := fmt.Sprintf("HRIS Seat Upgrade - %d-%d to %d-%d employees",
			preview.CurrentSeatPlan.MinEmployees, preview.CurrentSeatPlan.MaxEmployees,
			preview.NewSeatPlan.MinEmployees, preview.NewSeatPlan.MaxEmployees)

		// Ensure amount meets Midtrans minimum requirement (1000 IDR)
		paymentAmount := preview.ProrationAmount
		if paymentAmount.LessThan(decimal.NewFromInt(1000)) {
			paymentAmount = decimal.NewFromInt(1000)
		}

		// Convert to whole number for IDR currency (Midtrans requirement)
		paymentAmount = convertToIDRWholeNumber(paymentAmount)

		snapReq := interfaces.MidtransSnapRequest{
			TransactionDetails: interfaces.MidtransTransactionDetails{
				OrderID:     orderID,
				GrossAmount: paymentAmount.IntPart(), // Convert to int64
			},
			CustomerDetails: &interfaces.MidtransCustomerDetails{
				Email: user.Email,
			},
			ItemDetails: []interfaces.MidtransItemDetails{
				{
					ID:       fmt.Sprintf("seat-%d", newSeatPlanID),
					Name:     description,
					Price:    paymentAmount.IntPart(), // Convert to int64
					Quantity: 1,
					Category: func() *string { s := SeatUpgradeType; return &s }(),
				},
			},
			Callbacks: &interfaces.MidtransCallbacks{
				Finish:  "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/success",
				Error:   "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/error",
				Pending: "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/pending",
			},
			Expiry: &interfaces.MidtransExpiry{
				Unit:     "hour",
				Duration: 24,
			},
			PageExpiry: &interfaces.MidtransPageExpiry{
				Duration: 24,
				Unit:     "hour",
			},
			CustomField1: &sessionID, // Store session ID for reference
		}

		snapResp, err := uc.midtransClient.CreateSnapTransaction(ctx, snapReq)
		if err != nil {
			return nil, fmt.Errorf("failed to create Midtrans Snap transaction: %w", err)
		}

		// Update checkout session with Midtrans info
		session.PaymentToken = &snapResp.Token
		session.PaymentURL = &snapResp.RedirectURL
		session.PaymentReference = &orderID
		session.Status = enums.CheckoutPending

		if err := uc.xenditRepo.UpdateCheckoutSession(ctx, session); err != nil {
			return nil, fmt.Errorf("failed to update checkout session: %w", err)
		}

		checkoutSession = subscriptionDto.ToCheckoutSessionResponse(session)
		invoice = &subscriptionDto.InvoiceResponse{
			ID:         snapResp.Token,
			Amount:     paymentAmount,
			Currency:   "IDR",
			ExpiryDate: time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339),
		}

		return &subscriptionDto.SubscriptionChangeResponse{
			Subscription:    subscriptionDto.ToSubscriptionResponse(currentSubscription),
			ChangeType:      changeType,
			PaymentRequired: true,
			PaymentAmount:   &preview.ProrationAmount,
			CheckoutSession: checkoutSession,
			Invoice:         invoice,
			EffectiveDate:   preview.EffectiveDate,
			Message:         fmt.Sprintf("Payment of %s required to complete seat upgrade", preview.ProrationAmount.String()),
		}, nil
	}

	// No payment required (downgrade or trial), apply changes immediately
	currentSubscription.SeatPlanID = newSeatPlanID

	if err := uc.xenditRepo.UpdateSubscription(ctx, currentSubscription); err != nil {
		return nil, fmt.Errorf("failed to update subscription: %w", err)
	}

	// Reload subscription with new relationships
	updatedSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated subscription: %w", err)
	}
	message := fmt.Sprintf("Successfully changed seat plan to %d-%d employees",
		preview.NewSeatPlan.MinEmployees, preview.NewSeatPlan.MaxEmployees)

	return &subscriptionDto.SubscriptionChangeResponse{
		Subscription:    subscriptionDto.ToSubscriptionResponse(updatedSubscription),
		ChangeType:      changeType,
		PaymentRequired: false,
		EffectiveDate:   preview.EffectiveDate,
		Message:         message,
	}, nil
}

// ConvertTrialToPaid converts trial subscription to paid with optional plan/seat changes
func (uc *SubscriptionUseCase) ConvertTrialToPaid(ctx context.Context, userID uint, newPlanID *uint, newSeatPlanID *uint, isMonthly bool) (*subscriptionDto.SubscriptionChangeResponse, error) {
	// Get current subscription
	currentSubscription, err := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get current subscription: %w", err)
	}

	if currentSubscription.Status != enums.StatusTrial {
		return nil, fmt.Errorf("subscription is not in trial status")
	}

	// Use current plan and seat if not specified
	targetPlanID := currentSubscription.SubscriptionPlanID
	targetSeatPlanID := currentSubscription.SeatPlanID

	if newPlanID != nil {
		targetPlanID = *newPlanID
	}

	if newSeatPlanID != nil {
		targetSeatPlanID = *newSeatPlanID
	}

	// Get target seat plan
	targetSeatPlan, err := uc.xenditRepo.GetSeatPlan(ctx, targetSeatPlanID)
	if err != nil {
		return nil, fmt.Errorf("failed to get target seat plan: %w", err)
	}

	// Calculate payment amount
	var amount decimal.Decimal
	if isMonthly {
		amount = targetSeatPlan.PricePerMonth
	} else {
		amount = targetSeatPlan.PricePerYear
	}

	// Create checkout session for trial conversion
	sessionID := uuid.New().String()
	session := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             userID,
		SubscriptionPlanID: targetPlanID,
		SeatPlanID:         targetSeatPlanID,
		IsTrialCheckout:    false,
		Amount:             amount,
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now().UTC(),
		ExpiresAt:          func() *time.Time { t := time.Now().UTC().Add(24 * time.Hour); return &t }(),
	}

	if err := uc.xenditRepo.CreateCheckoutSession(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

	// Get user for Midtrans customer details
	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Create Midtrans Snap transaction instead of Xendit invoice
	orderID := fmt.Sprintf("%s%s", OrderIDPrefix, sessionID)
	description := fmt.Sprintf("HRIS Trial Conversion - %s Plan (%d-%d employees)",
		targetSeatPlan.SubscriptionPlan.Name,
		targetSeatPlan.MinEmployees,
		targetSeatPlan.MaxEmployees)

	// Ensure amount meets Midtrans minimum requirement (1000 IDR)
	paymentAmount := amount
	if paymentAmount.LessThan(decimal.NewFromInt(1000)) {
		paymentAmount = decimal.NewFromInt(1000)
	}

	// Convert to whole number for IDR currency (Midtrans requirement)
	paymentAmount = convertToIDRWholeNumber(paymentAmount)

	snapReq := interfaces.MidtransSnapRequest{
		TransactionDetails: interfaces.MidtransTransactionDetails{
			OrderID:     orderID,
			GrossAmount: paymentAmount.IntPart(), // Convert to int64
		},
		CustomerDetails: &interfaces.MidtransCustomerDetails{
			Email: user.Email,
		},
		ItemDetails: []interfaces.MidtransItemDetails{
			{
				ID:       fmt.Sprintf("trial-conversion-%d", targetSeatPlanID),
				Name:     description,
				Price:    paymentAmount.IntPart(), // Convert to int64
				Quantity: 1,
				Category: func() *string { s := "trial_conversion"; return &s }(),
			},
		},
		Callbacks: &interfaces.MidtransCallbacks{
			Finish:  "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/success",
			Error:   "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/error",
			Pending: "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io/payment/pending",
		},
		Expiry: &interfaces.MidtransExpiry{
			Unit:     "hour",
			Duration: 24,
		},
		PageExpiry: &interfaces.MidtransPageExpiry{
			Duration: 24,
			Unit:     "hour",
		},
		CustomField1: &sessionID, // Store session ID for reference
	}

	snapResp, err := uc.midtransClient.CreateSnapTransaction(ctx, snapReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create Midtrans Snap transaction: %w", err)
	}

	// Update checkout session with Midtrans info
	session.PaymentToken = &snapResp.Token
	session.PaymentURL = &snapResp.RedirectURL
	session.PaymentReference = &orderID
	session.Status = enums.CheckoutPending

	if err := uc.xenditRepo.UpdateCheckoutSession(ctx, session); err != nil {
		return nil, fmt.Errorf("failed to update checkout session: %w", err)
	}

	return &subscriptionDto.SubscriptionChangeResponse{
		Subscription:    subscriptionDto.ToSubscriptionResponse(currentSubscription),
		ChangeType:      "trial_conversion",
		PaymentRequired: true,
		PaymentAmount:   &amount,
		CheckoutSession: subscriptionDto.ToCheckoutSessionResponse(session),
		Invoice: &subscriptionDto.InvoiceResponse{
			ID:         snapResp.Token,
			Amount:     amount,
			Currency:   "IDR",
			ExpiryDate: time.Now().UTC().Add(24 * time.Hour).Format(time.RFC3339),
		},
		EffectiveDate: time.Now().UTC(),
		Message:       fmt.Sprintf("Payment of %s required to convert trial to paid subscription", amount.String()),
	}, nil
}

// VerifyPaymentAndActivateSubscription verifies payment status and ensures subscription is activated
func (uc *SubscriptionUseCase) VerifyPaymentAndActivateSubscription(
	ctx context.Context,
	userID uint,
	transactionID, orderID string,
	planID, seatPlanID uint,
	isMonthly bool,
) (*subscriptionDto.PaymentVerificationResponse, error) {
	// Look for payment transaction by transaction ID or order ID
	var paymentTransaction *domain.PaymentTransaction
	var err error

	// Try to find by transaction ID first
	if transactionID != "" {
		// Search for payment transaction by transaction ID
		// Note: You'll need to implement this method in your repository
		paymentTransaction, err = uc.xenditRepo.GetPaymentTransactionByTransactionID(ctx, transactionID)
		if err != nil {
			// If not found by transaction ID, try order ID
			if orderID != "" {
				paymentTransaction, err = uc.xenditRepo.GetPaymentTransactionByOrderID(ctx, orderID)
			}
		}
	} else if orderID != "" {
		paymentTransaction, err = uc.xenditRepo.GetPaymentTransactionByOrderID(ctx, orderID)
	}

	// Check current subscription status
	currentSubscription, subErr := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)

	// If payment transaction found and subscription exists, check if it's already activated
	if paymentTransaction != nil && subErr == nil {
		if paymentTransaction.Status == enums.PaymentPaid && currentSubscription.Status == enums.StatusActive {
			return &subscriptionDto.PaymentVerificationResponse{
				SubscriptionActivated: true,
				PaymentStatus:         "completed",
				Subscription:          subscriptionDto.ToSubscriptionResponse(currentSubscription),
				Message:               "Payment completed and subscription is active",
			}, nil
		}
	}

	// If payment not found or subscription not activated, try to find and process checkout session
	// This handles cases where webhook might be delayed
	if orderID != "" {
		// Extract session ID from order ID if it follows our pattern
		var sessionID string
		if strings.HasPrefix(orderID, OrderIDPrefix) {
			sessionID = orderID[len(OrderIDPrefix):] // Remove prefix
		} else if strings.HasPrefix(orderID, "checkout_") {
			sessionID = orderID[9:] // Remove "checkout_" prefix
		}

		if sessionID != "" {
			// Try to get and process checkout session
			checkoutSession, sessionErr := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
			if sessionErr == nil {
				// If session exists but not completed, and we have payment confirmation,
				// try to manually activate the subscription
				if checkoutSession.Status != enums.CheckoutCompleted && transactionID != "" {
					// Try to manually activate subscription (simulate webhook processing)
					if err := uc.manuallyActivateSubscription(ctx, checkoutSession, transactionID, orderID); err == nil {
						// Reload subscription after activation
						activatedSubscription, _ := uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
						if activatedSubscription != nil && activatedSubscription.Status == enums.StatusActive {
							return &subscriptionDto.PaymentVerificationResponse{
								SubscriptionActivated: true,
								PaymentStatus:         "completed",
								Subscription:          subscriptionDto.ToSubscriptionResponse(activatedSubscription),
								Message:               "Payment verified and subscription activated",
							}, nil
						}
					}
				}
			}
		}
	}

	// Check if subscription exists but payment status is unclear
	if subErr == nil {
		switch currentSubscription.Status {
		case enums.StatusActive:
			return &subscriptionDto.PaymentVerificationResponse{
				SubscriptionActivated: true,
				PaymentStatus:         "completed",
				Subscription:          subscriptionDto.ToSubscriptionResponse(currentSubscription),
				Message:               "Subscription is already active",
			}, nil
		case enums.StatusTrial:
			return &subscriptionDto.PaymentVerificationResponse{
				SubscriptionActivated: false,
				PaymentStatus:         "pending",
				Subscription:          subscriptionDto.ToSubscriptionResponse(currentSubscription),
				Message:               "Payment is being processed, subscription will be activated soon",
			}, nil
		}
	}

	// If we can't find payment or subscription, return appropriate response
	if err != nil && subErr != nil {
		return &subscriptionDto.PaymentVerificationResponse{
			SubscriptionActivated: false,
			PaymentStatus:         "not_found",
			Message:               "Payment not found, please contact support if you believe this is an error",
		}, nil
	}

	// Default case - payment found but subscription not activated
	return &subscriptionDto.PaymentVerificationResponse{
		SubscriptionActivated: false,
		PaymentStatus:         "pending",
		Message:               "Payment received, subscription activation in progress",
	}, nil
}

// manuallyActivateSubscription tries to manually activate subscription when webhook might be delayed
func (uc *SubscriptionUseCase) manuallyActivateSubscription(ctx context.Context, checkoutSession *domain.CheckoutSession, transactionID, orderID string) error {
	// Create a mock notification to simulate webhook processing
	mockNotification := map[string]interface{}{
		"transaction_id":     transactionID,
		"order_id":           orderID,
		"transaction_status": "settlement",
		"payment_type":       "unknown",
		"transaction_time":   time.Now().Format("2006-01-02 15:04:05"),
		"gross_amount":       checkoutSession.Amount.String(),
		"status_code":        "200",
	}

	// Use existing webhook processing logic
	if strings.HasPrefix(orderID, OrderIDPrefix) {
		// This is a Midtrans-style order ID
		return uc.ProcessMidtransWebhook(ctx, mockNotification)
	}

	// Default processing (could be Xendit or other)
	return fmt.Errorf("unable to determine payment provider for manual activation")
}

func (uc *SubscriptionUseCase) CreateAutomaticTrialForPremiumUser(ctx context.Context, userID uint) error {
	// Check if user is eligible for trial
	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if !user.IsEligibleForTrial() {
		return fmt.Errorf("user is not eligible for trial")
	}

	// Check if user already has a subscription
	_, err = uc.xenditRepo.GetSubscriptionByAdminUserID(ctx, userID)
	if err == nil {
		// User already has subscription, no need to create trial
		return nil
	}

	// Get all subscription plans and find premium plan
	plans, err := uc.xenditRepo.GetSubscriptionPlans(ctx)
	if err != nil {
		return fmt.Errorf("failed to get subscription plans: %w", err)
	}

	var premiumPlan *domain.SubscriptionPlan
	for _, plan := range plans {
		if plan.PlanType == enums.PlanPremium {
			premiumPlan = &plan
			break
		}
	}

	if premiumPlan == nil {
		return fmt.Errorf("premium plan not found")
	}

	// Get default seat plan for premium (1-50 employees tier)
	seatPlans, err := uc.xenditRepo.GetSeatPlansBySubscriptionPlan(ctx, premiumPlan.ID)
	if err != nil || len(seatPlans) == 0 {
		return fmt.Errorf("failed to get premium seat plans: %w", err)
	}
	// Find the smallest tier (1-50 employees) as default
	var defaultSeatPlan *domain.SeatPlan
	for _, plan := range seatPlans {
		if plan.SizeTierID == "pre-tier1-50" { // Premium tier for 1-50 employees
			defaultSeatPlan = &plan
			break
		}
	}

	if defaultSeatPlan == nil {
		// Fallback to first available seat plan if specific tier not found
		defaultSeatPlan = &seatPlans[0]
	}

	// Create subscription with trial status
	subscription := &domain.Subscription{
		AdminUserID:          userID,
		SubscriptionPlanID:   premiumPlan.ID,
		SeatPlanID:           defaultSeatPlan.ID,
		Status:               enums.StatusTrial,
		StartDate:            time.Now().UTC(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 1, // The admin user counts as first employee
	}

	// Start trial (sets trial dates and other fields)
	subscription.StartTrial()

	// Create subscription in database
	if err := uc.xenditRepo.CreateSubscription(ctx, subscription); err != nil {
		return fmt.Errorf("failed to create trial subscription: %w", err)
	}

	// Create basic billing info with user's information
	billingInfo := &domain.CustomerBillingInfo{
		SubscriptionID:      subscription.ID,
		CompanyName:         fmt.Sprintf("%s Company", user.Email), // Default company name
		CompanyAddress:      "Address not provided",                // Default address
		CompanyEmail:        user.Email,
		BillingContactName:  user.Email,
		BillingContactEmail: user.Email,
	}

	if err := uc.xenditRepo.CreateCustomerBillingInfo(ctx, billingInfo); err != nil {
		return fmt.Errorf("failed to create billing info: %w", err)
	}

	// Create trial activity record
	trialActivity := &domain.TrialActivity{
		SubscriptionID: subscription.ID,
		UserID:         userID,
		EmployeesAdded: 1, // Admin user is first employee
		FeaturesUsed:   "[]",
	}

	if err := uc.xenditRepo.CreateTrialActivity(ctx, trialActivity); err != nil {
		return fmt.Errorf("failed to create trial activity: %w", err)
	}

	// Mark user as having used trial
	user.HasUsedTrial = true
	if err := uc.authRepo.UpdateUser(ctx, user); err != nil {
		return fmt.Errorf("failed to update user trial status: %w", err)
	}

	return nil
}
