package subscription

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/notification"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// ProcessExpiredTrials checks for expired trials and updates their status
func (uc *SubscriptionUseCase) ProcessExpiredTrials(ctx context.Context) error {
	log.Println("🔍 Checking for expired trials...")

	subscriptions, err := uc.xenditRepo.GetSubscriptionsByStatus(ctx, enums.StatusTrial)
	if err != nil {
		return fmt.Errorf("failed to get trial subscriptions: %w", err)
	}

	expiredCount := 0
	for _, subscription := range subscriptions {
		if subscription.IsTrialExpired() {
			log.Printf("📅 Trial expired for user ID %d, subscription ID %d", subscription.AdminUserID, subscription.ID)

			subscription.Status = enums.StatusExpired
			if err := uc.xenditRepo.UpdateSubscription(ctx, &subscription); err != nil {
				log.Printf("❌ Failed to update subscription %d status: %v", subscription.ID, err)
				continue
			}

			user, err := uc.authRepo.GetUserByID(ctx, subscription.AdminUserID)
			if err != nil {
				log.Printf("❌ Failed to get user %d for notification: %v", subscription.AdminUserID, err)
				continue
			}

			emailService := notification.NewEmailService(config.Config{})

			if err := emailService.SendTrialExpired(ctx, user, &subscription); err != nil {
				log.Printf("❌ Failed to send trial expired email to user %d: %v", subscription.AdminUserID, err)
			} else {
				log.Printf("✅ Trial expired notification sent to %s", user.Email)
			}

			expiredCount++
		}
	}

	log.Printf("✅ Processed %d expired trials", expiredCount)
	return nil
}

// SendTrialWarningNotifications sends warning emails for trials expiring soon
func (uc *SubscriptionUseCase) SendTrialWarningNotifications(ctx context.Context) error {
	log.Println("📧 Sending trial warning notifications...")

	subscriptions, err := uc.xenditRepo.GetSubscriptionsByStatus(ctx, enums.StatusTrial)
	if err != nil {
		return fmt.Errorf("failed to get trial subscriptions: %w", err)
	}

	emailService := notification.NewEmailService(config.Config{})

	sentCount := 0
	for _, subscription := range subscriptions {
		if !subscription.IsInTrial() {
			continue
		}

		remainingDays := subscription.RemainingTrialDays()

		if remainingDays == 7 || remainingDays == 3 || remainingDays == 1 {
			user, err := uc.authRepo.GetUserByID(ctx, subscription.AdminUserID)
			if err != nil {
				log.Printf("❌ Failed to get user %d for warning notification: %v", subscription.AdminUserID, err)
				continue
			}

			if uc.hasNotificationBeenSentToday(ctx, subscription.ID, "trial_warning") {
				continue
			}

			if err := emailService.SendTrialWarning(ctx, user, &subscription, remainingDays); err != nil {
				log.Printf("❌ Failed to send trial warning to user %d: %v", subscription.AdminUserID, err)
			} else {
				log.Printf("✅ Trial warning (%d days) sent to %s", remainingDays, user.Email)

				uc.recordNotificationSent(ctx, subscription.ID, "trial_warning")
				sentCount++
			}
		}
	}

	log.Printf("✅ Sent %d trial warning notifications", sentCount)
	return nil
}

// ProcessAutoRenewals handles automatic subscription renewals
func (uc *SubscriptionUseCase) ProcessAutoRenewals(ctx context.Context) error {
	log.Println("🔄 Processing auto-renewals...")

	today := time.Now().UTC().Truncate(24 * time.Hour)
	subscriptions, err := uc.xenditRepo.GetSubscriptionsDueForRenewal(ctx, today)
	if err != nil {
		return fmt.Errorf("failed to get subscriptions due for renewal: %w", err)
	}

	processedCount := 0
	for _, subscription := range subscriptions {
		if !subscription.IsAutoRenew {
			log.Printf("⏭️ Skipping auto-renewal for subscription %d (auto-renew disabled)", subscription.ID)
			continue
		}

		if subscription.Status != enums.StatusActive {
			log.Printf("⏭️ Skipping renewal for subscription %d (status: %s)", subscription.ID, subscription.Status)
			continue
		}

		log.Printf("🔄 Processing auto-renewal for subscription %d (user %d)", subscription.ID, subscription.AdminUserID)

		if err := uc.createRenewalInvoice(ctx, &subscription); err != nil {
			log.Printf("❌ Failed to create renewal invoice for subscription %d: %v", subscription.ID, err)

			user, _ := uc.authRepo.GetUserByID(ctx, subscription.AdminUserID)
			if user != nil {
				log.Printf("⚠️ Should send renewal failure notification to %s", user.Email)
			}
			continue
		}

		processedCount++
	}

	log.Printf("✅ Processed %d auto-renewals", processedCount)
	return nil
}

// UpdateUsageStatistics updates subscription usage data
func (uc *SubscriptionUseCase) UpdateUsageStatistics(ctx context.Context) error {
	log.Println("📊 Updating usage statistics...")

	activeSubscriptions, err := uc.xenditRepo.GetSubscriptionsByStatus(ctx, enums.StatusActive)
	if err != nil {
		return fmt.Errorf("failed to get active subscriptions: %w", err)
	}

	trialSubscriptions, err := uc.xenditRepo.GetSubscriptionsByStatus(ctx, enums.StatusTrial)
	if err != nil {
		return fmt.Errorf("failed to get trial subscriptions: %w", err)
	}

	allSubscriptions := append(activeSubscriptions, trialSubscriptions...)

	updatedCount := 0
	for _, subscription := range allSubscriptions {
		employeeCount, err := uc.countEmployeesForUser(ctx, subscription.AdminUserID)
		if err != nil {
			log.Printf("❌ Failed to count employees for user %d: %v", subscription.AdminUserID, err)
			continue
		}

		if subscription.CurrentEmployeeCount != employeeCount {
			subscription.CurrentEmployeeCount = employeeCount
			if err := uc.xenditRepo.UpdateSubscription(ctx, &subscription); err != nil {
				log.Printf("❌ Failed to update subscription %d employee count: %v", subscription.ID, err)
				continue
			}
		}

		usage := &domain.SubscriptionUsage{
			SubscriptionID:      subscription.ID,
			EmployeeCount:       employeeCount,
			ActiveEmployeeCount: employeeCount,
			RecordedAt:          time.Now().UTC(),
		}

		if err := uc.xenditRepo.CreateSubscriptionUsage(ctx, usage); err != nil {
			log.Printf("❌ Failed to create usage record for subscription %d: %v", subscription.ID, err)
			continue
		}

		updatedCount++
	}

	log.Printf("✅ Updated usage statistics for %d subscriptions", updatedCount)
	return nil
}

func (uc *SubscriptionUseCase) hasNotificationBeenSentToday(ctx context.Context, subscriptionID uint, notificationType string) bool {
	return false
}

func (uc *SubscriptionUseCase) recordNotificationSent(ctx context.Context, subscriptionID uint, notificationType string) {
	log.Printf("📝 Recording %s notification sent for subscription %d", notificationType, subscriptionID)
}

func (uc *SubscriptionUseCase) createRenewalInvoice(ctx context.Context, subscription *domain.Subscription) error {
	seatPlan, err := uc.xenditRepo.GetSeatPlan(ctx, subscription.SeatPlanID)
	if err != nil {
		return fmt.Errorf("failed to get seat plan: %w", err)
	}

	var amount decimal.Decimal

	if subscription.NextBillingDate != nil {
		now := time.Now().UTC()
		daysSinceLastBilling := int(now.Sub(*subscription.NextBillingDate).Hours() / 24)

		if daysSinceLastBilling >= 350 {
			amount = seatPlan.PricePerYear
		} else {
			amount = seatPlan.PricePerMonth
		}
	} else {
		amount = seatPlan.PricePerMonth
	}

	sessionID := uuid.New().String()
	checkoutSession := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             subscription.AdminUserID,
		SubscriptionPlanID: subscription.SubscriptionPlanID,
		SeatPlanID:         subscription.SeatPlanID,
		IsTrialCheckout:    false,
		Amount:             amount,
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now().UTC(),
		ExpiresAt:          func() *time.Time { t := time.Now().UTC().Add(7 * 24 * time.Hour); return &t }(), // 7 days to pay
	}

	if err := uc.xenditRepo.CreateCheckoutSession(ctx, checkoutSession); err != nil {
		return fmt.Errorf("failed to create renewal checkout session: %w", err)
	}

	log.Printf("💳 Created renewal invoice for subscription %d, amount: %s", subscription.ID, amount.String())

	return nil
}

func (uc *SubscriptionUseCase) countEmployeesForUser(ctx context.Context, adminUserID uint) (int, error) {
	return 1, nil
}

type SubscriptionRepositoryInterface interface {
	GetSubscriptionsByStatus(ctx context.Context, status enums.SubscriptionStatus) ([]domain.Subscription, error)
	GetSubscriptionsDueForRenewal(ctx context.Context, date time.Time) ([]domain.Subscription, error)
	CreateSubscriptionUsage(ctx context.Context, usage *domain.SubscriptionUsage) error
}
