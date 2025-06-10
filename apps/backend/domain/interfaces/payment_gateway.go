package interfaces

import (
	"context"

	"github.com/shopspring/decimal"
)

// PaymentGatewayClient interface umum untuk semua payment gateway
type PaymentGatewayClient interface {
	CreateInvoice(ctx context.Context, req CreatePaymentInvoiceRequest) (*PaymentInvoice, error)
	GetPaymentChannels(ctx context.Context) ([]PaymentChannel, error)
}

// Request/Response DTOs untuk payment gateway umum
type CreatePaymentInvoiceRequest struct {
	MerchantRef   string
	Amount        decimal.Decimal
	CustomerName  string
	CustomerEmail string
	CustomerPhone *string
	OrderItems    []PaymentOrderItem
	CallbackURL   string
	ReturnURL     string
	ExpiredTime   int64 // dalam detik
	Signature     string
}

type PaymentOrderItem struct {
	SKU        string
	Name       string
	Price      decimal.Decimal
	Quantity   int
	ProductURL *string
	ImageURL   *string
}

type PaymentInvoice struct {
	Reference   string
	MerchantRef string
	PaymentURL  string
	QRString    *string
	Amount      decimal.Decimal
	Status      string
	ExpiredTime string
	CreatedAt   string
	UpdatedAt   string
}

type PaymentChannel struct {
	Code      string
	Name      string
	Type      string
	IsActive  bool
	MinAmount *decimal.Decimal
	MaxAmount *decimal.Decimal
	Fee       *PaymentFee
}

type PaymentFee struct {
	Flat    *decimal.Decimal
	Percent *decimal.Decimal
}

// Tripay specific interfaces
type TripayClient interface {
	PaymentGatewayClient
	GetFeeCalculator(ctx context.Context, code string, amount decimal.Decimal) (*TripayFeeCalculation, error)
}

type TripayFeeCalculation struct {
	Code     string
	Name     string
	Fee      decimal.Decimal
	TotalFee decimal.Decimal
}
