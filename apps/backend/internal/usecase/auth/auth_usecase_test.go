package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"testing"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestRegisterAdminWithForm(t *testing.T) {
	var repoCreateFailedErr = errors.New("repo create failed")

	tests := []struct {
		name          string
		user          *domain.User
		employee      *domain.Employee
		repoError     error
		rollbackError error
		expectedErr   error
	}{
		{
			name: "successful registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
			},
			employee: &domain.Employee{
				FirstName:    "John",
				LastName:     "Doe",
			},
			repoError:     nil,
			rollbackError: nil,
			expectedErr:   nil,
		},
		{
			name: "repository error during registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
			},
			employee: &domain.Employee{
				FirstName:    "John",
				LastName:     "Doe",
			},
			repoError:     repoCreateFailedErr,
			rollbackError: nil,
			expectedErr:   fmt.Errorf("failed to register admin: %w", repoCreateFailedErr),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockAuthRepo := new(mocks.AuthRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockJWTService := new(mocks.JWTService)

			uc := NewAuthUseCase(
				mockAuthRepo,
				mockEmployeeRepo,
				mockJWTService,
			)

			if tt.name == "email already exists" {
				mockAuthRepo.On("GetUserByEmail", mock.Anything, tt.user.Email).
					Return(&domain.User{}, nil)
			} else {
				mockAuthRepo.On("GetUserByEmail", mock.Anything, tt.user.Email).
					Return(nil, gorm.ErrRecordNotFound).Maybe()
			}

			if tt.expectedErr == nil || (tt.repoError != nil && errors.Is(tt.expectedErr, tt.repoError)) {
				mockAuthRepo.On("RegisterAdminWithForm", mock.Anything,
						mock.MatchedBy(func(user *domain.User) bool {
							return user.Role == enums.RoleAdmin
						}),
						mock.MatchedBy(func(emp *domain.Employee) bool {
							return emp.FirstName == tt.employee.FirstName &&
							       emp.LastName == tt.employee.LastName &&
							       emp.PositionID == 1
						}),
					).Return(tt.repoError)
			}

			err := uc.RegisterAdminWithForm(context.Background(), tt.user, tt.employee)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
			} else {
				assert.NoError(t, err)
				assert.Equal(t, enums.RoleAdmin, tt.user.Role)
				assert.NotNil(t, tt.user.CreatedAt)
				assert.NotNil(t, tt.employee.CreatedAt)
			}

			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestLoginWithIdentifier(t *testing.T) {
	tests := []struct {
		name          string
		identifier    string
		password      string
		expectedUser  *domain.User
		expectedToken string
		repoError     error
		jwtError      error
		expectedErr   error
	}{
		{
			name:       "successful email login",
			identifier: "test@example.com",
			password:   "password123",
			expectedUser: &domain.User{
				ID:        1,
				Email:     "test@example.com",
				Role:      enums.RoleAdmin,
				LastLoginAt: nil,
			},
			expectedToken: "valid-token",
			repoError:     nil,
			jwtError:      nil,
			expectedErr:   nil,
		},
		{
			name:       "successful phone login",
			identifier: "+6281234567890",
			password:   "password123",
			expectedUser: &domain.User{
				ID:        2,
				Phone:     "+6281234567890",
				Role:      enums.RoleUser,
				LastLoginAt: nil,
			},
			expectedToken: "valid-token",
			repoError:     nil,
			jwtError:      nil,
			expectedErr:   nil,
		},
		{
			name:       "successful employee credentials login",
			identifier: "EMP001",
			password:   "password123",
			expectedUser: &domain.User{
				ID:        3,
				Role:      enums.RoleUser,
				LastLoginAt: nil,
			},
			expectedToken: "valid-token",
			repoError:     nil,
			jwtError:      nil,
			expectedErr:   nil,
		},
		{
			name:          "invalid credentials",
			identifier:    "test@example.com",
			password:      "wrongpassword",
			expectedUser:  nil,
			expectedToken: "",
			repoError:     domain.ErrInvalidCredentials,
			jwtError:      nil,
			expectedErr:   fmt.Errorf("login failed: %w", domain.ErrInvalidCredentials),
		},
		{
			name:          "jwt generation error",
			identifier:    "test@example.com",
			password:      "password123",
			expectedUser:  &domain.User{ID: 1, Role: enums.RoleAdmin},
			expectedToken: "",
			repoError:     nil,
			jwtError:      fmt.Errorf("jwt generation failed"),
			expectedErr:   fmt.Errorf("failed to generate token: jwt generation failed"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockAuthRepo := new(mocks.AuthRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockJWTService := new(mocks.JWTService)

			uc := NewAuthUseCase(
				mockAuthRepo,
				mockEmployeeRepo,
				mockJWTService,
			)

			if strings.Contains(tt.identifier, "@") {
				mockAuthRepo.On("LoginWithEmail", mock.Anything, tt.identifier, tt.password).
					Return(tt.expectedUser, tt.repoError)
			} else if strings.HasPrefix(tt.identifier, "+") || strings.HasPrefix(tt.identifier, "0") {
				mockAuthRepo.On("LoginWithPhone", mock.Anything, tt.identifier, tt.password).
					Return(tt.expectedUser, tt.repoError)
			} else {
				mockAuthRepo.On("LoginWithEmployeeCredentials", mock.Anything, tt.identifier, tt.password).
					Return(tt.expectedUser, tt.repoError)
			}

			if tt.repoError == nil {
				mockJWTService.On("GenerateToken", tt.expectedUser.ID, tt.expectedUser.Role).
					Return(tt.expectedToken, tt.jwtError)
			}

			user, token, err := uc.LoginWithIdentifier(context.Background(), tt.identifier, tt.password)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
				assert.Nil(t, user)
				assert.Empty(t, token)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, tt.expectedToken, token)
				assert.NotNil(t, user.LastLoginAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}
