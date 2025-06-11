package subscription

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	subscriptionDto "github.com/SukaMajuu/hris/apps/backend/domain/dto/subscription"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/tripay"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type SubscriptionUseCase struct {
	xenditRepo   interfaces.PaymentRepository
	xenditClient interfaces.XenditClient
	employeeRepo interfaces.EmployeeRepository
	authRepo     interfaces.AuthRepository
}

func NewSubscriptionUseCase(
	xenditRepo interfaces.PaymentRepository,
	xenditClient interfaces.XenditClient,
	employeeRepo interfaces.EmployeeRepository,
	authRepo interfaces.AuthRepository,
) *SubscriptionUseCase {
	return &SubscriptionUseCase{
		xenditRepo:   xenditRepo,
		xenditClient: xenditClient,
		employeeRepo: employeeRepo,
		authRepo:     authRepo,
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

	externalID := fmt.Sprintf("checkout_%s", sessionID)
	description := fmt.Sprintf("HRIS %s Plan - %s (%d-%d employees)",
		seatPlan.SubscriptionPlan.Name,
		func() string {
			if isMonthly {
				return "Monthly"
			}
			return "Yearly"
		}(),
		seatPlan.MinEmployees,
		seatPlan.MaxEmployees)

	invoiceReq := interfaces.CreateInvoiceRequest{
		ExternalID:      externalID,
		PayerEmail:      "",
		Description:     description,
		Amount:          amount,
		Currency:        "IDR",
		InvoiceDuration: 24 * 60 * 60,
		PaymentMethods:  []string{"BANK_TRANSFER", "CREDIT_CARD", "EWALLET"},
		Items: []interfaces.InvoiceItem{
			{
				Name:     description,
				Quantity: 1,
				Price:    amount,
				Category: "subscription",
			},
		},
	}

	invoice, err := uc.xenditClient.CreateInvoice(ctx, invoiceReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create Xendit invoice: %w", err)
	}

	checkoutSession.SetPaymentInfo(invoice.ID, invoice.InvoiceURL, externalID)
	if err := uc.xenditRepo.UpdateCheckoutSession(ctx, checkoutSession); err != nil {
		return nil, fmt.Errorf("failed to update checkout session: %w", err)
	}

	return &subscriptionDto.InitiatePaidCheckoutResponse{
		CheckoutSession: subscriptionDto.ToCheckoutSessionResponse(checkoutSession),
		Invoice: &subscriptionDto.InvoiceResponse{
			ID:         invoice.ID,
			InvoiceURL: invoice.InvoiceURL,
			Amount:     invoice.Amount,
			Currency:   invoice.Currency,
			ExpiryDate: invoice.ExpiryDate,
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

	sessionID := externalID[9:]
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

func (uc *SubscriptionUseCase) processInvoiceExpiredWebhook(ctx context.Context, data map[string]interface{}) error {
	externalID, ok := data["external_id"].(string)
	if !ok {
		return fmt.Errorf("missing external ID")
	}

	sessionID := externalID[9:]
	session, err := uc.xenditRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	session.Status = enums.CheckoutExpired
	return uc.xenditRepo.UpdateCheckoutSession(ctx, session)
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
	// Extract required fields from notification
	orderID, ok := notification["order_id"].(string)
	if !ok {
		return fmt.Errorf("missing order_id")
	}

	transactionStatus, ok := notification["transaction_status"].(string)
	if !ok {
		return fmt.Errorf("missing transaction_status")
	}

	fmt.Printf("ProcessMidtransWebhook: Processing order %s with status %s\n", orderID, transactionStatus)

	// Extract session ID from order ID (format: HRIS-{sessionID})
	if len(orderID) < 6 || orderID[:5] != "HRIS-" {
		return fmt.Errorf("invalid order ID format: %s", orderID)
	}
	sessionID := orderID[5:] // Remove "HRIS-" prefix

	fmt.Printf("ProcessMidtransWebhook: Extracted session ID: %s\n", sessionID)

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

		fmt.Printf("ProcessMidtransWebhook: Subscription activated successfully, SubscriptionID=%d\n",
			*checkoutSession.SubscriptionID)

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
		OrderID:         fmt.Sprintf("HRIS-%s", session.SessionID),
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
		fmt.Printf("activateMidtransSubscription: No existing subscription found, creating new subscription\n")

		// No existing subscription found - this is a new paid subscription
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

	fmt.Printf("activateMidtransSubscription: Found existing subscription ID=%d, Status=%s\n",
		subscription.ID, subscription.Status)

	// Existing subscription found - convert from trial if applicable
	if subscription.Status == enums.StatusTrial {
		fmt.Printf("activateMidtransSubscription: Converting trial subscription to paid\n")

		subscription.ConvertFromTrialWithCheckoutSession(checkoutSession.Amount)
		if err := uc.xenditRepo.UpdateSubscription(ctx, subscription); err != nil {
			fmt.Printf("activateMidtransSubscription: Failed to update subscription: %v\n", err)
			return fmt.Errorf("failed to update subscription: %w", err)
		}

		fmt.Printf("activateMidtransSubscription: Trial converted to paid subscription\n")

		// Update trial activity
		trialActivity, err := uc.xenditRepo.GetTrialActivityBySubscription(ctx, subscription.ID)
		if err == nil {
			trialActivity.MarkAsConverted()
			_ = uc.xenditRepo.UpdateTrialActivity(ctx, trialActivity)
			fmt.Printf("activateMidtransSubscription: Updated trial activity\n")
		}

		// Update checkout session with subscription ID
		checkoutSession.SubscriptionID = &subscription.ID
		fmt.Printf("activateMidtransSubscription: Updated checkout session with existing SubscriptionID=%d\n", subscription.ID)
	} else {
		fmt.Printf("activateMidtransSubscription: Existing subscription is not trial (Status=%s), skipping conversion\n", subscription.Status)
		checkoutSession.SubscriptionID = &subscription.ID
	}

	return nil
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
