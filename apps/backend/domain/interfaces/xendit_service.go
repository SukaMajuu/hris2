package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/shopspring/decimal"
)

type XenditService interface {
	// Customer Management
	CreateCustomer(ctx context.Context, req CreateCustomerRequest) (*XenditCustomer, error)
	GetCustomer(ctx context.Context, customerID string) (*XenditCustomer, error)

	// Invoice Management
	CreateInvoice(ctx context.Context, req CreateInvoiceRequest) (*XenditInvoice, error)
	GetInvoice(ctx context.Context, invoiceID string) (*XenditInvoice, error)
	ExpireInvoice(ctx context.Context, invoiceID string) (*XenditInvoice, error)

	// Payment Method
	GetAvailablePaymentMethods(ctx context.Context) ([]XenditPaymentMethod, error)

	// Webhook
	VerifyWebhookSignature(webhookToken, payload string) bool
	ProcessWebhook(ctx context.Context, webhookData map[string]interface{}) error
}

// Request/Response DTOs
type CreateCustomerRequest struct {
	ReferenceID string
	Email       string
	GivenNames  string
	Surname     *string
	MobileNumber *string
	Addresses   []CustomerAddress
}

type CustomerAddress struct {
	Country     string
	StreetLine1 string
	StreetLine2 *string
	City        string
	Province    string
	PostalCode  string
}

type CreateInvoiceRequest struct {
	ExternalID          string
	PayerEmail          string
	Description         string
	Amount              decimal.Decimal
	Currency            string
	InvoiceDuration     int64
	SuccessRedirectURL  *string
	FailureRedirectURL  *string
	PaymentMethods      []string
	CustomerID          *string
	Customer            *InvoiceCustomer
	Items               []InvoiceItem
}

type InvoiceCustomer struct {
	GivenNames   string
	Surname      *string
	Email        string
	MobileNumber *string
	Addresses    []CustomerAddress
}

type InvoiceItem struct {
	Name     string
	Quantity int
	Price    decimal.Decimal
	Category string
}

// Response DTOs
type XenditCustomer struct {
	ID           string
	ReferenceID  string
	Email        string
	GivenNames   string
	Surname      *string
	MobileNumber *string
	Addresses    []CustomerAddress
	CreatedAt    string
	UpdatedAt    string
}

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

type XenditPaymentMethod struct {
	ID          string
	Name        string
	Code        string
	Type        string
	IsActivated bool
}

// Repository interface for Xendit-related database operations
type XenditRepository interface {
	// CheckoutSession operations
	CreateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error
	GetCheckoutSession(ctx context.Context, sessionID string) (*domain.CheckoutSession, error)
	UpdateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error

	// PaymentTransaction operations
	CreatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error
	GetPaymentTransaction(ctx context.Context, transactionID uint) (*domain.PaymentTransaction, error)
	GetPaymentTransactionByXenditID(ctx context.Context, xenditInvoiceID string) (*domain.PaymentTransaction, error)
	UpdatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error

	// CustomerBillingInfo operations
	CreateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error
	GetCustomerBillingInfo(ctx context.Context, subscriptionID uint) (*domain.CustomerBillingInfo, error)
	UpdateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error

	// Subscription operations
	GetSubscriptionByAdminUserID(ctx context.Context, adminUserID uint) (*domain.Subscription, error)
	CreateSubscription(ctx context.Context, subscription *domain.Subscription) error
	UpdateSubscription(ctx context.Context, subscription *domain.Subscription) error

	// SubscriptionPlan operations
	GetSubscriptionPlans(ctx context.Context) ([]domain.SubscriptionPlan, error)
	GetSeatPlansBySubscriptionPlan(ctx context.Context, subscriptionPlanID uint) ([]domain.SeatPlan, error)
	GetSeatPlan(ctx context.Context, seatPlanID uint) (*domain.SeatPlan, error)

	// TrialActivity operations
	CreateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error
	UpdateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error
	GetTrialActivityBySubscription(ctx context.Context, subscriptionID uint) (*domain.TrialActivity, error)
}
