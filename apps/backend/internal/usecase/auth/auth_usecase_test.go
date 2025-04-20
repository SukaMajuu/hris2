package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth/mocks"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestRegisterAdminWithForm(t *testing.T) {
	var repoCreateFailedErr = errors.New("repo create failed")
	lastName := "Doe"
	now := time.Now()

	tests := []struct {
		name          string
		user          *domain.User
		employee      *domain.Employee
		repoError     error
		expectedErr   error
	}{
		{
			name: "successful registration with last name",
			user: &domain.User{
				ID:          1,
				Email:       "test@example.com",
				Password:    "password123",
				Role:        enums.RoleAdmin,
				CreatedAt:   now,
				UpdatedAt:   now,
				LastLoginAt: nil,
			},
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  &lastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
			repoError:   nil,
			expectedErr: nil,
		},
		{
			name: "successful registration without last name",
			user: &domain.User{
				ID:          1,
				Email:       "test@example.com",
				Password:    "password123",
				Role:        enums.RoleAdmin,
				CreatedAt:   now,
				UpdatedAt:   now,
				LastLoginAt: nil,
			},
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  nil,
				CreatedAt: now,
				UpdatedAt: now,
			},
			repoError:   nil,
			expectedErr: nil,
		},
		{
			name: "repository error during registration",
			user: &domain.User{
				ID:          1,
				Email:       "test@example.com",
				Password:    "password123",
				Role:        enums.RoleAdmin,
				CreatedAt:   now,
				UpdatedAt:   now,
				LastLoginAt: nil,
			},
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  &lastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
			repoError:   repoCreateFailedErr,
			expectedErr: fmt.Errorf("failed to register admin: %w", repoCreateFailedErr),
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
							((emp.LastName == nil && tt.employee.LastName == nil) ||
								(emp.LastName != nil && tt.employee.LastName != nil && *emp.LastName == *tt.employee.LastName)) &&
							emp.PositionID == 1
					}),
				).Return(tt.repoError)

				if tt.repoError == nil {
					mockJWTService.On("GenerateToken", tt.user.ID, tt.user.Role).
						Return("access-token", "refresh-token", nil)
				}
			}

			user, accessToken, refreshToken, err := uc.RegisterAdminWithForm(context.Background(), tt.user, tt.employee)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
				assert.Nil(t, user)
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, "access-token", accessToken)
				assert.Equal(t, "refresh-token", refreshToken)
				assert.Equal(t, enums.RoleAdmin, user.Role)
				assert.NotNil(t, user.CreatedAt)
				assert.NotNil(t, tt.employee.CreatedAt)
				assert.NotNil(t, user.LastLoginAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}

func TestLoginWithIdentifier(t *testing.T) {
	tests := []struct {
		name              string
		identifier        string
		password          string
		expectedUser      *domain.User
		expectedAccessToken  string
		expectedRefreshToken string
		repoError         error
		jwtError          error
		expectedErr       error
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
			expectedAccessToken:  "valid-access-token",
			expectedRefreshToken: "valid-refresh-token",
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
			expectedAccessToken:  "valid-access-token",
			expectedRefreshToken: "valid-refresh-token",
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
			expectedAccessToken:  "valid-access-token",
			expectedRefreshToken: "valid-refresh-token",
			repoError:     nil,
			jwtError:      nil,
			expectedErr:   nil,
		},
		{
			name:          "invalid credentials",
			identifier:    "test@example.com",
			password:      "wrongpassword",
			expectedUser:  nil,
			expectedAccessToken:  "",
			expectedRefreshToken: "",
			repoError:     domain.ErrInvalidCredentials,
			jwtError:      nil,
			expectedErr:   fmt.Errorf("login failed: %w", domain.ErrInvalidCredentials),
		},
		{
			name:          "jwt generation error",
			identifier:    "test@example.com",
			password:      "password123",
			expectedUser:  &domain.User{ID: 1, Role: enums.RoleAdmin},
			expectedAccessToken:  "",
			expectedRefreshToken: "",
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
					Return(tt.expectedAccessToken, tt.expectedRefreshToken, tt.jwtError)
			}

			user, accessToken, refreshToken, err := uc.LoginWithIdentifier(context.Background(), tt.identifier, tt.password)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
				assert.Nil(t, user)
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, tt.expectedAccessToken, accessToken)
				assert.Equal(t, tt.expectedRefreshToken, refreshToken)
				assert.NotNil(t, user.LastLoginAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}

func TestRefreshToken(t *testing.T) {
	tests := []struct {
		name              string
		refreshToken      string
		claims            *jwt.CustomClaims
		validateError     error
		user              *domain.User
		userError         error
		expectedAccessToken  string
		expectedRefreshToken string
		generateError     error
		expectedErr       error
	}{
		{
			name:         "successful token refresh",
			refreshToken: "valid-refresh-token",
			claims: &jwt.CustomClaims{
				UserID:    1,
				Role:      enums.RoleAdmin,
				TokenType: "refresh",
			},
			validateError: nil,
			user: &domain.User{
				ID:   1,
				Role: enums.RoleAdmin,
			},
			userError:         nil,
			expectedAccessToken:  "new-access-token",
			expectedRefreshToken: "new-refresh-token",
			generateError:     nil,
			expectedErr:       nil,
		},
		{
			name:         "empty refresh token",
			refreshToken: "",
			claims:       nil,
			validateError: nil,
			user:         nil,
			userError:    nil,
			expectedAccessToken:  "",
			expectedRefreshToken: "",
			generateError:     nil,
			expectedErr:       domain.ErrInvalidToken,
		},
		{
			name:         "invalid token validation",
			refreshToken: "invalid-token",
			claims:       nil,
			validateError: fmt.Errorf("invalid token"),
			user:         nil,
			userError:    nil,
			expectedAccessToken:  "",
			expectedRefreshToken: "",
			generateError:     nil,
			expectedErr:       fmt.Errorf("failed to validate refresh token: invalid token"),
		},
		{
			name:         "wrong token type",
			refreshToken: "access-token",
			claims: &jwt.CustomClaims{
				UserID:    1,
				Role:      enums.RoleAdmin,
				TokenType: "access",
			},
			validateError: nil,
			user:         nil,
			userError:    nil,
			expectedAccessToken:  "",
			expectedRefreshToken: "",
			generateError:     nil,
			expectedErr:       domain.ErrInvalidToken,
		},
		{
			name:         "user not found",
			refreshToken: "valid-refresh-token",
			claims: &jwt.CustomClaims{
				UserID:    1,
				Role:      enums.RoleAdmin,
				TokenType: "refresh",
			},
			validateError: nil,
			user:         nil,
			userError:    gorm.ErrRecordNotFound,
			expectedAccessToken:  "",
			expectedRefreshToken: "",
			generateError:     nil,
			expectedErr:       fmt.Errorf("failed to get user: %w", gorm.ErrRecordNotFound),
		},
		{
			name:         "token generation failed",
			refreshToken: "valid-refresh-token",
			claims: &jwt.CustomClaims{
				UserID:    1,
				Role:      enums.RoleAdmin,
				TokenType: "refresh",
			},
			validateError: nil,
			user: &domain.User{
				ID:   1,
				Role: enums.RoleAdmin,
			},
			userError:         nil,
			expectedAccessToken:  "",
			expectedRefreshToken: "",
			generateError:     fmt.Errorf("generation failed"),
			expectedErr:       fmt.Errorf("failed to generate new tokens: generation failed"),
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

			if tt.refreshToken != "" {
				mockJWTService.On("ValidateToken", tt.refreshToken).
					Return(tt.claims, tt.validateError)
			}

			if tt.validateError == nil && tt.claims != nil && tt.claims.TokenType == "refresh" {
				mockAuthRepo.On("GetUserByID", mock.Anything, tt.claims.UserID).
					Return(tt.user, tt.userError)

				if tt.userError == nil {
					mockJWTService.On("GenerateToken", tt.user.ID, tt.user.Role).
						Return(tt.expectedAccessToken, tt.expectedRefreshToken, tt.generateError)
				}
			}

			accessToken, refreshToken, err := uc.RefreshToken(context.Background(), tt.refreshToken)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedAccessToken, accessToken)
				assert.Equal(t, tt.expectedRefreshToken, refreshToken)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}

func TestRegisterAdminWithGoogle(t *testing.T) {
	var (
		validToken     = "valid-google-token"
		emptyToken     = ""
		invalidToken   = "invalid-token"
		existingEmail  = "existing@example.com"
		firebaseError  = errors.New("firebase error")
	)

	tests := []struct {
		name           string
		token          string
		repoError      error
		loginUser      *domain.User
		loginError     error
		expectedUser   *domain.User
		expectedErr    error
	}{
		{
			name:  "successful registration",
			token: validToken,
			repoError: nil,
			loginUser: &domain.User{
				ID:       1,
				Email:    "new@example.com",
				GoogleID: &validToken,
				Role:     enums.RoleAdmin,
			},
			loginError: nil,
			expectedUser: &domain.User{
				ID:       1,
				Email:    "new@example.com",
				GoogleID: &validToken,
				Role:     enums.RoleAdmin,
			},
			expectedErr: nil,
		},
		{
			name:  "email already exists - successful login",
			token: validToken,
			repoError: domain.ErrEmailAlreadyExists,
			loginUser: &domain.User{
				ID:       1,
				Email:    existingEmail,
				GoogleID: &validToken,
				Role:     enums.RoleAdmin,
			},
			loginError: nil,
			expectedUser: &domain.User{
				ID:       1,
				Email:    existingEmail,
				GoogleID: &validToken,
				Role:     enums.RoleAdmin,
			},
			expectedErr: nil,
		},
		{
			name:  "empty token",
			token: emptyToken,
			expectedErr: domain.ErrInvalidToken,
		},
		{
			name:  "invalid token",
			token: invalidToken,
			repoError: firebaseError,
			loginError: firebaseError,
			expectedErr: fmt.Errorf("failed Google admin registration: %w", firebaseError),
		},
		{
			name:  "firebase error",
			token: validToken,
			repoError: firebaseError,
			loginError: firebaseError,
			expectedErr: fmt.Errorf("failed Google admin registration: %w", firebaseError),
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

			if tt.token != "" {
				mockAuthRepo.On("RegisterAdminWithGoogle", mock.Anything, tt.token).
					Return(nil, nil, tt.repoError)

				if tt.repoError == nil || tt.repoError == domain.ErrEmailAlreadyExists {
					mockAuthRepo.On("LoginWithGoogle", mock.Anything, tt.token).
						Return(tt.loginUser, tt.loginError)

					if tt.loginError == nil {
						mockJWTService.On("GenerateToken", tt.loginUser.ID, tt.loginUser.Role).
							Return("access-token", "refresh-token", nil)
					}
				}
			}

			user, accessToken, refreshToken, err := uc.RegisterAdminWithGoogle(context.Background(), tt.token)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
				assert.Nil(t, user)
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, "access-token", accessToken)
				assert.Equal(t, "refresh-token", refreshToken)

				if tt.expectedUser != nil {
					assert.Equal(t, tt.expectedUser.Email, user.Email)
					assert.Equal(t, tt.expectedUser.Role, user.Role)
					if tt.expectedUser.GoogleID != nil {
						assert.Equal(t, *tt.expectedUser.GoogleID, *user.GoogleID)
					}
					assert.NotNil(t, user.LastLoginAt)
				}
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}

func TestLoginWithGoogle(t *testing.T) {
	var (
		validToken    = "valid-google-token"
		emptyToken    = ""
		invalidToken  = "invalid-token"
		firebaseError = errors.New("firebase error")
	)

	tests := []struct {
		name           string
		token          string
		repoUser       *domain.User
		repoError      error
		jwtError       error
		expectedUser   *domain.User
		expectedErr    error
	}{
		{
			name: "successful login",
			token: validToken,
			repoUser: &domain.User{
				ID:        1,
				Email:     "test@example.com",
				GoogleID:  &validToken,
				Role:      enums.RoleAdmin,
			},
			repoError:    nil,
			jwtError:     nil,
			expectedUser: &domain.User{
				ID:        1,
				Email:     "test@example.com",
				GoogleID:  &validToken,
				Role:      enums.RoleAdmin,
			},
			expectedErr: nil,
		},
		{
			name:         "empty token",
			token:        emptyToken,
			repoUser:     nil,
			repoError:    nil,
			jwtError:     nil,
			expectedUser: nil,
			expectedErr:  domain.ErrInvalidToken,
		},
		{
			name:         "invalid token",
			token:        invalidToken,
			repoUser:     nil,
			repoError:    firebaseError,
			jwtError:     nil,
			expectedUser: nil,
			expectedErr:  fmt.Errorf("google login failed: %w", firebaseError),
		},
		{
			name: "jwt generation error",
			token: validToken,
			repoUser: &domain.User{
				ID:        1,
				Email:     "test@example.com",
				GoogleID:  &validToken,
				Role:      enums.RoleAdmin,
			},
			repoError:    nil,
			jwtError:     fmt.Errorf("jwt generation failed"),
			expectedUser: nil,
			expectedErr:  fmt.Errorf("failed to generate token: %w", fmt.Errorf("jwt generation failed")),
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

			if tt.token != "" {
				mockAuthRepo.On("LoginWithGoogle", mock.Anything, tt.token).
					Return(tt.repoUser, tt.repoError)

				if tt.repoError == nil {
					if tt.jwtError == nil {
						mockJWTService.On("GenerateToken", tt.repoUser.ID, tt.repoUser.Role).
							Return("access-token", "refresh-token", nil)
					} else {
						mockJWTService.On("GenerateToken", tt.repoUser.ID, tt.repoUser.Role).
							Return("", "", tt.jwtError)
					}
				}
			}

			user, accessToken, refreshToken, err := uc.LoginWithGoogle(context.Background(), tt.token)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
				assert.Nil(t, user)
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, "access-token", accessToken)
				assert.Equal(t, "refresh-token", refreshToken)

				if tt.expectedUser != nil {
					assert.Equal(t, tt.expectedUser.ID, user.ID)
					assert.Equal(t, tt.expectedUser.Email, user.Email)
					assert.Equal(t, tt.expectedUser.Role, user.Role)
					if tt.expectedUser.GoogleID != nil {
						assert.Equal(t, *tt.expectedUser.GoogleID, *user.GoogleID)
					}
					assert.NotNil(t, user.LastLoginAt)
				}
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}
