package subscription

import (
	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type InitiateTrialCheckoutRequest struct {
	SubscriptionPlanID uint `json:"subscription_plan_id" binding:"required"`
	SeatPlanID         uint `json:"seat_plan_id" binding:"required"`
}

type InitiatePaidCheckoutRequest struct {
	SubscriptionPlanID uint `json:"subscription_plan_id" binding:"required"`
	SeatPlanID         uint `json:"seat_plan_id" binding:"required"`
	IsMonthly          bool `json:"is_monthly"`
}

type CompleteTrialCheckoutRequest struct {
	SessionID         string `json:"session_id" binding:"required"`
	CompanyName       string `json:"company_name" binding:"required"`
	CompanyAddress    string `json:"company_address" binding:"required"`
	CompanyPhone      string `json:"company_phone" binding:"required"`
	CompanyEmail      string `json:"company_email" binding:"required,email"`
	TaxNumber         string `json:"tax_number"`
	BankName          string `json:"bank_name"`
	BankAccountNumber string `json:"bank_account_number"`
	BankAccountName   string `json:"bank_account_name"`
}

type ProcessWebhookRequest struct {
	WebhookType string                 `json:"webhook_type"`
	Data        map[string]interface{} `json:"data"`
}

// New upgrade/downgrade request DTOs
type UpgradeSubscriptionPlanRequest struct {
	NewSubscriptionPlanID uint `json:"new_subscription_plan_id" binding:"required"`
	IsMonthly             bool `json:"is_monthly"`
}

type ChangeSeatPlanRequest struct {
	NewSeatPlanID uint `json:"new_seat_plan_id" binding:"required"`
	IsMonthly     bool `json:"is_monthly"`
}

type ConvertTrialToPaidRequest struct {
	SubscriptionPlanID *uint `json:"subscription_plan_id,omitempty"` // Optional, keep current if not provided
	SeatPlanID         *uint `json:"seat_plan_id,omitempty"`         // Optional, keep current if not provided
	IsMonthly          bool  `json:"is_monthly"`
}

func FromCompleteTrialCheckoutRequest(req *CompleteTrialCheckoutRequest) *domain.CustomerBillingInfo {
	billingInfo := &domain.CustomerBillingInfo{
		CompanyName:         req.CompanyName,
		CompanyAddress:      req.CompanyAddress,
		CompanyEmail:        req.CompanyEmail,
		BillingContactName:  req.CompanyName,
		BillingContactEmail: req.CompanyEmail,
	}

	if req.CompanyPhone != "" {
		billingInfo.CompanyPhone = &req.CompanyPhone
		billingInfo.BillingContactPhone = &req.CompanyPhone
	}

	if req.TaxNumber != "" {
		billingInfo.TaxNumber = &req.TaxNumber
	}

	if req.BankName != "" {
		billingInfo.BankName = &req.BankName
	}

	if req.BankAccountNumber != "" {
		billingInfo.BankAccountNumber = &req.BankAccountNumber
	}

	if req.BankAccountName != "" {
		billingInfo.BankAccountHolder = &req.BankAccountName
	}

	return billingInfo
}
