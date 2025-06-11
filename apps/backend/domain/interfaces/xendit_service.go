package interfaces

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
)

type XenditClient interface {
	CreateInvoice(ctx context.Context, req CreateInvoiceRequest) (*XenditInvoice, error)
}

// Request/Response DTOs
type CreateInvoiceRequest struct {
	ExternalID         string
	PayerEmail         string
	Description        string
	Amount             decimal.Decimal
	Currency           string
	InvoiceDuration    int64
	SuccessRedirectURL *string
	FailureRedirectURL *string
	PaymentMethods     []string
	CustomerID         *string
	Customer           *InvoiceCustomer
	Items              []InvoiceItem
}

type InvoiceCustomer struct {
	GivenNames   string
	Surname      *string
	Email        string
	MobileNumber *string
	Addresses    []CustomerAddress
}

type CustomerAddress struct {
	Country     string
	StreetLine1 string
	StreetLine2 *string
	City        string
	Province    string
	PostalCode  string
}

type InvoiceItem struct {
	Name     string
	Quantity int
	Price    decimal.Decimal
	Category string
}

// Response DTOs
type XenditInvoice struct {
	ID                 string
	ExternalID         string
	UserID             string
	Status             string
	MerchantName       string
	Amount             decimal.Decimal
	Currency           string
	Description        string
	InvoiceURL         string
	ExpiryDate         string
	PaymentMethod      string
	PaymentChannel     string
	PaymentDestination string
	CustomerID         *string
	Customer           *InvoiceCustomer
	Items              []InvoiceItem
	Fees               []InvoiceFee
	CreatedAt          string
	UpdatedAt          string
	PaidAt             *string
}

type InvoiceFee struct {
	Type  string
	Value decimal.Decimal
}

// Repository interface for payment-related database operations (generic, payment gateway agnostic)
type PaymentRepository interface {
	// CheckoutSession operations
	CreateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error
	GetCheckoutSession(ctx context.Context, sessionID string) (*domain.CheckoutSession, error)
	UpdateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error

	// PaymentTransaction operations
	CreatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error
	GetPaymentTransaction(ctx context.Context, transactionID uint) (*domain.PaymentTransaction, error)
	GetPaymentTransactionByOrderID(ctx context.Context, orderID string) (*domain.PaymentTransaction, error)
	GetPaymentTransactionByTransactionID(ctx context.Context, transactionID string) (*domain.PaymentTransaction, error)
	UpdatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error

	// CustomerBillingInfo operations
	CreateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error
	GetCustomerBillingInfo(ctx context.Context, subscriptionID uint) (*domain.CustomerBillingInfo, error)
	UpdateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error

	// Subscription operations
	GetSubscriptionByAdminUserID(ctx context.Context, adminUserID uint) (*domain.Subscription, error)
	CreateSubscription(ctx context.Context, subscription *domain.Subscription) error
	UpdateSubscription(ctx context.Context, subscription *domain.Subscription) error
	UpdateSubscriptionFields(ctx context.Context, subscriptionID uint, fields map[string]interface{}) error
	GetSubscriptionsByStatus(ctx context.Context, status enums.SubscriptionStatus) ([]domain.Subscription, error)
	GetSubscriptionsDueForRenewal(ctx context.Context, date time.Time) ([]domain.Subscription, error)

	// SubscriptionPlan operations
	GetSubscriptionPlans(ctx context.Context) ([]domain.SubscriptionPlan, error)
	GetSubscriptionPlan(ctx context.Context, planID uint) (*domain.SubscriptionPlan, error)
	GetSeatPlansBySubscriptionPlan(ctx context.Context, subscriptionPlanID uint) ([]domain.SeatPlan, error)
	GetSeatPlan(ctx context.Context, seatPlanID uint) (*domain.SeatPlan, error)

	// TrialActivity operations
	CreateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error
	UpdateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error
	GetTrialActivityBySubscription(ctx context.Context, subscriptionID uint) (*domain.TrialActivity, error)

	// SubscriptionUsage operations
	CreateSubscriptionUsage(ctx context.Context, usage *domain.SubscriptionUsage) error
}
