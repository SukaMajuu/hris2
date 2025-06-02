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

	mockSeatPlan := domain.SeatPlan{
		ID:               1,
		SubscriptionPlanID: 1,
		SizeTierID:       "small",
		MinEmployees:     1,
		MaxEmployees:     10,
		PricePerMonth:    decimal.NewFromInt(500000),
		PricePerYear:     decimal.NewFromInt(5000000),
		IsActive:         true,
		CreatedAt:        time.Now(),
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name                string
		mockPlans           []domain.SubscriptionPlan
		mockSeatPlans       []domain.SeatPlan
		mockPlansError      error
		mockSeatPlansError  error
		expectedResponse    []subscriptionDto.SubscriptionPlanResponse
		expectedErrorMsg    string
	}{
		{
			name:               "successful retrieval",
			mockPlans:          []domain.SubscriptionPlan{mockPlan},
			mockSeatPlans:      []domain.SeatPlan{mockSeatPlan},
			mockPlansError:     nil,
			mockSeatPlansError: nil,
			expectedResponse: []subscriptionDto.SubscriptionPlanResponse{
				{
					ID:          1,
					Name:        "Basic Plan",
					Type:        enums.PlanStandard,
					Description: "Basic subscription plan",
					Features:    nil,
					SeatPlans: []subscriptionDto.SeatPlanResponse{
						{
							ID:            1,
							Name:          "small",
							MinEmployees:  1,
							MaxEmployees:  10,
							PricePerMonth: decimal.NewFromInt(500000),
							PricePerYear:  decimal.NewFromInt(5000000),
							IsActive:      true,
							CreatedAt:     mockSeatPlan.CreatedAt,
						},
					},
					IsActive:  true,
					CreatedAt: mockPlan.CreatedAt,
				},
			},
			expectedErrorMsg: "",
		},
		{
			name:               "repository returns error for plans",
			mockPlans:          nil,
			mockSeatPlans:      nil,
			mockPlansError:     repoError,
			mockSeatPlansError: nil,
			expectedResponse:   nil,
			expectedErrorMsg:   fmt.Errorf("failed to get subscription plans: %w", repoError).Error(),
		},
		{
			name:               "repository returns error for seat plans",
			mockPlans:          []domain.SubscriptionPlan{mockPlan},
			mockSeatPlans:      nil,
			mockPlansError:     nil,
			mockSeatPlansError: repoError,
			expectedResponse:   nil,
			expectedErrorMsg:   fmt.Errorf("failed to get seat plans for plan %d: %w", mockPlan.ID, repoError).Error(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockXenditClient := new(mocks.XenditClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockXenditClient)

			mockXenditRepo.On("GetSubscriptionPlans", ctx).
				Return(tt.mockPlans, tt.mockPlansError).Once()

			if tt.mockPlansError == nil && len(tt.mockPlans) > 0 {
				mockXenditRepo.On("GetSeatPlansBySubscriptionPlan", ctx, tt.mockPlans[0].ID).
					Return(tt.mockSeatPlans, tt.mockSeatPlansError).Once()
			}

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
			mockXenditClient.AssertExpectations(t)
		})
	}
}

func TestSubscriptionUseCase_InitiateTrialCheckout(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)
	subscriptionPlanID := uint(1)
	seatPlanID := uint(1)

	mockSeatPlan := &domain.SeatPlan{
		ID:               1,
		SubscriptionPlanID: 1,
		SizeTierID:       "small",
		MinEmployees:     1,
		MaxEmployees:     10,
		PricePerMonth:    decimal.NewFromInt(500000),
		PricePerYear:     decimal.NewFromInt(5000000),
		IsActive:         true,
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name                       string
		mockSeatPlan               *domain.SeatPlan
		mockGetSeatPlanError       error
		mockCreateCheckoutError    error
		expectedSessionNonNil      bool
		expectedErrorMsg           string
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
			mockXenditClient := new(mocks.XenditClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockXenditClient)

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
			mockXenditClient.AssertExpectations(t)
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

	mockXenditInvoice := &interfaces.XenditInvoice{
		ID:         "inv_123",
		ExternalID: "checkout_test",
		Amount:     decimal.NewFromInt(500000),
		Currency:   "IDR",
		InvoiceURL: "https://checkout.xendit.co/web/123",
		ExpiryDate: "2024-01-01T00:00:00Z",
	}

	repoError := errors.New("repository database error")
	xenditError := errors.New("xendit service error")

	tests := []struct {
		name                       string
		mockSeatPlan               *domain.SeatPlan
		mockGetSeatPlanError       error
		mockCreateCheckoutError    error
		mockXenditInvoice          *interfaces.XenditInvoice
		mockXenditError            error
		mockUpdateCheckoutError    error
		expectedResponseNonNil     bool
		expectedErrorMsg           string
	}{
		{
			name:                    "successful paid checkout initiation",
			mockSeatPlan:            mockSeatPlan,
			mockGetSeatPlanError:    nil,
			mockCreateCheckoutError: nil,
			mockXenditInvoice:       mockXenditInvoice,
			mockXenditError:         nil,
			mockUpdateCheckoutError: nil,
			expectedResponseNonNil:  true,
			expectedErrorMsg:        "",
		},
		{
			name:                    "seat plan not found",
			mockSeatPlan:            nil,
			mockGetSeatPlanError:    repoError,
			mockCreateCheckoutError: nil,
			mockXenditInvoice:       nil,
			mockXenditError:         nil,
			mockUpdateCheckoutError: nil,
			expectedResponseNonNil:  false,
			expectedErrorMsg:        fmt.Errorf("failed to get seat plan: %w", repoError).Error(),
		},
		{
			name:                    "xendit invoice creation fails",
			mockSeatPlan:            mockSeatPlan,
			mockGetSeatPlanError:    nil,
			mockCreateCheckoutError: nil,
			mockXenditInvoice:       nil,
			mockXenditError:         xenditError,
			mockUpdateCheckoutError: nil,
			expectedResponseNonNil:  false,
			expectedErrorMsg:        fmt.Errorf("failed to create Xendit invoice: %w", xenditError).Error(),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockXenditRepo := new(mocks.XenditRepository)
			mockXenditClient := new(mocks.XenditClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockXenditClient)

			mockXenditRepo.On("GetSeatPlan", ctx, seatPlanID).
				Return(tt.mockSeatPlan, tt.mockGetSeatPlanError).Once()

			if tt.mockGetSeatPlanError == nil {
				mockXenditRepo.On("CreateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
					Return(tt.mockCreateCheckoutError).Once()

				if tt.mockCreateCheckoutError == nil {
					mockXenditClient.On("CreateInvoice", ctx, mock.AnythingOfType("interfaces.CreateInvoiceRequest")).
						Return(tt.mockXenditInvoice, tt.mockXenditError).Once()

					if tt.mockXenditError == nil {
						mockXenditRepo.On("UpdateCheckoutSession", ctx, mock.AnythingOfType("*domain.CheckoutSession")).
							Return(tt.mockUpdateCheckoutError).Once()
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
			mockXenditClient.AssertExpectations(t)
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
			mockXenditClient := new(mocks.XenditClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockXenditClient)

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
			mockXenditClient.AssertExpectations(t)
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
			mockXenditClient := new(mocks.XenditClient)
			uc := NewSubscriptionUseCase(mockXenditRepo, mockXenditClient)

			actualErr := uc.ProcessPaymentWebhook(ctx, tt.webhookData)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
			} else {
				assert.NoError(t, actualErr)
			}

			mockXenditRepo.AssertExpectations(t)
			mockXenditClient.AssertExpectations(t)
		})
	}
}
