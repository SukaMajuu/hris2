package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/stretchr/testify/mock"
)

// XenditService is a mock type for the interfaces.XenditService interface
type XenditService struct {
	mock.Mock
}

// Customer Management
func (m *XenditService) CreateCustomer(ctx context.Context, req interfaces.CreateCustomerRequest) (*interfaces.XenditCustomer, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(*interfaces.XenditCustomer), args.Error(1)
}

func (m *XenditService) GetCustomer(ctx context.Context, customerID string) (*interfaces.XenditCustomer, error) {
	args := m.Called(ctx, customerID)
	return args.Get(0).(*interfaces.XenditCustomer), args.Error(1)
}

// Invoice Management
func (m *XenditService) CreateInvoice(ctx context.Context, req interfaces.CreateInvoiceRequest) (*interfaces.XenditInvoice, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(*interfaces.XenditInvoice), args.Error(1)
}

func (m *XenditService) GetInvoice(ctx context.Context, invoiceID string) (*interfaces.XenditInvoice, error) {
	args := m.Called(ctx, invoiceID)
	return args.Get(0).(*interfaces.XenditInvoice), args.Error(1)
}

func (m *XenditService) ExpireInvoice(ctx context.Context, invoiceID string) (*interfaces.XenditInvoice, error) {
	args := m.Called(ctx, invoiceID)
	return args.Get(0).(*interfaces.XenditInvoice), args.Error(1)
}

// Payment Method
func (m *XenditService) GetAvailablePaymentMethods(ctx context.Context) ([]interfaces.XenditPaymentMethod, error) {
	args := m.Called(ctx)
	return args.Get(0).([]interfaces.XenditPaymentMethod), args.Error(1)
}

// Webhook
func (m *XenditService) VerifyWebhookSignature(webhookToken, payload string) bool {
	args := m.Called(webhookToken, payload)
	return args.Bool(0)
}

func (m *XenditService) ProcessWebhook(ctx context.Context, webhookData map[string]interface{}) error {
	args := m.Called(ctx, webhookData)
	return args.Error(0)
}

func (m *XenditService) VerifyCallbackToken(token string) bool {
	args := m.Called(token)
	return args.Bool(0)
}
