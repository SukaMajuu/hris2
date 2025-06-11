package subscription

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	subscriptionDto "github.com/SukaMajuu/hris/apps/backend/domain/dto/subscription"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestSubscriptionUseCase_GetSubscriptionPlans(t *testing.T) {
	ctx := context.Background()

	mockPlan := domain.SubscriptionPlan{
		ID:          1,
		Name:        "Basic Plan",
		PlanType:    enums.PlanStandard,
		Description: "Basic subscription plan",
		IsActive:    true,
		CreatedAt:   time.Now(),
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name             string
		mockPlans        []domain.SubscriptionPlan
		mockPlansError   error
		expectedResponse []subscriptionDto.SubscriptionPlanResponse
		expectedErrorMsg string
	}{
		{
			name:           "successful retrieval",
			mockPlans:      []domain.SubscriptionPlan{mockPlan},
			mockPlansError: nil,
			expectedResponse: []subscriptionDto.SubscriptionPlanResponse{
				{
					ID:          1,
					Name:        "Basic Plan",
					Type:        enums.PlanStandard,
					Description: "Basic subscription plan",
					Features:    nil,
					IsActive:    true,
					CreatedAt:   mockPlan.CreatedAt,
				},
			},
			expectedErrorMsg: "",
		},
		{
			name:             "repository returns error for plans",
			mockPlans:        nil,
			mockPlansError:   repoError,
			expectedResponse: nil,
			expectedErrorMsg: fmt.Errorf("failed to get subscription plans: %w", repoError).Error(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetSubscriptionPlans", ctx).
				Return(tt.mockPlans, tt.mockPlansError).Once()

			actualResponse, actualErr := uc.GetSubscriptionPlans(ctx)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				assert.Equal(t, tt.expectedResponse, actualResponse)
			}

			mockXenditRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_InitiateTrialCheckout(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	subscriptionPlanID := uint(1)
	seatPlanID := uint(1)

	mockSeatPlan := &domain.SeatPlan{
		ID:                 1,
		SubscriptionPlanID: 1,
		SizeTierID:         "small",
		MinEmployees:       1,
		MaxEmployees:       10,
		PricePerMonth:      decimal.NewFromInt(500000),
		PricePerYear:       decimal.NewFromInt(5000000),
		IsActive:           true,
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name                    string
		mockSeatPlan            *domain.SeatPlan
		mockGetSeatPlanError    error
		mockCreateCheckoutError error
		expectedSessionNonNil   bool
		expectedErrorMsg        string
	}{
		{
			name:                    "successful trial checkout initiation",
			mockSeatPlan:            mockSeatPlan,
			mockGetSeatPlanError:    nil,
			mockCreateCheckoutError: nil,
			expectedSessionNonNil:   true,
			expectedErrorMsg:        "",
		},
		{
			name:                    "seat plan not found",
			mockSeatPlan:            nil,
			mockGetSeatPlanError:    repoError,
			mockCreateCheckoutError: nil,
			expectedSessionNonNil:   false,
			expectedErrorMsg:        fmt.Errorf("failed to get seat plan: %w", repoError).Error(),
		},
		{
			name:                    "checkout session creation fails",
			mockSeatPlan:            mockSeatPlan,
			mockGetSeatPlanError:    nil,
			mockCreateCheckoutError: repoError,
			expectedSessionNonNil:   false,
			expectedErrorMsg:        fmt.Errorf("failed to create checkout session: %w", repoError).Error(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetSeatPlan", ctx, seatPlanID).
				Return(tt.mockSeatPlan, tt.mockGetSeatPlanError).Once()

			if tt.mockGetSeatPlanError == nil {
				mockXenditRepo.On("CreateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
					Return(tt.mockCreateCheckoutError).Once()
			}

			actualResponse, actualErr := uc.InitiateTrialCheckout(ctx, userID, subscriptionPlanID, seatPlanID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				if tt.expectedSessionNonNil {
					assert.NotNil(t, actualResponse)
					assert.True(t, actualResponse.IsTrialCheckout)
					assert.Equal(t, decimal.NewFromInt(0), actualResponse.Amount)
					assert.Equal(t, "IDR", actualResponse.Currency)
					assert.Equal(t, enums.CheckoutInitiated, actualResponse.Status)
				}
			}

			mockXenditRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_InitiatePaidCheckout(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	subscriptionPlanID := uint(1)
	seatPlanID := uint(1)
	isMonthly := true

	mockSeatPlan := &domain.SeatPlan{
		ID:                 1,
		SubscriptionPlanID: 1,
		SizeTierID:         "small",
		MinEmployees:       1,
		MaxEmployees:       10,
		PricePerMonth:      decimal.NewFromInt(500000),
		PricePerYear:       decimal.NewFromInt(5000000),
		IsActive:           true,
		SubscriptionPlan: domain.SubscriptionPlan{
			ID:   1,
			Name: "Basic Plan",
		},
	}

	mockUser := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockMidtransSnap := &interfaces.MidtransSnapResponse{
		Token:       "snap_token_123",
		RedirectURL: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap_token_123",
	}

	repoError := errors.New("repository database error")
	midtransError := errors.New("midtrans service error")

	tests := []struct {
		name                    string
		mockSeatPlan            *domain.SeatPlan
		mockGetSeatPlanError    error
		mockCreateCheckoutError error
		mockUser                *domain.User
		mockGetUserError        error
		mockMidtransSnap        *interfaces.MidtransSnapResponse
		mockMidtransError       error
		mockUpdateCheckoutError error
		expectedResponseNonNil  bool
		expectedErrorMsg        string
	}{
		{
			name:                    "successful paid checkout initiation",
			mockSeatPlan:            mockSeatPlan,
			mockGetSeatPlanError:    nil,
			mockCreateCheckoutError: nil,
			mockUser:                mockUser,
			mockGetUserError:        nil,
			mockMidtransSnap:        mockMidtransSnap,
			mockMidtransError:       nil,
			mockUpdateCheckoutError: nil,
			expectedResponseNonNil:  true,
			expectedErrorMsg:        "",
		},
		{
			name:                    "seat plan not found",
			mockSeatPlan:            nil,
			mockGetSeatPlanError:    repoError,
			mockCreateCheckoutError: nil,
			mockUser:                nil,
			mockGetUserError:        nil,
			mockMidtransSnap:        nil,
			mockMidtransError:       nil,
			mockUpdateCheckoutError: nil,
			expectedResponseNonNil:  false,
			expectedErrorMsg:        fmt.Errorf("failed to get seat plan: %w", repoError).Error(),
		},
		{
			name:                    "midtrans snap creation fails",
			mockSeatPlan:            mockSeatPlan,
			mockGetSeatPlanError:    nil,
			mockCreateCheckoutError: nil,
			mockUser:                mockUser,
			mockGetUserError:        nil,
			mockMidtransSnap:        nil,
			mockMidtransError:       midtransError,
			mockUpdateCheckoutError: nil,
			expectedResponseNonNil:  false,
			expectedErrorMsg:        fmt.Errorf("failed to create Midtrans Snap transaction: %w", midtransError).Error(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetSeatPlan", ctx, seatPlanID).
				Return(tt.mockSeatPlan, tt.mockGetSeatPlanError).Once()

			if tt.mockGetSeatPlanError == nil {
				mockXenditRepo.On("CreateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
					Return(tt.mockCreateCheckoutError).Once()

				if tt.mockCreateCheckoutError == nil {
					mockAuthRepo.On("GetUserByID", ctx, userID).
						Return(tt.mockUser, tt.mockGetUserError).Once()

					if tt.mockGetUserError == nil {
						mockMidtransClient.On("CreateSnapTransaction", ctx, mock.AnythingOfType("interfaces.MidtransSnapRequest")).
							Return(tt.mockMidtransSnap, tt.mockMidtransError).Once()

						if tt.mockMidtransError == nil {
							mockXenditRepo.On("UpdateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
								Return(tt.mockUpdateCheckoutError).Once()
						}
					}
				}
			}

			actualResponse, actualErr := uc.InitiatePaidCheckout(ctx, userID, subscriptionPlanID, seatPlanID, isMonthly)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				if tt.expectedResponseNonNil {
					assert.NotNil(t, actualResponse)
					assert.NotNil(t, actualResponse.CheckoutSession)
					assert.NotNil(t, actualResponse.Invoice)
					assert.False(t, actualResponse.CheckoutSession.IsTrialCheckout)
					assert.Equal(t, mockSeatPlan.PricePerMonth, actualResponse.CheckoutSession.Amount)
					assert.Equal(t, "IDR", actualResponse.CheckoutSession.Currency)
				}
			}

			mockXenditRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_CompleteTrialCheckout(t *testing.T) {
	ctx := context.Background()
	sessionID := uuid.New().String()

	mockCheckoutSession := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             1,
		SubscriptionPlanID: 1,
		SeatPlanID:         1,
		IsTrialCheckout:    true,
		Amount:             decimal.NewFromInt(0),
		Currency:           "IDR",
		Status:             enums.CheckoutInitiated,
		InitiatedAt:        time.Now(),
	}

	mockBillingInfo := &domain.CustomerBillingInfo{
		CompanyName:         "Test Company",
		CompanyAddress:      "Test Address",
		CompanyEmail:        "test@company.com",
		BillingContactName:  "Test Contact",
		BillingContactEmail: "test@company.com",
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name                        string
		sessionID                   string
		mockCheckoutSession         *domain.CheckoutSession
		mockGetSessionError         error
		mockCreateSubscriptionError error
		mockCreateBillingError      error
		mockCreateTrialError        error
		mockUpdateSessionError      error
		expectedResponseNonNil      bool
		expectedErrorMsg            string
	}{
		{
			name:                        "successful trial completion",
			sessionID:                   sessionID,
			mockCheckoutSession:         mockCheckoutSession,
			mockGetSessionError:         nil,
			mockCreateSubscriptionError: nil,
			mockCreateBillingError:      nil,
			mockCreateTrialError:        nil,
			mockUpdateSessionError:      nil,
			expectedResponseNonNil:      true,
			expectedErrorMsg:            "",
		},
		{
			name:                        "checkout session not found",
			sessionID:                   sessionID,
			mockCheckoutSession:         nil,
			mockGetSessionError:         repoError,
			mockCreateSubscriptionError: nil,
			mockCreateBillingError:      nil,
			mockCreateTrialError:        nil,
			mockUpdateSessionError:      nil,
			expectedResponseNonNil:      false,
			expectedErrorMsg:            fmt.Errorf("failed to get checkout session: %w", repoError).Error(),
		},
		{
			name:      "session is not for trial checkout",
			sessionID: sessionID,
			mockCheckoutSession: &domain.CheckoutSession{
				SessionID:          sessionID,
				UserID:             1,
				SubscriptionPlanID: 1,
				SeatPlanID:         1,
				IsTrialCheckout:    false, // Not a trial checkout
				Status:             enums.CheckoutInitiated,
			},
			mockGetSessionError:         nil,
			mockCreateSubscriptionError: nil,
			mockCreateBillingError:      nil,
			mockCreateTrialError:        nil,
			mockUpdateSessionError:      nil,
			expectedResponseNonNil:      false,
			expectedErrorMsg:            "session is not for trial checkout",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetCheckoutSession", ctx, tt.sessionID).
				Return(tt.mockCheckoutSession, tt.mockGetSessionError).Once()

			if tt.mockGetSessionError == nil && tt.mockCheckoutSession != nil && tt.mockCheckoutSession.IsTrialCheckout && tt.mockCheckoutSession.Status == enums.CheckoutInitiated {
				mockXenditRepo.On("CreateSubscription", ctx, mock.AnythingOfType("*domain.Subscription")).
					Return(tt.mockCreateSubscriptionError).Once()

				if tt.mockCreateSubscriptionError == nil {
					mockXenditRepo.On("CreateCustomerBillingInfo", ctx, mock.AnythingOfType("*domain.CustomerBillingInfo")).
						Return(tt.mockCreateBillingError).Once()

					if tt.mockCreateBillingError == nil {
						mockXenditRepo.On("CreateTrialActivity", ctx, mock.AnythingOfType("*domain.TrialActivity")).
							Return(tt.mockCreateTrialError).Once()

						if tt.mockCreateTrialError == nil {
							mockXenditRepo.On("UpdateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
								Return(tt.mockUpdateSessionError).Once()
						}
					}
				}
			}

			actualResponse, actualErr := uc.CompleteTrialCheckout(ctx, tt.sessionID, mockBillingInfo)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				if tt.expectedResponseNonNil {
					assert.NotNil(t, actualResponse)
					assert.Equal(t, enums.StatusTrial, actualResponse.Status)
					assert.True(t, actualResponse.IsInTrial)
				}
			}

			mockXenditRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_ProcessPaymentWebhook(t *testing.T) {
	ctx := context.Background()

	tests := []struct {
		name             string
		webhookData      map[string]interface{}
		expectedErrorMsg string
	}{
		{
			name: "missing webhook_type",
			webhookData: map[string]interface{}{
				"id": "inv_123",
			},
			expectedErrorMsg: "missing webhook_type",
		},
		{
			name: "unsupported webhook type",
			webhookData: map[string]interface{}{
				"webhook_type": "unsupported.event",
				"id":           "inv_123",
			},
			expectedErrorMsg: "unsupported webhook type: unsupported.event",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			actualErr := uc.ProcessPaymentWebhook(ctx, tt.webhookData)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
			} else {
				assert.NoError(t, actualErr)
			}

			mockXenditRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_ProcessMidtransWebhook(t *testing.T) {
	ctx := context.Background()
	sessionID := uuid.New().String()
	orderID := fmt.Sprintf("HRIS-%s", sessionID)

	mockCheckoutSession := &domain.CheckoutSession{
		SessionID:          sessionID,
		UserID:             1,
		SubscriptionPlanID: 1,
		SeatPlanID:         1,
		IsTrialCheckout:    false,
		Amount:             decimal.NewFromInt(500000),
		Currency:           "IDR",
		Status:             enums.CheckoutPending,
		InitiatedAt:        time.Now().UTC(),
	}

	mockSubscription := &domain.Subscription{
		ID:                   1,
		AdminUserID:          1,
		SubscriptionPlanID:   1,
		SeatPlanID:           1,
		Status:               enums.StatusTrial,
		StartDate:            time.Now().UTC(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 0,
	}

	mockSeatPlan := &domain.SeatPlan{
		ID:                 1,
		SubscriptionPlanID: 1,
		SizeTierID:         "small",
		MinEmployees:       1,
		MaxEmployees:       10,
		PricePerMonth:      decimal.NewFromInt(500000),
		PricePerYear:       decimal.NewFromInt(5000000),
		IsActive:           true,
		SubscriptionPlan: domain.SubscriptionPlan{
			ID:   1,
			Name: "Basic Plan",
		},
	}

	mockUser := &domain.User{
		ID:    1,
		Email: "test@example.com",
	}

	tests := []struct {
		name                              string
		notification                      map[string]interface{}
		mockCheckoutSession               *domain.CheckoutSession
		mockGetCheckoutSessionError       error
		mockSubscription                  *domain.Subscription
		mockGetSubscriptionError          error
		mockSeatPlan                      *domain.SeatPlan
		mockGetSeatPlanError              error
		mockUser                          *domain.User
		mockGetUserError                  error
		mockCreateSubscriptionError       error
		mockUpdateSubscriptionError       error
		mockCreatePaymentTransactionError error
		mockUpdateCheckoutSessionError    error
		mockCreateBillingInfoError        error
		expectedErrorMsg                  string
	}{
		{
			name: "successful payment settlement",
			notification: map[string]interface{}{
				"order_id":           orderID,
				"transaction_status": "settlement",
				"transaction_id":     "12345",
				"payment_type":       "bank_transfer",
				"transaction_time":   "2023-01-01 10:00:00",
				"gross_amount":       "500000",
			},
			mockCheckoutSession:               mockCheckoutSession,
			mockGetCheckoutSessionError:       nil,
			mockSubscription:                  nil,
			mockGetSubscriptionError:          errors.New("subscription not found"), // No existing subscription
			mockSeatPlan:                      mockSeatPlan,
			mockGetSeatPlanError:              nil,
			mockUser:                          mockUser,
			mockGetUserError:                  nil,
			mockCreateSubscriptionError:       nil,
			mockCreatePaymentTransactionError: nil,
			mockUpdateCheckoutSessionError:    nil,
			mockCreateBillingInfoError:        nil,
			expectedErrorMsg:                  "",
		},
		{
			name: "missing order_id",
			notification: map[string]interface{}{
				"transaction_status": "settlement",
			},
			expectedErrorMsg: "missing order_id",
		},
		{
			name: "missing transaction_status",
			notification: map[string]interface{}{
				"order_id": orderID,
			},
			expectedErrorMsg: "missing transaction_status",
		},
		{
			name: "invalid order ID format",
			notification: map[string]interface{}{
				"order_id":           "INVALID-FORMAT",
				"transaction_status": "settlement",
			},
			expectedErrorMsg: "invalid order ID format: INVALID-FORMAT",
		},
		{
			name: "checkout session not found",
			notification: map[string]interface{}{
				"order_id":           orderID,
				"transaction_status": "settlement",
			},
			mockCheckoutSession:         nil,
			mockGetCheckoutSessionError: errors.New("session not found"),
			expectedErrorMsg:            "failed to get checkout session: session not found",
		},
		{
			name: "trial conversion success",
			notification: map[string]interface{}{
				"order_id":           orderID,
				"transaction_status": "settlement",
				"transaction_id":     "12345",
				"payment_type":       "bank_transfer",
				"transaction_time":   "2023-01-01 10:00:00",
				"gross_amount":       "500000",
			},
			mockCheckoutSession:               mockCheckoutSession,
			mockGetCheckoutSessionError:       nil,
			mockSubscription:                  mockSubscription,
			mockGetSubscriptionError:          nil,
			mockSeatPlan:                      mockSeatPlan,
			mockGetSeatPlanError:              nil,
			mockUser:                          mockUser,
			mockGetUserError:                  nil,
			mockUpdateSubscriptionError:       nil,
			mockCreatePaymentTransactionError: nil,
			mockUpdateCheckoutSessionError:    nil,
			expectedErrorMsg:                  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			if orderID, exists := tt.notification["order_id"].(string); exists && len(orderID) >= 6 && orderID[:5] == "HRIS-" {
				sessionID := orderID[5:]
				mockXenditRepo.On("GetCheckoutSession", ctx, sessionID).
					Return(tt.mockCheckoutSession, tt.mockGetCheckoutSessionError).Maybe()

				if tt.mockGetCheckoutSessionError == nil && tt.mockCheckoutSession != nil {
					mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, tt.mockCheckoutSession.UserID).
						Return(tt.mockSubscription, tt.mockGetSubscriptionError).Maybe()

					if tt.mockGetSubscriptionError != nil {
						// New subscription flow
						mockXenditRepo.On("GetSeatPlan", ctx, tt.mockCheckoutSession.SeatPlanID).
							Return(tt.mockSeatPlan, tt.mockGetSeatPlanError).Maybe()

						if tt.mockGetSeatPlanError == nil {
							mockXenditRepo.On("CreateSubscription", ctx, mock.AnythingOfType("*domain.Subscription")).
								Return(tt.mockCreateSubscriptionError).Maybe()

							mockAuthRepo.On("GetUserByID", ctx, tt.mockCheckoutSession.UserID).
								Return(tt.mockUser, tt.mockGetUserError).Maybe()

							if tt.mockGetUserError == nil {
								mockXenditRepo.On("CreateCustomerBillingInfo", ctx, mock.AnythingOfType("*domain.CustomerBillingInfo")).
									Return(tt.mockCreateBillingInfoError).Maybe()
							}
						}
					} else if tt.mockSubscription != nil {
						// Trial conversion flow
						switch tt.mockSubscription.Status {
						case enums.StatusTrial:
							mockXenditRepo.On("UpdateSubscriptionFields", ctx, tt.mockSubscription.ID, mock.AnythingOfType("map[string]interface {}")).
								Return(tt.mockUpdateSubscriptionError).Maybe()

							// Mock verification call after update
							if tt.mockUpdateSubscriptionError == nil {
								mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, tt.mockCheckoutSession.UserID).
									Return(tt.mockSubscription, nil).Maybe()
							}

							mockXenditRepo.On("GetTrialActivityBySubscription", ctx, tt.mockSubscription.ID).
								Return(&domain.TrialActivity{}, nil).Maybe()

							mockXenditRepo.On("UpdateTrialActivity", ctx, mock.AnythingOfType("*domain.TrialActivity")).
								Return(nil).Maybe()
						case enums.StatusActive:
							// Active subscription upgrade flow
							mockXenditRepo.On("UpdateSubscriptionFields", ctx, tt.mockSubscription.ID, mock.AnythingOfType("map[string]interface {}")).
								Return(tt.mockUpdateSubscriptionError).Maybe()

							// Mock verification call after update
							if tt.mockUpdateSubscriptionError == nil {
								mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, tt.mockCheckoutSession.UserID).
									Return(tt.mockSubscription, nil).Maybe()
							}
						}
					}

					// Payment transaction creation
					mockXenditRepo.On("CreatePaymentTransaction", ctx, mock.AnythingOfType("*domain.PaymentTransaction")).
						Return(tt.mockCreatePaymentTransactionError).Maybe()

					// Checkout session update
					mockXenditRepo.On("UpdateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
						Return(tt.mockUpdateCheckoutSessionError).Maybe()
				}
			}

			actualErr := uc.ProcessMidtransWebhook(ctx, tt.notification)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.Contains(t, actualErr.Error(), tt.expectedErrorMsg)
			} else {
				assert.NoError(t, actualErr)
			}

			mockXenditRepo.AssertExpectations(t)
			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_PreviewSubscriptionPlanChange(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	currentPlanID := uint(1)
	newPlanID := uint(2)

	mockCurrentSubscription := &domain.Subscription{
		ID:                   1,
		AdminUserID:          userID,
		SubscriptionPlanID:   currentPlanID,
		SeatPlanID:           1,
		Status:               enums.StatusActive,
		StartDate:            time.Now().UTC(),
		NextBillingDate:      func() *time.Time { t := time.Now().UTC().AddDate(0, 1, 0); return &t }(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 5,
		SubscriptionPlan: domain.SubscriptionPlan{
			ID:       currentPlanID,
			Name:     "Standard Plan",
			PlanType: enums.PlanStandard,
		},
		SeatPlan: domain.SeatPlan{
			ID:                 1,
			SubscriptionPlanID: currentPlanID,
			MinEmployees:       1,
			MaxEmployees:       10,
			PricePerMonth:      decimal.NewFromInt(100000),
			PricePerYear:       decimal.NewFromInt(1000000),
		},
	}

	mockNewPlan := &domain.SubscriptionPlan{
		ID:       newPlanID,
		Name:     "Premium Plan",
		PlanType: enums.PlanPremium,
	}

	mockNewSeatPlans := []domain.SeatPlan{
		{
			ID:                 2,
			SubscriptionPlanID: newPlanID,
			MinEmployees:       1,
			MaxEmployees:       10,
			PricePerMonth:      decimal.NewFromInt(180000),
			PricePerYear:       decimal.NewFromInt(1800000),
		},
	}

	tests := []struct {
		name                     string
		isMonthly                bool
		mockCurrentSubscription  *domain.Subscription
		mockGetSubscriptionError error
		mockNewPlan              *domain.SubscriptionPlan
		mockGetNewPlanError      error
		mockNewSeatPlans         []domain.SeatPlan
		mockGetNewSeatPlansError error
		expectedIsUpgrade        bool
		expectedPriceDifference  decimal.Decimal
		expectedRequiresPayment  bool
		expectedErrorMsg         string
	}{
		{
			name:                     "successful upgrade preview - monthly",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewPlan:              mockNewPlan,
			mockGetNewPlanError:      nil,
			mockNewSeatPlans:         mockNewSeatPlans,
			mockGetNewSeatPlansError: nil,
			expectedIsUpgrade:        true,
			expectedPriceDifference:  decimal.NewFromInt(80000), // 180000 - 100000
			expectedRequiresPayment:  true,
			expectedErrorMsg:         "",
		},
		{
			name:      "successful downgrade preview - yearly",
			isMonthly: false,
			mockCurrentSubscription: &domain.Subscription{
				ID:                 1,
				AdminUserID:        userID,
				SubscriptionPlanID: newPlanID, // Currently on premium
				SeatPlanID:         2,
				Status:             enums.StatusActive,
				SubscriptionPlan: domain.SubscriptionPlan{
					ID:       newPlanID,
					Name:     "Premium Plan",
					PlanType: enums.PlanPremium,
				},
				SeatPlan: domain.SeatPlan{
					ID:                 2,
					SubscriptionPlanID: newPlanID,
					MinEmployees:       1,
					MaxEmployees:       10,
					PricePerMonth:      decimal.NewFromInt(180000),
					PricePerYear:       decimal.NewFromInt(1800000),
				},
			},
			mockGetSubscriptionError: nil,
			mockNewPlan: &domain.SubscriptionPlan{
				ID:       currentPlanID,
				Name:     "Standard Plan",
				PlanType: enums.PlanStandard,
			},
			mockGetNewPlanError: nil,
			mockNewSeatPlans: []domain.SeatPlan{
				{
					ID:                 1,
					SubscriptionPlanID: currentPlanID,
					MinEmployees:       1,
					MaxEmployees:       10,
					PricePerMonth:      decimal.NewFromInt(100000),
					PricePerYear:       decimal.NewFromInt(1000000),
				},
			},
			mockGetNewSeatPlansError: nil,
			expectedIsUpgrade:        false,
			expectedPriceDifference:  decimal.NewFromInt(-800000), // 1000000 - 1800000
			expectedRequiresPayment:  false,
			expectedErrorMsg:         "",
		},
		{
			name:                     "subscription not found",
			isMonthly:                true,
			mockCurrentSubscription:  nil,
			mockGetSubscriptionError: errors.New("subscription not found"),
			expectedErrorMsg:         "failed to get current subscription: subscription not found",
		},
		{
			name:                     "new plan not found",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewPlan:              nil,
			mockGetNewPlanError:      errors.New("plan not found"),
			expectedErrorMsg:         "failed to get new subscription plan: plan not found",
		},
		{
			name:                     "no matching seat plan found",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewPlan:              mockNewPlan,
			mockGetNewPlanError:      nil,
			mockNewSeatPlans: []domain.SeatPlan{
				{
					ID:                 3,
					SubscriptionPlanID: newPlanID,
					MinEmployees:       11, // Different employee range
					MaxEmployees:       50,
					PricePerMonth:      decimal.NewFromInt(300000),
					PricePerYear:       decimal.NewFromInt(3000000),
				},
			},
			mockGetNewSeatPlansError: nil,
			expectedErrorMsg:         "no matching seat plan found for new subscription plan",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
				Return(tt.mockCurrentSubscription, tt.mockGetSubscriptionError).Once()

			if tt.mockGetSubscriptionError == nil {
				mockXenditRepo.On("GetSubscriptionPlan", ctx, newPlanID).
					Return(tt.mockNewPlan, tt.mockGetNewPlanError).Once()

				if tt.mockGetNewPlanError == nil {
					mockXenditRepo.On("GetSeatPlansBySubscriptionPlan", ctx, newPlanID).
						Return(tt.mockNewSeatPlans, tt.mockGetNewSeatPlansError).Once()
				}
			}

			actualResponse, actualErr := uc.PreviewSubscriptionPlanChange(ctx, userID, newPlanID, nil, tt.isMonthly)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.Contains(t, actualErr.Error(), tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				assert.NotNil(t, actualResponse)
				assert.Equal(t, tt.expectedIsUpgrade, actualResponse.IsUpgrade)
				assert.Equal(t, tt.expectedPriceDifference, actualResponse.PriceDifference)
				assert.Equal(t, tt.expectedRequiresPayment, actualResponse.RequiresPayment)
			}

			mockXenditRepo.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_PreviewSeatPlanChange(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	currentSeatPlanID := uint(1)
	newSeatPlanID := uint(2)

	mockCurrentSubscription := &domain.Subscription{
		ID:                   1,
		AdminUserID:          userID,
		SubscriptionPlanID:   1,
		SeatPlanID:           currentSeatPlanID,
		Status:               enums.StatusActive,
		StartDate:            time.Now().UTC(),
		NextBillingDate:      func() *time.Time { t := time.Now().UTC().AddDate(0, 1, 0); return &t }(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 5,
		SubscriptionPlan: domain.SubscriptionPlan{
			ID:       1,
			Name:     "Standard Plan",
			PlanType: enums.PlanStandard,
		},
		SeatPlan: domain.SeatPlan{
			ID:                 currentSeatPlanID,
			SubscriptionPlanID: 1,
			MinEmployees:       1,
			MaxEmployees:       10,
			PricePerMonth:      decimal.NewFromInt(100000),
			PricePerYear:       decimal.NewFromInt(1000000),
		},
	}

	mockNewSeatPlan := &domain.SeatPlan{
		ID:                 newSeatPlanID,
		SubscriptionPlanID: 1, // Same subscription plan
		MinEmployees:       11,
		MaxEmployees:       50,
		PricePerMonth:      decimal.NewFromInt(300000),
		PricePerYear:       decimal.NewFromInt(3000000),
	}

	tests := []struct {
		name                     string
		isMonthly                bool
		mockCurrentSubscription  *domain.Subscription
		mockGetSubscriptionError error
		mockNewSeatPlan          *domain.SeatPlan
		mockGetNewSeatPlanError  error
		expectedIsUpgrade        bool
		expectedPriceDifference  decimal.Decimal
		expectedRequiresPayment  bool
		expectedErrorMsg         string
	}{
		{
			name:                     "successful seat upgrade preview - monthly",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewSeatPlan:          mockNewSeatPlan,
			mockGetNewSeatPlanError:  nil,
			expectedIsUpgrade:        true,
			expectedPriceDifference:  decimal.NewFromInt(200000), // 300000 - 100000
			expectedRequiresPayment:  true,
			expectedErrorMsg:         "",
		},
		{
			name:                     "seat plan belongs to different subscription plan",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewSeatPlan: &domain.SeatPlan{
				ID:                 newSeatPlanID,
				SubscriptionPlanID: 2, // Different subscription plan
				MinEmployees:       11,
				MaxEmployees:       50,
				PricePerMonth:      decimal.NewFromInt(300000),
				PricePerYear:       decimal.NewFromInt(3000000),
			},
			mockGetNewSeatPlanError: nil,
			expectedErrorMsg:        "seat plan does not belong to current subscription plan",
		},
		{
			name:                     "subscription not found",
			isMonthly:                true,
			mockCurrentSubscription:  nil,
			mockGetSubscriptionError: errors.New("subscription not found"),
			expectedErrorMsg:         "failed to get current subscription: subscription not found",
		},
		{
			name:                     "new seat plan not found",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewSeatPlan:          nil,
			mockGetNewSeatPlanError:  errors.New("seat plan not found"),
			expectedErrorMsg:         "failed to get new seat plan: seat plan not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
				Return(tt.mockCurrentSubscription, tt.mockGetSubscriptionError).Once()

			if tt.mockGetSubscriptionError == nil {
				mockXenditRepo.On("GetSeatPlan", ctx, newSeatPlanID).
					Return(tt.mockNewSeatPlan, tt.mockGetNewSeatPlanError).Once()
			}

			actualResponse, actualErr := uc.PreviewSeatPlanChange(ctx, userID, newSeatPlanID, tt.isMonthly)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.Contains(t, actualErr.Error(), tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				assert.NotNil(t, actualResponse)
				assert.Equal(t, tt.expectedIsUpgrade, actualResponse.IsUpgrade)
				assert.Equal(t, tt.expectedPriceDifference, actualResponse.PriceDifference)
				assert.Equal(t, tt.expectedRequiresPayment, actualResponse.RequiresPayment)
			}

			mockXenditRepo.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_ChangeSeatPlan(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	newSeatPlanID := uint(2)

	mockCurrentSubscription := &domain.Subscription{
		ID:                   1,
		AdminUserID:          userID,
		SubscriptionPlanID:   1,
		SeatPlanID:           1,
		Status:               enums.StatusActive,
		StartDate:            time.Now().UTC(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 5,
		SubscriptionPlan: domain.SubscriptionPlan{
			ID:       1,
			Name:     "Standard Plan",
			PlanType: enums.PlanStandard,
		},
		SeatPlan: domain.SeatPlan{
			ID:                 1,
			SubscriptionPlanID: 1,
			MinEmployees:       1,
			MaxEmployees:       10,
			PricePerMonth:      decimal.NewFromInt(100000),
			PricePerYear:       decimal.NewFromInt(1000000),
		},
	}

	mockNewSeatPlan := &domain.SeatPlan{
		ID:                 newSeatPlanID,
		SubscriptionPlanID: 1,
		MinEmployees:       11,
		MaxEmployees:       50,
		PricePerMonth:      decimal.NewFromInt(300000),
		PricePerYear:       decimal.NewFromInt(3000000),
	}

	mockUser := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockMidtransSnap := &interfaces.MidtransSnapResponse{
		Token:       "snap_token_123",
		RedirectURL: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap_token_123",
	}

	tests := []struct {
		name                            string
		isMonthly                       bool
		mockCurrentSubscription         *domain.Subscription
		mockGetSubscriptionError        error
		mockNewSeatPlan                 *domain.SeatPlan
		mockGetNewSeatPlanError         error
		mockUpdatedSubscription         *domain.Subscription
		mockGetUpdatedSubscriptionError error
		mockUser                        *domain.User
		mockGetUserError                error
		mockMidtransSnap                *interfaces.MidtransSnapResponse
		mockMidtransError               error
		mockCreateCheckoutError         error
		mockUpdateCheckoutError         error
		mockUpdateSubscriptionError     error
		expectedPaymentRequired         bool
		expectedErrorMsg                string
	}{
		{
			name:                     "successful seat upgrade with payment",
			isMonthly:                true,
			mockCurrentSubscription:  mockCurrentSubscription,
			mockGetSubscriptionError: nil,
			mockNewSeatPlan:          mockNewSeatPlan,
			mockGetNewSeatPlanError:  nil,
			mockUser:                 mockUser,
			mockGetUserError:         nil,
			mockMidtransSnap:         mockMidtransSnap,
			mockMidtransError:        nil,
			mockCreateCheckoutError:  nil,
			mockUpdateCheckoutError:  nil,
			expectedPaymentRequired:  true,
			expectedErrorMsg:         "",
		},
		{
			name:      "successful seat downgrade without payment",
			isMonthly: true,
			mockCurrentSubscription: &domain.Subscription{
				ID:                   1,
				AdminUserID:          userID,
				SubscriptionPlanID:   1,
				SeatPlanID:           2, // Currently on higher tier
				Status:               enums.StatusActive,
				StartDate:            time.Now().UTC(),
				IsAutoRenew:          true,
				CurrentEmployeeCount: 5,
				SubscriptionPlan: domain.SubscriptionPlan{
					ID:       1,
					Name:     "Standard Plan",
					PlanType: enums.PlanStandard,
				},
				SeatPlan: domain.SeatPlan{
					ID:                 2,
					SubscriptionPlanID: 1,
					MinEmployees:       11,
					MaxEmployees:       50,
					PricePerMonth:      decimal.NewFromInt(300000),
					PricePerYear:       decimal.NewFromInt(3000000),
				},
			},
			mockGetSubscriptionError: nil,
			mockNewSeatPlan: &domain.SeatPlan{
				ID:                 1,
				SubscriptionPlanID: 1,
				MinEmployees:       1,
				MaxEmployees:       10,
				PricePerMonth:      decimal.NewFromInt(100000),
				PricePerYear:       decimal.NewFromInt(1000000),
			},
			mockGetNewSeatPlanError: nil,
			mockUpdatedSubscription: &domain.Subscription{
				ID:                   1,
				AdminUserID:          userID,
				SubscriptionPlanID:   1,
				SeatPlanID:           1, // Updated to new seat plan
				Status:               enums.StatusActive,
				StartDate:            time.Now().UTC(),
				IsAutoRenew:          true,
				CurrentEmployeeCount: 5,
			},
			mockGetUpdatedSubscriptionError: nil,
			mockUpdateSubscriptionError:     nil,
			expectedPaymentRequired:         false,
			expectedErrorMsg:                "",
		},
		{
			name:      "cannot downgrade - employee count exceeds limit",
			isMonthly: true,
			mockCurrentSubscription: &domain.Subscription{
				ID:                   1,
				AdminUserID:          userID,
				SubscriptionPlanID:   1,
				SeatPlanID:           2,
				Status:               enums.StatusActive,
				StartDate:            time.Now().UTC(),
				IsAutoRenew:          true,
				CurrentEmployeeCount: 15, // More than new seat plan limit
				SubscriptionPlan: domain.SubscriptionPlan{
					ID:       1,
					Name:     "Standard Plan",
					PlanType: enums.PlanStandard,
				},
				SeatPlan: domain.SeatPlan{
					ID:                 2,
					SubscriptionPlanID: 1,
					MinEmployees:       11,
					MaxEmployees:       50,
					PricePerMonth:      decimal.NewFromInt(300000),
					PricePerYear:       decimal.NewFromInt(3000000),
				},
			},
			mockGetSubscriptionError: nil,
			mockNewSeatPlan: &domain.SeatPlan{
				ID:                 1,
				SubscriptionPlanID: 1,
				MinEmployees:       1,
				MaxEmployees:       10, // Less than current employee count
				PricePerMonth:      decimal.NewFromInt(100000),
				PricePerYear:       decimal.NewFromInt(1000000),
			},
			mockGetNewSeatPlanError: nil,
			expectedErrorMsg:        "cannot downgrade: current employee count (15) exceeds new seat plan limit (10)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			// Mock preview calls
			mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
				Return(tt.mockCurrentSubscription, tt.mockGetSubscriptionError).Once()

			if tt.mockGetSubscriptionError == nil {
				mockXenditRepo.On("GetSeatPlan", ctx, newSeatPlanID).
					Return(tt.mockNewSeatPlan, tt.mockGetNewSeatPlanError).Once()
			}

			// Mock actual operation calls
			if tt.mockGetSubscriptionError == nil && tt.mockGetNewSeatPlanError == nil && tt.expectedErrorMsg == "" {
				mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
					Return(tt.mockCurrentSubscription, nil).Once()

				if tt.expectedPaymentRequired {
					// Payment required flow
					mockXenditRepo.On("CreateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
						Return(tt.mockCreateCheckoutError).Once()

					if tt.mockCreateCheckoutError == nil {
						mockAuthRepo.On("GetUserByID", ctx, userID).
							Return(tt.mockUser, tt.mockGetUserError).Once()

						if tt.mockGetUserError == nil {
							mockMidtransClient.On("CreateSnapTransaction", ctx, mock.AnythingOfType("interfaces.MidtransSnapRequest")).
								Return(tt.mockMidtransSnap, tt.mockMidtransError).Once()

							if tt.mockMidtransError == nil {
								mockXenditRepo.On("UpdateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
									Return(tt.mockUpdateCheckoutError).Once()

								// Add mock for GetCheckoutSession reload after update
								if tt.mockUpdateCheckoutError == nil {
									mockUpdatedSession := &domain.CheckoutSession{
										SessionID:          "test-session-id",
										UserID:             userID,
										SubscriptionPlanID: tt.mockCurrentSubscription.SubscriptionPlanID,
										SeatPlanID:         newSeatPlanID,
										IsTrialCheckout:    false,
										Amount:             decimal.NewFromInt(200000), // Price difference for upgrade
										Currency:           "IDR",
										Status:             enums.CheckoutPending,
										PaymentToken:       func() *string { s := "snap_token_123"; return &s }(),
										PaymentURL:         func() *string { s := "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap_token_123"; return &s }(),
									}
									mockXenditRepo.On("GetCheckoutSession", ctx, mock.AnythingOfType("string")).
										Return(mockUpdatedSession, nil).Once()
								}
							}
						}
					}
				} else {
					// No payment required flow
					mockXenditRepo.On("UpdateSubscription", ctx, mock.AnythingOfType("*domain.Subscription")).
						Return(tt.mockUpdateSubscriptionError).Once()

					if tt.mockUpdateSubscriptionError == nil {
						mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
							Return(tt.mockUpdatedSubscription, tt.mockGetUpdatedSubscriptionError).Once()
					}
				}
			}

			// For error cases that occur after preview, we still need the second GetSubscriptionByAdminUserID call
			if tt.mockGetSubscriptionError == nil && tt.mockGetNewSeatPlanError == nil && tt.expectedErrorMsg != "" {
				mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
					Return(tt.mockCurrentSubscription, nil).Once()
			}

			actualResponse, actualErr := uc.ChangeSeatPlan(ctx, userID, newSeatPlanID, tt.isMonthly)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.Contains(t, actualErr.Error(), tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				assert.NotNil(t, actualResponse)
				assert.Equal(t, tt.expectedPaymentRequired, actualResponse.PaymentRequired)
				if tt.expectedPaymentRequired {
					assert.NotNil(t, actualResponse.CheckoutSession)
					assert.NotNil(t, actualResponse.Invoice)
				}
			}

			mockXenditRepo.AssertExpectations(t)
			mockAuthRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_ConvertTrialToPaid(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	newPlanID := uint(2)
	newSeatPlanID := uint(2)

	mockTrialSubscription := &domain.Subscription{
		ID:                   1,
		AdminUserID:          userID,
		SubscriptionPlanID:   1,
		SeatPlanID:           1,
		Status:               enums.StatusTrial,
		StartDate:            time.Now().UTC(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 1,
	}

	mockTargetSeatPlan := &domain.SeatPlan{
		ID:                 newSeatPlanID,
		SubscriptionPlanID: newPlanID,
		MinEmployees:       1,
		MaxEmployees:       10,
		PricePerMonth:      decimal.NewFromInt(180000),
		PricePerYear:       decimal.NewFromInt(1800000),
		SubscriptionPlan: domain.SubscriptionPlan{
			ID:   newPlanID,
			Name: "Premium Plan",
		},
	}

	mockUser := &domain.User{
		ID:    userID,
		Email: "test@example.com",
	}

	mockMidtransSnap := &interfaces.MidtransSnapResponse{
		Token:       "snap_token_123",
		RedirectURL: "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap_token_123",
	}

	tests := []struct {
		name                     string
		newPlanID                *uint
		newSeatPlanID            *uint
		isMonthly                bool
		mockTrialSubscription    *domain.Subscription
		mockGetSubscriptionError error
		mockTargetSeatPlan       *domain.SeatPlan
		mockGetSeatPlanError     error
		mockUser                 *domain.User
		mockGetUserError         error
		mockMidtransSnap         *interfaces.MidtransSnapResponse
		mockMidtransError        error
		mockCreateCheckoutError  error
		mockUpdateCheckoutError  error
		expectedAmount           decimal.Decimal
		expectedErrorMsg         string
	}{
		{
			name:                     "successful trial conversion with plan change - monthly",
			newPlanID:                &newPlanID,
			newSeatPlanID:            &newSeatPlanID,
			isMonthly:                true,
			mockTrialSubscription:    mockTrialSubscription,
			mockGetSubscriptionError: nil,
			mockTargetSeatPlan:       mockTargetSeatPlan,
			mockGetSeatPlanError:     nil,
			mockUser:                 mockUser,
			mockGetUserError:         nil,
			mockMidtransSnap:         mockMidtransSnap,
			mockMidtransError:        nil,
			mockCreateCheckoutError:  nil,
			mockUpdateCheckoutError:  nil,
			expectedAmount:           decimal.NewFromInt(180000),
			expectedErrorMsg:         "",
		},
		{
			name:                     "trial conversion with current plan - yearly",
			newPlanID:                nil,
			newSeatPlanID:            nil,
			isMonthly:                false,
			mockTrialSubscription:    mockTrialSubscription,
			mockGetSubscriptionError: nil,
			mockTargetSeatPlan: &domain.SeatPlan{
				ID:                 1,
				SubscriptionPlanID: 1,
				MinEmployees:       1,
				MaxEmployees:       10,
				PricePerMonth:      decimal.NewFromInt(100000),
				PricePerYear:       decimal.NewFromInt(1000000),
				SubscriptionPlan: domain.SubscriptionPlan{
					ID:   1,
					Name: "Standard Plan",
				},
			},
			mockGetSeatPlanError:    nil,
			mockUser:                mockUser,
			mockGetUserError:        nil,
			mockMidtransSnap:        mockMidtransSnap,
			mockMidtransError:       nil,
			mockCreateCheckoutError: nil,
			mockUpdateCheckoutError: nil,
			expectedAmount:          decimal.NewFromInt(1000000),
			expectedErrorMsg:        "",
		},
		{
			name: "subscription is not in trial status",
			mockTrialSubscription: &domain.Subscription{
				ID:                   1,
				AdminUserID:          userID,
				SubscriptionPlanID:   1,
				SeatPlanID:           1,
				Status:               enums.StatusActive, // Not trial
				StartDate:            time.Now().UTC(),
				IsAutoRenew:          true,
				CurrentEmployeeCount: 1,
			},
			mockGetSubscriptionError: nil,
			expectedErrorMsg:         "subscription is not in trial status",
		},
		{
			name:                     "subscription not found",
			mockTrialSubscription:    nil,
			mockGetSubscriptionError: errors.New("subscription not found"),
			expectedErrorMsg:         "failed to get current subscription: subscription not found",
		},
		{
			name:                     "target seat plan not found",
			newSeatPlanID:            &newSeatPlanID,
			mockTrialSubscription:    mockTrialSubscription,
			mockGetSubscriptionError: nil,
			mockTargetSeatPlan:       nil,
			mockGetSeatPlanError:     errors.New("seat plan not found"),
			expectedErrorMsg:         "failed to get target seat plan: seat plan not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockMidtransClient := new(mocks.MidtransClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockEmployeeRepo, mockAuthRepo, mockMidtransClient)

			mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, userID).
				Return(tt.mockTrialSubscription, tt.mockGetSubscriptionError).Once()

			if tt.mockGetSubscriptionError == nil && tt.mockTrialSubscription != nil && tt.mockTrialSubscription.Status == enums.StatusTrial {
				targetSeatPlanID := tt.mockTrialSubscription.SeatPlanID
				if tt.newSeatPlanID != nil {
					targetSeatPlanID = *tt.newSeatPlanID
				}

				mockXenditRepo.On("GetSeatPlan", ctx, targetSeatPlanID).
					Return(tt.mockTargetSeatPlan, tt.mockGetSeatPlanError).Once()

				if tt.mockGetSeatPlanError == nil {
					mockXenditRepo.On("CreateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
						Return(tt.mockCreateCheckoutError).Once()

					if tt.mockCreateCheckoutError == nil {
						mockAuthRepo.On("GetUserByID", ctx, userID).
							Return(tt.mockUser, tt.mockGetUserError).Once()

						if tt.mockGetUserError == nil {
							mockMidtransClient.On("CreateSnapTransaction", ctx, mock.AnythingOfType("interfaces.MidtransSnapRequest")).
								Return(tt.mockMidtransSnap, tt.mockMidtransError).Once()

							if tt.mockMidtransError == nil {
								mockXenditRepo.On("UpdateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
									Return(tt.mockUpdateCheckoutError).Once()

								// Add mock for GetCheckoutSession reload after update
								if tt.mockUpdateCheckoutError == nil {
									mockUpdatedSession := &domain.CheckoutSession{
										SessionID: "test-session-id",
										UserID:    userID,
										SubscriptionPlanID: func() uint {
											if tt.newPlanID != nil {
												return *tt.newPlanID
											}
											return tt.mockTrialSubscription.SubscriptionPlanID
										}(),
										SeatPlanID: func() uint {
											if tt.newSeatPlanID != nil {
												return *tt.newSeatPlanID
											}
											return tt.mockTrialSubscription.SeatPlanID
										}(),
										IsTrialCheckout: false,
										Amount:          tt.expectedAmount,
										Currency:        "IDR",
										Status:          enums.CheckoutPending,
										PaymentToken:    func() *string { s := "snap_token_123"; return &s }(),
										PaymentURL:      func() *string { s := "https://app.sandbox.midtrans.com/snap/v2/vtweb/snap_token_123"; return &s }(),
									}
									mockXenditRepo.On("GetCheckoutSession", ctx, mock.AnythingOfType("string")).
										Return(mockUpdatedSession, nil).Once()
								}
							}
						}
					}
				}
			}

			actualResponse, actualErr := uc.ConvertTrialToPaid(ctx, userID, tt.newPlanID, tt.newSeatPlanID, tt.isMonthly)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.Contains(t, actualErr.Error(), tt.expectedErrorMsg)
				assert.Nil(t, actualResponse)
			} else {
				assert.NoError(t, actualErr)
				assert.NotNil(t, actualResponse)
				assert.Equal(t, "trial_conversion", actualResponse.ChangeType)
				assert.True(t, actualResponse.PaymentRequired)
				assert.Equal(t, tt.expectedAmount, *actualResponse.PaymentAmount)
				assert.NotNil(t, actualResponse.CheckoutSession)
				assert.NotNil(t, actualResponse.Invoice)
			}

			mockXenditRepo.AssertExpectations(t)
			mockAuthRepo.AssertExpectations(t)
			mockMidtransClient.AssertExpectations(t)
		})
	}
}
