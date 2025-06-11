package subscription

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
)

type SubscriptionPlanResponse struct {
	ID          uint                          `json:"id"`
	Name        string                        `json:"name"`
	Type        enums.SubscriptionPlanType    `json:"type"`
	Description string                        `json:"description"`
	Features    []SubscriptionFeatureResponse `json:"features"`
	IsActive    bool                          `json:"is_active"`
	CreatedAt   time.Time                     `json:"created_at"`
}

type SubscriptionFeatureResponse struct {
	ID          uint   `json:"id"`
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
}

type SeatPlanResponse struct {
	ID            uint            `json:"id"`
	Name          string          `json:"name"`
	MinEmployees  int             `json:"min_employees"`
	MaxEmployees  int             `json:"max_employees"`
	PricePerMonth decimal.Decimal `json:"price_per_month"`
	PricePerYear  decimal.Decimal `json:"price_per_year"`
	IsActive      bool            `json:"is_active"`
	CreatedAt     time.Time       `json:"created_at"`
}

type CheckoutSessionResponse struct {
	SessionID        string                    `json:"session_id"`
	Status           enums.CheckoutStatus      `json:"status"`
	IsTrialCheckout  bool                      `json:"is_trial_checkout"`
	Amount           decimal.Decimal           `json:"amount"`
	Currency         string                    `json:"currency"`
	PaymentToken     *string                   `json:"payment_token,omitempty"`
	PaymentURL       *string                   `json:"payment_url,omitempty"`
	SubscriptionPlan *SubscriptionPlanResponse `json:"subscription_plan,omitempty"`
	SeatPlan         *SeatPlanResponse         `json:"seat_plan,omitempty"`
	InitiatedAt      time.Time                 `json:"initiated_at"`
	ExpiresAt        *time.Time                `json:"expires_at,omitempty"`
	CompletedAt      *time.Time                `json:"completed_at,omitempty"`
}

type SubscriptionResponse struct {
	ID                   uint                      `json:"id"`
	Status               enums.SubscriptionStatus  `json:"status"`
	SubscriptionPlan     *SubscriptionPlanResponse `json:"subscription_plan,omitempty"`
	SeatPlan             *SeatPlanResponse         `json:"seat_plan,omitempty"`
	StartDate            time.Time                 `json:"start_date"`
	EndDate              *time.Time                `json:"end_date,omitempty"`
	IsAutoRenew          bool                      `json:"is_auto_renew"`
	CurrentEmployeeCount int                       `json:"current_employee_count"`
	MaxEmployeeCount     int                       `json:"max_employee_count"`
	IsTrialUsed          bool                      `json:"is_trial_used"`
	IsInTrial            bool                      `json:"is_in_trial"`
	TrialStartDate       *time.Time                `json:"trial_start_date,omitempty"`
	TrialEndDate         *time.Time                `json:"trial_end_date,omitempty"`
	RemainingTrialDays   *int                      `json:"remaining_trial_days,omitempty"`
	CreatedAt            time.Time                 `json:"created_at"`
	UpdatedAt            time.Time                 `json:"updated_at"`
}

type PaymentTransactionResponse struct {
	ID            uint                `json:"id"`
	TransactionID *string             `json:"transaction_id,omitempty"`
	OrderID       string              `json:"order_id"`
	Amount        decimal.Decimal     `json:"amount"`
	Currency      string              `json:"currency"`
	Status        enums.PaymentStatus `json:"status"`
	PaymentMethod *string             `json:"payment_method,omitempty"`
	PaymentType   *string             `json:"payment_type,omitempty"`
	Description   string              `json:"description"`
	PaidAt        *time.Time          `json:"paid_at,omitempty"`
	CreatedAt     time.Time           `json:"created_at"`
}

type CustomerBillingInfoResponse struct {
	CompanyName       string `json:"company_name"`
	CompanyAddress    string `json:"company_address"`
	CompanyPhone      string `json:"company_phone"`
	CompanyEmail      string `json:"company_email"`
	TaxNumber         string `json:"tax_number"`
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
	BankAccountName   string `json:"bank_account_name"`
}

type InitiatePaidCheckoutResponse struct {
	CheckoutSession *CheckoutSessionResponse `json:"checkout_session"`
	Invoice         *InvoiceResponse         `json:"invoice"`
}

type InvoiceResponse struct {
	ID         string          `json:"id"`
	InvoiceURL string          `json:"invoice_url"`
	Amount     decimal.Decimal `json:"amount"`
	Currency   string          `json:"currency"`
	ExpiryDate string          `json:"expiry_date"`
}

// New upgrade/downgrade response DTOs
type UpgradePreviewResponse struct {
	CurrentPlan     *SubscriptionPlanResponse `json:"current_plan"`
	NewPlan         *SubscriptionPlanResponse `json:"new_plan"`
	CurrentSeatPlan *SeatPlanResponse         `json:"current_seat_plan"`
	NewSeatPlan     *SeatPlanResponse         `json:"new_seat_plan"`
	PriceDifference decimal.Decimal           `json:"price_difference"`
	ProrationAmount decimal.Decimal           `json:"proration_amount"`
	IsUpgrade       bool                      `json:"is_upgrade"`
	EffectiveDate   time.Time                 `json:"effective_date"`
	NextBillingDate time.Time                 `json:"next_billing_date"`
	RequiresPayment bool                      `json:"requires_payment"`
}

type SubscriptionChangeResponse struct {
	Subscription    *SubscriptionResponse    `json:"subscription"`
	ChangeType      string                   `json:"change_type"` // "plan_upgrade", "plan_downgrade", "seat_upgrade", "seat_downgrade", "trial_conversion"
	PaymentRequired bool                     `json:"payment_required"`
	PaymentAmount   *decimal.Decimal         `json:"payment_amount,omitempty"`
	CheckoutSession *CheckoutSessionResponse `json:"checkout_session,omitempty"`
	Invoice         *InvoiceResponse         `json:"invoice,omitempty"`
	EffectiveDate   time.Time                `json:"effective_date"`
	Message         string                   `json:"message"`
}

// Payment verification response
type PaymentVerificationResponse struct {
	SubscriptionActivated bool                  `json:"subscription_activated"`
	PaymentStatus         string                `json:"payment_status"` // "completed", "pending", "failed", "not_found"
	Subscription          *SubscriptionResponse `json:"subscription,omitempty"`
	Message               string                `json:"message"`
}

// Conversion functions

func ToSubscriptionPlanResponse(plan *domain.SubscriptionPlan) *SubscriptionPlanResponse {
	var features []SubscriptionFeatureResponse

	// Convert features from many-to-many relationship
	for _, planFeature := range plan.PlanFeatures {
		if planFeature.IsEnabled {
			features = append(features, ToSubscriptionFeatureResponse(&planFeature.SubscriptionFeature))
		}
	}

	return &SubscriptionPlanResponse{
		ID:          plan.ID,
		Name:        plan.Name,
		Type:        plan.PlanType,
		Description: plan.Description,
		Features:    features,
		IsActive:    plan.IsActive,
		CreatedAt:   plan.CreatedAt,
	}
}

func ToSubscriptionFeatureResponse(feature *domain.SubscriptionFeature) SubscriptionFeatureResponse {
	return SubscriptionFeatureResponse{
		ID:          feature.ID,
		Name:        feature.Name,
		Code:        feature.Code,
		Description: feature.Description,
	}
}

func ToSeatPlanResponse(seatPlan *domain.SeatPlan) *SeatPlanResponse {
	return &SeatPlanResponse{
		ID:            seatPlan.ID,
		Name:          seatPlan.SizeTierID,
		MinEmployees:  seatPlan.MinEmployees,
		MaxEmployees:  seatPlan.MaxEmployees,
		PricePerMonth: seatPlan.PricePerMonth,
		PricePerYear:  seatPlan.PricePerYear,
		IsActive:      seatPlan.IsActive,
		CreatedAt:     seatPlan.CreatedAt,
	}
}

func ToCheckoutSessionResponse(session *domain.CheckoutSession) *CheckoutSessionResponse {
	response := &CheckoutSessionResponse{
		SessionID:       session.SessionID,
		Status:          session.Status,
		IsTrialCheckout: session.IsTrialCheckout,
		Amount:          session.Amount,
		Currency:        session.Currency,
		PaymentToken:    session.PaymentToken,
		PaymentURL:      session.PaymentURL,
		InitiatedAt:     session.InitiatedAt,
		ExpiresAt:       session.ExpiresAt,
		CompletedAt:     session.CompletedAt,
	}

	if session.SubscriptionPlan.ID != 0 {
		response.SubscriptionPlan = ToSubscriptionPlanResponse(&session.SubscriptionPlan)
	}

	if session.SeatPlan.ID != 0 {
		response.SeatPlan = ToSeatPlanResponse(&session.SeatPlan)
	}

	return response
}

func ToSubscriptionResponse(subscription *domain.Subscription) *SubscriptionResponse {
	response := &SubscriptionResponse{
		ID:                   subscription.ID,
		Status:               subscription.Status,
		StartDate:            subscription.StartDate,
		EndDate:              subscription.EndDate,
		IsAutoRenew:          subscription.IsAutoRenew,
		CurrentEmployeeCount: subscription.CurrentEmployeeCount,
		IsTrialUsed:          subscription.IsTrialUsed,
		IsInTrial:            subscription.IsInTrial(),
		TrialStartDate:       subscription.TrialStartDate,
		TrialEndDate:         subscription.TrialEndDate,
		CreatedAt:            subscription.CreatedAt,
		UpdatedAt:            subscription.UpdatedAt,
	}

	if subscription.SeatPlan.ID != 0 {
		response.MaxEmployeeCount = subscription.SeatPlan.MaxEmployees
		response.SeatPlan = ToSeatPlanResponse(&subscription.SeatPlan)
	}

	if subscription.SubscriptionPlan.ID != 0 {
		response.SubscriptionPlan = ToSubscriptionPlanResponse(&subscription.SubscriptionPlan)
	}

	if subscription.IsInTrial() {
		remaining := subscription.RemainingTrialDays()
		response.RemainingTrialDays = &remaining
	}

	return response
}

func ToPaymentTransactionResponse(transaction *domain.PaymentTransaction) *PaymentTransactionResponse {
	return &PaymentTransactionResponse{
		ID:            transaction.ID,
		TransactionID: transaction.TransactionID,
		OrderID:       transaction.OrderID,
		Amount:        transaction.Amount,
		Currency:      transaction.Currency,
		Status:        transaction.Status,
		PaymentMethod: transaction.PaymentMethod,
		PaymentType:   transaction.PaymentType,
		Description:   transaction.Description,
		PaidAt:        transaction.PaidAt,
		CreatedAt:     transaction.CreatedAt,
	}
}

func ToCustomerBillingInfoResponse(billingInfo *domain.CustomerBillingInfo) *CustomerBillingInfoResponse {
	response := &CustomerBillingInfoResponse{
		CompanyName:    billingInfo.CompanyName,
		CompanyAddress: billingInfo.CompanyAddress,
		CompanyEmail:   billingInfo.CompanyEmail,
	}

	if billingInfo.CompanyPhone != nil {
		response.CompanyPhone = *billingInfo.CompanyPhone
	}

	if billingInfo.TaxNumber != nil {
		response.TaxNumber = *billingInfo.TaxNumber
	}

	if billingInfo.BankName != nil {
		response.BankName = *billingInfo.BankName
	}

	if billingInfo.BankAccountNumber != nil {
		response.BankAccountNumber = *billingInfo.BankAccountNumber
	}

	if billingInfo.BankAccountHolder != nil {
		response.BankAccountName = *billingInfo.BankAccountHolder
	}

	return response
}
