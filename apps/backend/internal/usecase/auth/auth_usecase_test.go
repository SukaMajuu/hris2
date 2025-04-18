package auth

import (
	"context"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestRegisterWithForm(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name        string
		user        *domain.User
		repoError   error
		expectedErr error
	}{
		{
			name: "successful registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			repoError:   nil,
			expectedErr: nil,
		},
		{
			name: "invalid email",
			user: &domain.User{
				Email:    "",
				Password: "password123",
				Phone:    "1234567890",
			},
			repoError:   nil,
			expectedErr: domain.ErrInvalidEmail,
		},
		{
			name: "invalid password",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "",
				Phone:    "1234567890",
			},
			repoError:   nil,
			expectedErr: domain.ErrInvalidPassword,
		},
		{
			name: "repository error",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			repoError:   assert.AnError,
			expectedErr: assert.AnError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.AuthRepository)
			uc := NewAuthUseCase(mockRepo)

			if tt.expectedErr == nil || tt.expectedErr == assert.AnError {
				mockRepo.On("RegisterWithForm", mock.Anything, mock.MatchedBy(func(user *domain.User) bool {
					return user.Role == enums.UserRole("hr") &&
						user.CreatedAt.After(now.Add(-time.Second)) &&
						user.LastLoginAt != nil &&
						user.LastLoginAt.After(now.Add(-time.Second))
				})).Return(tt.repoError)
			}

			err := uc.RegisterWithForm(context.Background(), tt.user)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, enums.UserRole("hr"), tt.user.Role)
				assert.NotNil(t, tt.user.CreatedAt)
				assert.NotNil(t, tt.user.LastLoginAt)
				assert.True(t, tt.user.CreatedAt.After(now.Add(-time.Second)))
				assert.True(t, tt.user.LastLoginAt.After(now.Add(-time.Second)))
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestLoginWithEmail(t *testing.T) {
	tests := []struct {
		name        string
		email       string
		password    string
		repoUser    *domain.User
		repoError   error
		expectedErr error
	}{
		{
			name:      "successful login",
			email:     "test@example.com",
			password:  "password123",
			repoUser:  &domain.User{Email: "test@example.com"},
			repoError: nil,
		},
		{
			name:        "empty email",
			email:       "",
			password:    "password123",
			repoUser:    nil,
			repoError:   nil,
			expectedErr: domain.ErrInvalidCredentials,
		},
		{
			name:        "empty password",
			email:       "test@example.com",
			password:    "",
			repoUser:    nil,
			repoError:   nil,
			expectedErr: domain.ErrInvalidCredentials,
		},
		{
			name:        "repository error",
			email:       "test@example.com",
			password:    "password123",
			repoUser:    nil,
			repoError:   assert.AnError,
			expectedErr: assert.AnError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.AuthRepository)
			uc := NewAuthUseCase(mockRepo)

			if tt.expectedErr == nil || tt.expectedErr == assert.AnError {
				mockRepo.On("LoginWithEmail", mock.Anything, tt.email, tt.password).Return(tt.repoUser, tt.repoError)
			}

			user, err := uc.LoginWithEmail(context.Background(), tt.email, tt.password)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, user)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.repoUser, user)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}
