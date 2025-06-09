package subscription

import (
	"context"
	"fmt"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/dto/subscription"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type MidtransSubscriptionUseCase struct {
	paymentRepo    interfaces.XenditRepository // Reuse existing repository
	midtransClient interfaces.MidtransClient
	employeeRepo   interfaces.EmployeeRepository
	authRepo       interfaces.AuthRepository
	config         *config.Config
}

func NewMidtransSubscriptionUseCase(
	paymentRepo interfaces.XenditRepository,
	midtransClient interfaces.MidtransClient,
	employeeRepo interfaces.EmployeeRepository,
	authRepo interfaces.AuthRepository,
	cfg *config.Config,
) *MidtransSubscriptionUseCase {
	return &MidtransSubscriptionUseCase{
		paymentRepo:    paymentRepo,
		midtransClient: midtransClient,
		employeeRepo:   employeeRepo,
		authRepo:       authRepo,
		config:         cfg,
	}
}

func (uc *MidtransSubscriptionUseCase) InitiatePaidCheckout(ctx context.Context, userID, subscriptionPlanID, seatPlanID uint, isMonthly bool) (*subscription.InitiatePaidCheckoutResponse, error) {
	seatPlan, err := uc.paymentRepo.GetSeatPlan(ctx, seatPlanID)
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
	orderID := fmt.Sprintf("HRIS-%s", sessionID)

	checkoutSession := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             userID,
		SubscriptionPlanID: subscriptionPlanID,
		SeatPlanID:         seatPlanID,
		IsTrialCheckout:    false,
		Amount:             amount,
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now(),
		ExpiresAt:          func() *time.Time { t := time.Now().Add(24 * time.Hour); return &t }(),
	}

	if err := uc.paymentRepo.CreateCheckoutSession(ctx, checkoutSession); err != nil {
		return nil, fmt.Errorf("failed to create checkout session: %w", err)
	}

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

	// Get user info for customer details
	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Create Midtrans Snap transaction request
	snapReq := interfaces.MidtransSnapRequest{
		TransactionDetails: interfaces.MidtransTransactionDetails{
			OrderID:     orderID,
			GrossAmount: amount,
		},
		CustomerDetails: &interfaces.MidtransCustomerDetails{
			Email: user.Email,
		},
		ItemDetails: []interfaces.MidtransItemDetails{
			{
				ID:       fmt.Sprintf("HRIS-%d", seatPlanID),
				Name:     description,
				Price:    amount,
				Quantity: 1,
				Category: func() *string { s := "Subscription"; return &s }(),
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
		CustomField1: &sessionID, // Store session ID for reference
	}

	snapResp, err := uc.midtransClient.CreateSnapTransaction(ctx, snapReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create Midtrans Snap transaction: %w", err)
	}

	// Update checkout session with Midtrans info
	checkoutSession.XenditInvoiceID = &snapResp.Token
	checkoutSession.XenditInvoiceURL = &snapResp.RedirectURL
	checkoutSession.XenditExternalID = &orderID
	checkoutSession.Status = enums.CheckoutPending

	if err := uc.paymentRepo.UpdateCheckoutSession(ctx, checkoutSession); err != nil {
		return nil, fmt.Errorf("failed to update checkout session: %w", err)
	}

	return &subscription.InitiatePaidCheckoutResponse{
		CheckoutSession: subscription.ToCheckoutSessionResponse(checkoutSession),
		Invoice: &subscription.InvoiceResponse{
			ID:         snapResp.Token,
			InvoiceURL: snapResp.RedirectURL,
			Amount:     amount,
			Currency:   "IDR",
			ExpiryDate: time.Now().Add(24 * time.Hour).Format(time.RFC3339),
		},
	}, nil
}

func (uc *MidtransSubscriptionUseCase) ProcessNotification(ctx context.Context, notification interfaces.MidtransNotification) error {
	// Find checkout session by order ID
	// Extract session ID from order ID (format: HRIS-{sessionID})
	sessionID := notification.OrderID[5:] // Remove "HRIS-" prefix

	checkoutSession, err := uc.paymentRepo.GetCheckoutSession(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("failed to get checkout session: %w", err)
	}

	// Update checkout session status based on Midtrans transaction status
	switch notification.TransactionStatus {
	case "capture", "settlement":
		// Payment successful
		checkoutSession.Status = enums.CheckoutCompleted
		checkoutSession.CompletedAt = func() *time.Time { t := time.Now(); return &t }()

		// Activate subscription
		if err := uc.activateSubscription(ctx, checkoutSession); err != nil {
			return fmt.Errorf("failed to activate subscription: %w", err)
		}

	case "pending":
		// Payment pending (e.g., bank transfer waiting)
		checkoutSession.Status = enums.CheckoutPending

	case "deny", "cancel", "expire":
		// Payment failed or cancelled
		checkoutSession.MarkAsFailed()

	default:
		return fmt.Errorf("unknown transaction status: %s", notification.TransactionStatus)
	}

	// Update checkout session
	if err := uc.paymentRepo.UpdateCheckoutSession(ctx, checkoutSession); err != nil {
		return fmt.Errorf("failed to update checkout session: %w", err)
	}

	return nil
}

func (uc *MidtransSubscriptionUseCase) activateSubscription(ctx context.Context, checkoutSession *domain.CheckoutSession) error {
	seatPlan, err := uc.paymentRepo.GetSeatPlan(ctx, checkoutSession.SeatPlanID)
	if err != nil {
		return fmt.Errorf("failed to get seat plan: %w", err)
	}

	// Calculate subscription period
	var startDate, endDate time.Time
	startDate = time.Now()

	// Determine if it's monthly or yearly based on amount
	if checkoutSession.Amount.Cmp(seatPlan.PricePerMonth) == 0 {
		// Monthly subscription
		endDate = startDate.AddDate(0, 1, 0)
	} else {
		// Yearly subscription
		endDate = startDate.AddDate(1, 0, 0)
	}

	// Create or update user subscription
	subscription := &domain.Subscription{
		AdminUserID:          checkoutSession.UserID,
		SubscriptionPlanID:   checkoutSession.SubscriptionPlanID,
		SeatPlanID:           checkoutSession.SeatPlanID,
		Status:               enums.StatusActive,
		StartDate:            startDate,
		EndDate:              &endDate,
		IsAutoRenew:          true,
		CurrentEmployeeCount: 0,
	}

	return uc.paymentRepo.CreateSubscription(ctx, subscription)
}
