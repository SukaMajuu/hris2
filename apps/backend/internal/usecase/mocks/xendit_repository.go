package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

// XenditRepository is a mock type for the interfaces.XenditRepository interface
type XenditRepository struct {
	mock.Mock
}

// CheckoutSession operations
func (m *XenditRepository) CreateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error {
	args := m.Called(ctx, session)
	return args.Error(0)
}

func (m *XenditRepository) GetCheckoutSession(ctx context.Context, sessionID string) (*domain.CheckoutSession, error) {
	args := m.Called(ctx, sessionID)
	return args.Get(0).(*domain.CheckoutSession), args.Error(1)
}

func (m *XenditRepository) UpdateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error {
	args := m.Called(ctx, session)
	return args.Error(0)
}

// PaymentTransaction operations
func (m *XenditRepository) CreatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error {
	args := m.Called(ctx, transaction)
	return args.Error(0)
}

func (m *XenditRepository) GetPaymentTransaction(ctx context.Context, transactionID uint) (*domain.PaymentTransaction, error) {
	args := m.Called(ctx, transactionID)
	return args.Get(0).(*domain.PaymentTransaction), args.Error(1)
}

func (m *XenditRepository) GetPaymentTransactionByXenditID(ctx context.Context, xenditInvoiceID string) (*domain.PaymentTransaction, error) {
	args := m.Called(ctx, xenditInvoiceID)
	return args.Get(0).(*domain.PaymentTransaction), args.Error(1)
}

func (m *XenditRepository) UpdatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error {
	args := m.Called(ctx, transaction)
	return args.Error(0)
}

// CustomerBillingInfo operations
func (m *XenditRepository) CreateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error {
	args := m.Called(ctx, billingInfo)
	return args.Error(0)
}

func (m *XenditRepository) GetCustomerBillingInfo(ctx context.Context, subscriptionID uint) (*domain.CustomerBillingInfo, error) {
	args := m.Called(ctx, subscriptionID)
	return args.Get(0).(*domain.CustomerBillingInfo), args.Error(1)
}

func (m *XenditRepository) UpdateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error {
	args := m.Called(ctx, billingInfo)
	return args.Error(0)
}

// Subscription operations
func (m *XenditRepository) GetSubscriptionByAdminUserID(ctx context.Context, adminUserID uint) (*domain.Subscription, error) {
	args := m.Called(ctx, adminUserID)
	return args.Get(0).(*domain.Subscription), args.Error(1)
}

func (m *XenditRepository) CreateSubscription(ctx context.Context, subscription *domain.Subscription) error {
	args := m.Called(ctx, subscription)
	return args.Error(0)
}

func (m *XenditRepository) UpdateSubscription(ctx context.Context, subscription *domain.Subscription) error {
	args := m.Called(ctx, subscription)
	return args.Error(0)
}

// SubscriptionPlan operations
func (m *XenditRepository) GetSubscriptionPlans(ctx context.Context) ([]domain.SubscriptionPlan, error) {
	args := m.Called(ctx)
	return args.Get(0).([]domain.SubscriptionPlan), args.Error(1)
}

func (m *XenditRepository) GetSeatPlansBySubscriptionPlan(ctx context.Context, subscriptionPlanID uint) ([]domain.SeatPlan, error) {
	args := m.Called(ctx, subscriptionPlanID)
	return args.Get(0).([]domain.SeatPlan), args.Error(1)
}

func (m *XenditRepository) GetSeatPlan(ctx context.Context, seatPlanID uint) (*domain.SeatPlan, error) {
	args := m.Called(ctx, seatPlanID)
	return args.Get(0).(*domain.SeatPlan), args.Error(1)
}

// TrialActivity operations
func (m *XenditRepository) CreateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error {
	args := m.Called(ctx, activity)
	return args.Error(0)
}

func (m *XenditRepository) UpdateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error {
	args := m.Called(ctx, activity)
	return args.Error(0)
}

func (m *XenditRepository) GetTrialActivityBySubscription(ctx context.Context, subscriptionID uint) (*domain.TrialActivity, error) {
	args := m.Called(ctx, subscriptionID)
	return args.Get(0).(*domain.TrialActivity), args.Error(1)
}
