package subscription

// import (
// 	"context"
// 	"fmt"
// 	"time"

// 	"github.com/SukaMajuu/hris/apps/backend/domain"
// 	"github.com/SukaMajuu/hris/apps/backend/domain/dto/subscription"
// 	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
// 	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
// 	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
// 	"github.com/google/uuid"
// 	"github.com/shopspring/decimal"
// )

// type TripaySubscriptionUseCase struct {
// 	paymentRepo  interfaces.XenditRepository // Reuse existing repository
// 	tripayClient interfaces.TripayClient
// 	employeeRepo interfaces.EmployeeRepository
// 	authRepo     interfaces.AuthRepository
// 	config       *config.Config
// }

// func NewTripaySubscriptionUseCase(
// 	paymentRepo interfaces.XenditRepository,
// 	tripayClient interfaces.TripayClient,
// 	employeeRepo interfaces.EmployeeRepository,
// 	authRepo interfaces.AuthRepository,
// 	cfg *config.Config,
// ) *TripaySubscriptionUseCase {
// 	return &TripaySubscriptionUseCase{
// 		paymentRepo:  paymentRepo,
// 		tripayClient: tripayClient,
// 		employeeRepo: employeeRepo,
// 		authRepo:     authRepo,
// 		config:       cfg,
// 	}
// }

// func (uc *TripaySubscriptionUseCase) InitiatePaidCheckout(ctx context.Context, userID, subscriptionPlanID, seatPlanID uint, isMonthly bool) (*subscription.InitiatePaidCheckoutResponse, error) {
// 	seatPlan, err := uc.paymentRepo.GetSeatPlan(ctx, seatPlanID)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get seat plan: %w", err)
// 	}

// 	var amount decimal.Decimal
// 	if isMonthly {
// 		amount = seatPlan.PricePerMonth
// 	} else {
// 		amount = seatPlan.PricePerYear
// 	}

// 	sessionID := uuid.New().String()
// 	checkoutSession := &domain.CheckoutSession{
// 		SessionID:          sessionID,
// 		UserID:             userID,
// 		SubscriptionPlanID: subscriptionPlanID,
// 		SeatPlanID:         seatPlanID,
// 		IsTrialCheckout:    false,
// 		Amount:             amount,
// 		Currency:           "IDR",
// 		Status:             enums.CheckoutInitiated,
// 		InitiatedAt:        time.Now(),
// 		ExpiresAt:          func() *time.Time { t := time.Now().Add(24 * time.Hour); return &t }(),
// 	}

// 	if err := uc.paymentRepo.CreateCheckoutSession(ctx, checkoutSession); err != nil {
// 		return nil, fmt.Errorf("failed to create checkout session: %w", err)
// 	}

// 	merchantRef := fmt.Sprintf("checkout_%s", sessionID)
// 	description := fmt.Sprintf("HRIS %s Plan - %s (%d-%d employees)",
// 		seatPlan.SubscriptionPlan.Name,
// 		func() string {
// 			if isMonthly {
// 				return "Monthly"
// 			}
// 			return "Yearly"
// 		}(),
// 		seatPlan.MinEmployees,
// 		seatPlan.MaxEmployees)

// 	// Get user info for customer details
// 	user, err := uc.authRepo.GetUserByID(ctx, userID)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get user: %w", err)
// 	}

// 	// Create Tripay invoice request
// 	invoiceReq := interfaces.CreatePaymentInvoiceRequest{
// 		MerchantRef:   merchantRef,
// 		Amount:        amount,
// 		CustomerName:  user.Email, // Using email as customer name since User doesn't have FullName field
// 		CustomerEmail: user.Email,
// 		OrderItems: []interfaces.PaymentOrderItem{
// 			{
// 				SKU:      fmt.Sprintf("HRIS-%d", seatPlanID),
// 				Name:     description,
// 				Price:    amount,
// 				Quantity: 1,
// 			},
// 		},
// 		CallbackURL: uc.config.Tripay.CallbackURL,
// 		ReturnURL:   uc.config.Tripay.ReturnURL,
// 		ExpiredTime: 24 * 60 * 60, // 24 hours
// 	}

// 	invoice, err := uc.tripayClient.CreateInvoice(ctx, invoiceReq)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create Tripay invoice: %w", err)
// 	}

// 	// Update checkout session with Tripay info
// 	checkoutSession.XenditInvoiceID = &invoice.Reference
// 	checkoutSession.XenditInvoiceURL = &invoice.PaymentURL
// 	checkoutSession.XenditExternalID = &merchantRef
// 	checkoutSession.Status = enums.CheckoutPending

// 	if err := uc.paymentRepo.UpdateCheckoutSession(ctx, checkoutSession); err != nil {
// 		return nil, fmt.Errorf("failed to update checkout session: %w", err)
// 	}

// 	return &subscription.InitiatePaidCheckoutResponse{
// 		CheckoutSession: subscription.ToCheckoutSessionResponse(checkoutSession),
// 		Invoice: &subscription.InvoiceResponse{
// 			ID:         invoice.Reference,
// 			InvoiceURL: invoice.PaymentURL,
// 			Amount:     invoice.Amount,
// 			Currency:   "IDR",
// 			ExpiryDate: invoice.ExpiredTime,
// 		},
// 	}, nil
// }

// func (uc *TripaySubscriptionUseCase) GetPaymentChannels(ctx context.Context) ([]interfaces.PaymentChannel, error) {
// 	return uc.tripayClient.GetPaymentChannels(ctx)
// }

// func (uc *TripaySubscriptionUseCase) CalculateFee(ctx context.Context, paymentCode string, amount decimal.Decimal) (*interfaces.TripayFeeCalculation, error) {
// 	return uc.tripayClient.GetFeeCalculator(ctx, paymentCode, amount)
// }
