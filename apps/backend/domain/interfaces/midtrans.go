package interfaces

import (
	"context"

	"github.com/shopspring/decimal"
)

// MidtransClient interface for Midtrans Snap API
type MidtransClient interface {
	CreateSnapTransaction(ctx context.Context, req MidtransSnapRequest) (*MidtransSnapResponse, error)
	GetTransactionStatus(ctx context.Context, orderID string) (*MidtransTransactionStatus, error)
}

// MidtransSnapRequest for creating Snap transaction
type MidtransSnapRequest struct {
	TransactionDetails MidtransTransactionDetails `json:"transaction_details"`
	CustomerDetails    *MidtransCustomerDetails   `json:"customer_details,omitempty"`
	ItemDetails        []MidtransItemDetails      `json:"item_details,omitempty"`
	Callbacks          *MidtransCallbacks         `json:"callbacks,omitempty"`
	Expiry             *MidtransExpiry            `json:"expiry,omitempty"`
	CustomField1       *string                    `json:"custom_field1,omitempty"`
	CustomField2       *string                    `json:"custom_field2,omitempty"`
	CustomField3       *string                    `json:"custom_field3,omitempty"`
	EnabledPayments    []string                   `json:"enabled_payments,omitempty"`
	PageExpiry         *MidtransPageExpiry        `json:"page_expiry,omitempty"`
}

type MidtransTransactionDetails struct {
	OrderID     string `json:"order_id"`
	GrossAmount int64  `json:"gross_amount"`
}

type MidtransCustomerDetails struct {
	FirstName string                   `json:"first_name,omitempty"`
	LastName  string                   `json:"last_name,omitempty"`
	Email     string                   `json:"email,omitempty"`
	Phone     string                   `json:"phone,omitempty"`
	Address   *MidtransCustomerAddress `json:"billing_address,omitempty"`
}

type MidtransCustomerAddress struct {
	FirstName   string `json:"first_name,omitempty"`
	LastName    string `json:"last_name,omitempty"`
	Email       string `json:"email,omitempty"`
	Phone       string `json:"phone,omitempty"`
	Address     string `json:"address,omitempty"`
	City        string `json:"city,omitempty"`
	PostalCode  string `json:"postal_code,omitempty"`
	CountryCode string `json:"country_code,omitempty"`
}

type MidtransItemDetails struct {
	ID       string  `json:"id"`
	Price    int64   `json:"price"`
	Quantity int     `json:"quantity"`
	Name     string  `json:"name"`
	Brand    *string `json:"brand,omitempty"`
	Category *string `json:"category,omitempty"`
	URL      *string `json:"merchant_name,omitempty"`
}

type MidtransCallbacks struct {
	Finish  string `json:"finish,omitempty"`
	Error   string `json:"error,omitempty"`
	Pending string `json:"unfinish,omitempty"`
}

type MidtransExpiry struct {
	StartTime string `json:"start_time,omitempty"`
	Unit      string `json:"unit,omitempty"`
	Duration  int    `json:"duration,omitempty"`
}

type MidtransPageExpiry struct {
	Duration int    `json:"duration,omitempty"`
	Unit     string `json:"unit,omitempty"`
}

// MidtransSnapResponse from Snap API
type MidtransSnapResponse struct {
	Token       string `json:"token"`
	RedirectURL string `json:"redirect_url"`
}

// MidtransTransactionStatus for checking transaction status
type MidtransTransactionStatus struct {
	StatusCode        string             `json:"status_code"`
	StatusMessage     string             `json:"status_message"`
	TransactionID     string             `json:"transaction_id"`
	OrderID           string             `json:"order_id"`
	GrossAmount       decimal.Decimal    `json:"gross_amount"`
	PaymentType       string             `json:"payment_type"`
	TransactionTime   string             `json:"transaction_time"`
	TransactionStatus string             `json:"transaction_status"`
	FraudStatus       string             `json:"fraud_status"`
	Bank              *string            `json:"bank,omitempty"`
	VaNumbers         []MidtransVANumber `json:"va_numbers,omitempty"`
	BillerCode        *string            `json:"biller_code,omitempty"`
	BillKey           *string            `json:"bill_key,omitempty"`
}

type MidtransVANumber struct {
	Bank     string `json:"bank"`
	VANumber string `json:"va_number"`
}

// MidtransNotification webhook notification payload
type MidtransNotification struct {
	TransactionTime   string          `json:"transaction_time"`
	TransactionStatus string          `json:"transaction_status"`
	TransactionID     string          `json:"transaction_id"`
	StatusMessage     string          `json:"status_message"`
	StatusCode        string          `json:"status_code"`
	SignatureKey      string          `json:"signature_key"`
	PaymentType       string          `json:"payment_type"`
	OrderID           string          `json:"order_id"`
	MerchantID        string          `json:"merchant_id"`
	GrossAmount       decimal.Decimal `json:"gross_amount"`
	FraudStatus       string          `json:"fraud_status"`
	Currency          string          `json:"currency"`
}
