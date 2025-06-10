package interfaces

import "context"

// SubscriptionUseCase defines the interface for subscription-related business logic
type SubscriptionUseCase interface {
	// CreateAutomaticTrialForPremiumUser creates a trial subscription for new premium users
	CreateAutomaticTrialForPremiumUser(ctx context.Context, userID uint) error
}
