package xendit

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

// Repository implements PaymentRepository interface for payment and subscription operations
// Note: Package name is "xendit" for historical reasons, but this repository is now payment gateway agnostic
type Repository struct {
	db *gorm.DB
}

// NewXenditRepository creates a new payment repository instance
// Deprecated: Use NewPaymentRepository instead
func NewXenditRepository(db *gorm.DB) interfaces.PaymentRepository {
	return &Repository{
		db: db,
	}
}

// NewPaymentRepository creates a new payment repository instance
func NewPaymentRepository(db *gorm.DB) interfaces.PaymentRepository {
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
		Preload("Subscription.SubscriptionPlan.PlanFeatures").
		Preload("Subscription.SubscriptionPlan.PlanFeatures.SubscriptionFeature").
		Preload("Subscription.SeatPlan").
		Where("id = ?", transactionID).
		First(&transaction).Error; err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *Repository) GetPaymentTransactionByOrderID(ctx context.Context, orderID string) (*domain.PaymentTransaction, error) {
	var transaction domain.PaymentTransaction
	if err := r.db.WithContext(ctx).
		Preload("Subscription").
		Preload("Subscription.AdminUser").
		Preload("Subscription.SubscriptionPlan").
		Preload("Subscription.SubscriptionPlan.PlanFeatures").
		Preload("Subscription.SubscriptionPlan.PlanFeatures.SubscriptionFeature").
		Preload("Subscription.SeatPlan").
		Where("order_id = ?", orderID).
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
		Preload("Subscription.SubscriptionPlan.PlanFeatures").
		Preload("Subscription.SubscriptionPlan.PlanFeatures.SubscriptionFeature").
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
		Preload("SubscriptionPlan.PlanFeatures").
		Preload("SeatPlan").
		Preload("SubscriptionPlan.PlanFeatures.SubscriptionFeature").
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
		Preload("PlanFeatures.SubscriptionFeature").
		Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *Repository) GetSubscriptionPlan(ctx context.Context, planID uint) (*domain.SubscriptionPlan, error) {
	var plan domain.SubscriptionPlan
	if err := r.db.WithContext(ctx).
		Preload("PlanFeatures.SubscriptionFeature").
		Where("id = ?", planID).
		First(&plan).Error; err != nil {
		return nil, err
	}
	return &plan, nil
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

// Additional methods for automation and subscription management

func (r *Repository) GetSubscriptionsByStatus(ctx context.Context, status enums.SubscriptionStatus) ([]domain.Subscription, error) {
	var subscriptions []domain.Subscription
	if err := r.db.WithContext(ctx).
		Preload("AdminUser").
		Preload("SubscriptionPlan").
		Preload("SubscriptionPlan.PlanFeatures").
		Preload("SubscriptionPlan.PlanFeatures.SubscriptionFeature").
		Preload("SeatPlan").
		Where("status = ?", status).
		Find(&subscriptions).Error; err != nil {
		return nil, err
	}
	return subscriptions, nil
}

func (r *Repository) GetSubscriptionsDueForRenewal(ctx context.Context, date time.Time) ([]domain.Subscription, error) {
	var subscriptions []domain.Subscription
	if err := r.db.WithContext(ctx).
		Preload("AdminUser").
		Preload("SubscriptionPlan").
		Preload("SubscriptionPlan.PlanFeatures").
		Preload("SubscriptionPlan.PlanFeatures.SubscriptionFeature").
		Preload("SeatPlan").
		Where("next_billing_date <= ? AND status = ? AND is_auto_renew = ?",
			date, enums.StatusActive, true).
		Find(&subscriptions).Error; err != nil {
		return nil, err
	}
	return subscriptions, nil
}

func (r *Repository) CreateSubscriptionUsage(ctx context.Context, usage *domain.SubscriptionUsage) error {
	if err := r.db.WithContext(ctx).Create(usage).Error; err != nil {
		return err
	}
	return nil
}

func (r *Repository) CountEmployeesByManagerID(ctx context.Context, managerID uint) (int, error) {
	var count int64
	if err := r.db.WithContext(ctx).
		Model(&domain.Employee{}).
		Where("manager_id = ? AND employment_status = ?", managerID, true).
		Count(&count).Error; err != nil {
		return 0, err
	}
	return int(count), nil
}
