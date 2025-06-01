package xendit

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewXenditRepository(db *gorm.DB) interfaces.XenditRepository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) CreateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error {
	if err := r.db.WithContext(ctx).Create(session).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetCheckoutSession(ctx context.Context, sessionID string) (*domain.CheckoutSession, error) {
	var session domain.CheckoutSession
	if err := r.db.WithContext(ctx).
		Preload("User").
		Preload("SubscriptionPlan").
		Preload("SeatPlan").
		Preload("Subscription").
		Preload("PaymentTransaction").
		Where("session_id = ?", sessionID).
		First(&session).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *Repository) UpdateCheckoutSession(ctx context.Context, session *domain.CheckoutSession) error {
	return r.db.WithContext(ctx).Save(session).Error
}

// PaymentTransaction operations
func (r *Repository) CreatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error {
	if err := r.db.WithContext(ctx).Create(transaction).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetPaymentTransaction(ctx context.Context, transactionID uint) (*domain.PaymentTransaction, error) {
	var transaction domain.PaymentTransaction
	if err := r.db.WithContext(ctx).
		Preload("Subscription").
		Preload("Subscription.AdminUser").
		Preload("Subscription.SubscriptionPlan").
		Preload("Subscription.SeatPlan").
		Where("id = ?", transactionID).
		First(&transaction).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *Repository) GetPaymentTransactionByXenditID(ctx context.Context, xenditInvoiceID string) (*domain.PaymentTransaction, error) {
	var transaction domain.PaymentTransaction
	if err := r.db.WithContext(ctx).
		Preload("Subscription").
		Preload("Subscription.AdminUser").
		Preload("Subscription.SubscriptionPlan").
		Preload("Subscription.SeatPlan").
		Where("xendit_invoice_id = ?", xenditInvoiceID).
		First(&transaction).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *Repository) UpdatePaymentTransaction(ctx context.Context, transaction *domain.PaymentTransaction) error {
	return r.db.WithContext(ctx).Save(transaction).Error
}

// CustomerBillingInfo operations
func (r *Repository) CreateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error {
	if err := r.db.WithContext(ctx).Create(billingInfo).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) GetCustomerBillingInfo(ctx context.Context, subscriptionID uint) (*domain.CustomerBillingInfo, error) {
	var billingInfo domain.CustomerBillingInfo
	if err := r.db.WithContext(ctx).
		Preload("Subscription").
		Preload("Subscription.AdminUser").
		Where("subscription_id = ?", subscriptionID).
		First(&billingInfo).Error; err != nil {
		return nil, err
	}
	return &billingInfo, nil
}

func (r *Repository) UpdateCustomerBillingInfo(ctx context.Context, billingInfo *domain.CustomerBillingInfo) error {
	return r.db.WithContext(ctx).Save(billingInfo).Error
}

// Additional helper methods for subscription management

func (r *Repository) GetSubscriptionByAdminUserID(ctx context.Context, adminUserID uint) (*domain.Subscription, error) {
	var subscription domain.Subscription
	if err := r.db.WithContext(ctx).
		Preload("AdminUser").
		Preload("SubscriptionPlan").
		Preload("SeatPlan").
		Where("admin_user_id = ?", adminUserID).
		First(&subscription).Error; err != nil {
		return nil, err
	}
	return &subscription, nil
}

func (r *Repository) CreateSubscription(ctx context.Context, subscription *domain.Subscription) error {
	if err := r.db.WithContext(ctx).Create(subscription).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) UpdateSubscription(ctx context.Context, subscription *domain.Subscription) error {
	return r.db.WithContext(ctx).Save(subscription).Error
}

func (r *Repository) GetSubscriptionPlans(ctx context.Context) ([]domain.SubscriptionPlan, error) {
	var plans []domain.SubscriptionPlan
	if err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *Repository) GetSeatPlansBySubscriptionPlan(ctx context.Context, subscriptionPlanID uint) ([]domain.SeatPlan, error) {
	var seatPlans []domain.SeatPlan
	if err := r.db.WithContext(ctx).
		Where("subscription_plan_id = ? AND is_active = ?", subscriptionPlanID, true).
		Find(&seatPlans).Error; err != nil {
		return nil, err
	}
	return seatPlans, nil
}

func (r *Repository) GetSeatPlan(ctx context.Context, seatPlanID uint) (*domain.SeatPlan, error) {
	var seatPlan domain.SeatPlan
	if err := r.db.WithContext(ctx).
		Preload("SubscriptionPlan").
		Where("id = ?", seatPlanID).
		First(&seatPlan).Error; err != nil {
		return nil, err
	}
	return &seatPlan, nil
}

func (r *Repository) CreateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error {
	if err := r.db.WithContext(ctx).Create(activity).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) UpdateTrialActivity(ctx context.Context, activity *domain.TrialActivity) error {
	return r.db.WithContext(ctx).Save(activity).Error
}

func (r *Repository) GetTrialActivityBySubscription(ctx context.Context, subscriptionID uint) (*domain.TrialActivity, error) {
	var activity domain.TrialActivity
	if err := r.db.WithContext(ctx).
		Preload("Subscription").
		Preload("User").
		Where("subscription_id = ?", subscriptionID).
		First(&activity).Error; err != nil {
		return nil, err
	}
	return &activity, nil
}
