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
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func createTestConfig() *config.Config {
	return &config.Config{
		JWT: config.JWTConfig{
			SecretKey:       "test-secret",
			AccessDuration:  "15m",
			RefreshDuration: "72h",
		},
	}
}

func TestRegisterAdminWithForm(t *testing.T) {
	var repoCreateFailedErr = errors.New("repo create failed")
	dbStoreFailedErr := errors.New("db store failed")
	lastName := "Doe"
	now := time.Now()
	testConfig := createTestConfig()

	tests := []struct {
		name             string
		user             *domain.User
		employee         *domain.Employee
		repoError        error
		jwtError         error
		storeTokenError  error
		updateLoginError error
		expectedErr      error
	}{
		{
			name: "successful registration with last name",
			user: &domain.User{
				ID:        1,
				Email:     "test@example.com",
				Password:  "password123",
				Role:      enums.RoleAdmin,
				CreatedAt: now,
				UpdatedAt: now,
			},
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  &lastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
			repoError:        nil,
			jwtError:         nil,
			storeTokenError:  nil,
			updateLoginError: nil,
			expectedErr:      nil,
		},
		{
			name: "successful registration without last name",
			user: &domain.User{
				ID:        1,
				Email:     "test@example.com",
				Password:  "password123",
				Role:      enums.RoleAdmin,
				CreatedAt: now,
				UpdatedAt: now,
			},
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  nil,
				CreatedAt: now,
				UpdatedAt: now,
			},
			repoError:        nil,
			jwtError:         nil,
			storeTokenError:  nil,
			updateLoginError: nil,
			expectedErr:      nil,
		},
		{
			name: "repository error during registration",
			user: &domain.User{
				ID:       1,
				Email:    "test@example.com",
				Password: "password123",
				Role:     enums.RoleAdmin,
			},
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  &lastName,
			},
			repoError:        repoCreateFailedErr,
			jwtError:         nil,
			storeTokenError:  nil,
			updateLoginError: nil,
			expectedErr:      fmt.Errorf("failed to register admin: %w", repoCreateFailedErr),
		},
		{
			name:             "jwt generation error",
			user:             &domain.User{ID: 1, Email: "test@example.com", Password: "password123", Role: enums.RoleAdmin},
			employee:         &domain.Employee{FirstName: "John", LastName: &lastName},
			repoError:        nil,
			jwtError:         fmt.Errorf("jwt gen failed"),
			storeTokenError:  nil,
			updateLoginError: nil,
			expectedErr:      fmt.Errorf("token issuance failed after registration: %w", fmt.Errorf("failed to generate token: %w", errors.New("jwt gen failed"))),
		},
		{
			name:             "store refresh token error",
			user:             &domain.User{ID: 1, Email: "test@example.com", Password: "password123", Role: enums.RoleAdmin},
			employee:         &domain.Employee{FirstName: "John", LastName: &lastName},
			repoError:        nil,
			jwtError:         nil,
			storeTokenError:  dbStoreFailedErr,
			updateLoginError: nil,
			expectedErr:      fmt.Errorf("token issuance failed after registration: %w", dbStoreFailedErr),
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
				testConfig,
				nil,
			)

			mockAuthRepo.On("RegisterAdminWithForm", mock.Anything,
				mock.AnythingOfType("*domain.User"),
				mock.AnythingOfType("*domain.Employee"),
			).Return(tt.repoError).Maybe()

			if tt.repoError == nil {
				mockAuthRepo.On("RevokeAllUserRefreshTokens", mock.Anything, tt.user.ID).Return(nil).Maybe()

				mockJWTService.On("GenerateToken", tt.user.ID, tt.user.Email, tt.user.Role).
					Return("access-token", "refresh-token", "hashed-refresh-token", tt.jwtError).Maybe()

				if tt.jwtError == nil {
					mockAuthRepo.On("StoreRefreshToken", mock.Anything, mock.AnythingOfType("*domain.RefreshToken")).
						Return(tt.storeTokenError).Maybe()

					if tt.storeTokenError == nil {
						mockAuthRepo.On("UpdateLastLogin", mock.Anything, tt.user.ID, mock.AnythingOfType("time.Time")).Return(tt.updateLoginError).Maybe()
					}
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
				assert.NotNil(t, user.LastLoginAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}

func TestLoginWithIdentifier(t *testing.T) {
	testConfig := createTestConfig()
	dbStoreFailedErr := errors.New("db store failed")
	tests := []struct {
		name                 string
		identifier           string
		password             string
		expectedUser         *domain.User
		expectedAccessToken  string
		expectedRefreshToken string
		repoError            error
		jwtError             error
		storeTokenError      error
		updateLoginError     error
		expectedErr          error
	}{
		{
			name:                 "successful email login",
			identifier:           "test@example.com",
			password:             "password123",
			expectedUser:         &domain.User{ID: 1, Email: "test@example.com", Role: enums.RoleAdmin},
			expectedAccessToken:  "valid-access-token",
			expectedRefreshToken: "valid-refresh-token",
			repoError:            nil,
			jwtError:             nil,
			storeTokenError:      nil,
			updateLoginError:     nil,
			expectedErr:          nil,
		},
		{
			name:                 "successful phone login",
			identifier:           "+6281234567890",
			password:             "password123",
			expectedUser:         &domain.User{ID: 2, Phone: "+6281234567890", Role: enums.RoleUser},
			expectedAccessToken:  "valid-access-token",
			expectedRefreshToken: "valid-refresh-token",
			repoError:            nil,
			jwtError:             nil,
			storeTokenError:      nil,
			updateLoginError:     nil,
			expectedErr:          nil,
		},
		{
			name:                 "successful employee credentials login",
			identifier:           "EMP001",
			password:             "password123",
			expectedUser:         &domain.User{ID: 3, Role: enums.RoleUser},
			expectedAccessToken:  "valid-access-token",
			expectedRefreshToken: "valid-refresh-token",
			repoError:            nil,
			jwtError:             nil,
			storeTokenError:      nil,
			updateLoginError:     nil,
			expectedErr:          nil,
		},
		{
			name:             "invalid credentials",
			identifier:       "test@example.com",
			password:         "wrongpassword",
			expectedUser:     nil,
			repoError:        domain.ErrInvalidCredentials,
			jwtError:         nil,
			storeTokenError:  nil,
			updateLoginError: nil,
			expectedErr:      fmt.Errorf("login failed: %w", domain.ErrInvalidCredentials),
		},
		{
			name:             "jwt generation error",
			identifier:       "test@example.com",
			password:         "password123",
			expectedUser:     &domain.User{ID: 1, Role: enums.RoleAdmin},
			repoError:        nil,
			jwtError:         fmt.Errorf("jwt generation failed"),
			storeTokenError:  nil,
			updateLoginError: nil,
			expectedErr:      fmt.Errorf("token issuance failed after login: %w", fmt.Errorf("failed to generate token: %w", errors.New("jwt generation failed"))),
		},
		{
			name:             "store refresh token error",
			identifier:       "test@example.com",
			password:         "password123",
			expectedUser:     &domain.User{ID: 1, Role: enums.RoleAdmin},
			repoError:        nil,
			jwtError:         nil,
			storeTokenError:  dbStoreFailedErr,
			updateLoginError: nil,
			expectedErr:      fmt.Errorf("token issuance failed after login: %w", dbStoreFailedErr),
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
				testConfig,
				nil,
			)

			if strings.Contains(tt.identifier, "@") {
				mockAuthRepo.On("LoginWithEmail", mock.Anything, tt.identifier, tt.password).
					Return(tt.expectedUser, tt.repoError).Maybe()
			} else if strings.HasPrefix(tt.identifier, "+") || strings.HasPrefix(tt.identifier, "0") {
				mockAuthRepo.On("LoginWithPhone", mock.Anything, tt.identifier, tt.password).
					Return(tt.expectedUser, tt.repoError).Maybe()
			} else {
				mockAuthRepo.On("LoginWithEmployeeCredentials", mock.Anything, tt.identifier, tt.password).
					Return(tt.expectedUser, tt.repoError).Maybe()
			}

			if tt.repoError == nil {
				mockAuthRepo.On("RevokeAllUserRefreshTokens", mock.Anything, tt.expectedUser.ID).Return(nil).Maybe()

				mockJWTService.On("GenerateToken", tt.expectedUser.ID, tt.expectedUser.Email, tt.expectedUser.Role).
					Return(tt.expectedAccessToken, tt.expectedRefreshToken, "hashed-refresh-token", tt.jwtError).Maybe()

				if tt.jwtError == nil {
					mockAuthRepo.On("StoreRefreshToken", mock.Anything, mock.AnythingOfType("*domain.RefreshToken")).
						Return(tt.storeTokenError).Maybe()

					if tt.storeTokenError == nil {
						mockAuthRepo.On("UpdateLastLogin", mock.Anything, tt.expectedUser.ID, mock.AnythingOfType("time.Time")).Return(tt.updateLoginError).Maybe()
					}
				}
			}

			user, accessToken, refreshToken, err := uc.LoginWithIdentifier(context.Background(), tt.identifier, tt.password, false)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				if errors.Is(tt.expectedErr, domain.ErrInvalidCredentials) {
					assert.True(t, errors.Is(err, domain.ErrInvalidCredentials) || strings.Contains(err.Error(), domain.ErrInvalidCredentials.Error()))
				} else {
					assert.Contains(t, err.Error(), tt.expectedErr.Error())
				}
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
	testConfig := createTestConfig()
	tests := []struct {
		name                 string
		refreshToken         string
		claims               *jwt.CustomClaims
		validateError        error
		hashError            error
		findToken            *domain.RefreshToken
		findError            error
		revokeError          error
		user                 *domain.User
		userError            error
		expectedAccessToken  string
		expectedRefreshToken string
		generateError        error
		storeNewTokenError   error
		expectedErr          error
	}{
		{
			name:                 "successful token refresh",
			refreshToken:         "valid-refresh-token",
			claims:               &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError:        nil,
			hashError:            nil,
			findToken:            &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: false},
			findError:            nil,
			revokeError:          nil,
			user:                 &domain.User{ID: 1, Role: enums.RoleAdmin},
			userError:            nil,
			expectedAccessToken:  "new-access-token",
			expectedRefreshToken: "new-refresh-token",
			generateError:        nil,
			storeNewTokenError:   nil,
			expectedErr:          nil,
		},
		{
			name:         "empty refresh token",
			refreshToken: "",
			expectedErr:  domain.ErrInvalidToken,
		},
		{
			name:          "invalid token validation (structure/signature)",
			refreshToken:  "invalid-jwt-structure",
			validateError: domain.ErrInvalidToken,
			expectedErr:   fmt.Errorf("failed to validate refresh token structure: %w", domain.ErrInvalidToken),
		},
		{
			name:          "expired token validation",
			refreshToken:  "expired-jwt",
			validateError: domain.ErrTokenExpired,
			expectedErr:   fmt.Errorf("refresh token expired: %w", domain.ErrInvalidToken),
		},
		{
			name:          "wrong token type",
			refreshToken:  "access-token-used-as-refresh",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeAccess},
			validateError: nil,
			expectedErr:   fmt.Errorf("token is not a refresh token: %w", domain.ErrInvalidToken),
		},
		{
			name:          "error hashing incoming token",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     fmt.Errorf("bcrypt failed"),
			expectedErr:   fmt.Errorf("internal error during token refresh: %w", errors.New("bcrypt failed")),
		},
		{
			name:          "token hash not found in DB",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     nil,
			findError:     gorm.ErrRecordNotFound,
			expectedErr:   fmt.Errorf("refresh token not found or already used: %w", domain.ErrInvalidToken),
		},
		{
			name:          "db error finding token hash",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     nil,
			findError:     fmt.Errorf("db connection lost"),
			expectedErr:   fmt.Errorf("internal error during token refresh: %w", errors.New("db connection lost")),
		},
		{
			name:          "stored token is revoked",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: true},
			findError:     nil,
			expectedErr:   fmt.Errorf("refresh token has been revoked: %w", domain.ErrInvalidToken),
		},
		{
			name:          "stored token is expired (DB check)",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(-time.Hour), Revoked: false},
			findError:     nil,
			expectedErr:   fmt.Errorf("refresh token expired: %w", domain.ErrInvalidToken),
		},
		{
			name:          "user ID mismatch between claims and stored token",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     &domain.RefreshToken{ID: 10, UserID: 2, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: false},
			findError:     nil,
			expectedErr:   fmt.Errorf("token user mismatch: %w", domain.ErrInvalidToken),
		},
		{
			name:          "error revoking used token",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: false},
			findError:     nil,
			revokeError:   fmt.Errorf("failed to update db"),
			user:          &domain.User{ID: 1, Role: enums.RoleAdmin},
			userError:     nil,
			expectedErr:   fmt.Errorf("internal error during token refresh: %w", errors.New("failed to update db")),
		},
		{
			name:          "error getting user for new token generation",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: false},
			findError:     nil,
			revokeError:   nil,
			user:          nil,
			userError:     gorm.ErrRecordNotFound,
			expectedErr:   fmt.Errorf("failed to retrieve user details for refresh: %w", gorm.ErrRecordNotFound),
		},
		{
			name:          "error generating new tokens",
			refreshToken:  "valid-refresh-token",
			claims:        &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError: nil,
			hashError:     nil,
			findToken:     &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: false},
			findError:     nil,
			revokeError:   nil,
			user:          &domain.User{ID: 1, Role: enums.RoleAdmin},
			userError:     nil,
			generateError: fmt.Errorf("signing failed"),
			expectedErr:   fmt.Errorf("failed to generate new tokens: %w", errors.New("signing failed")),
		},
		{
			name:                 "error storing new refresh token",
			refreshToken:         "valid-refresh-token",
			claims:               &jwt.CustomClaims{UserID: 1, Role: enums.RoleAdmin, TokenType: enums.TokenTypeRefresh},
			validateError:        nil,
			hashError:            nil,
			findToken:            &domain.RefreshToken{ID: 10, UserID: 1, TokenHash: "hashed-valid-refresh-token", ExpiresAt: time.Now().Add(time.Hour), Revoked: false},
			findError:            nil,
			revokeError:          nil,
			user:                 &domain.User{ID: 1, Role: enums.RoleAdmin},
			userError:            nil,
			expectedAccessToken:  "new-access-token",
			expectedRefreshToken: "new-refresh-token",
			generateError:        nil,
			storeNewTokenError:   fmt.Errorf("db unique constraint"),
			expectedErr:          fmt.Errorf("failed to store new refresh token: %w", errors.New("db unique constraint")),
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
				testConfig,
				nil,
			)

			if tt.refreshToken != "" {
				mockJWTService.On("ValidateToken", tt.refreshToken).Return(tt.claims, tt.validateError).Maybe()
			}

			if tt.validateError == nil && tt.claims != nil && tt.claims.TokenType == enums.TokenTypeRefresh {
				mockJWTService.On("HashToken", tt.refreshToken).Return("hashed-"+tt.refreshToken, tt.hashError).Maybe()

				if tt.hashError == nil {
					mockAuthRepo.On("FindRefreshTokenByHash", mock.Anything, "hashed-"+tt.refreshToken).Return(tt.findToken, tt.findError).Maybe()

					if tt.findError == nil &&
						tt.findToken != nil &&
						!tt.findToken.Revoked &&
						time.Now().Before(tt.findToken.ExpiresAt) &&
						tt.findToken.UserID == tt.claims.UserID {
						mockAuthRepo.On("RevokeRefreshTokenByID", mock.Anything, tt.findToken.ID).Return(tt.revokeError).Maybe()

						if tt.revokeError == nil {
							mockAuthRepo.On("GetUserByID", mock.Anything, tt.claims.UserID).Return(tt.user, tt.userError).Maybe()

							if tt.userError == nil {
								mockJWTService.On("GenerateToken", tt.user.ID, tt.user.Email, tt.user.Role).
									Return(tt.expectedAccessToken, tt.expectedRefreshToken, "hashed-token", tt.generateError).Maybe()

								if tt.generateError == nil {
									mockAuthRepo.On("StoreRefreshToken", mock.Anything, mock.AnythingOfType("*domain.RefreshToken")).
										Return(tt.storeNewTokenError).Maybe()
								}
							}
						}
					}
				}
			}

			accessToken, refreshToken, err := uc.RefreshToken(context.Background(), tt.refreshToken)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				if errors.Is(tt.expectedErr, domain.ErrInvalidToken) {
					assert.ErrorIs(t, err, domain.ErrInvalidToken)
				} else {
					assert.Contains(t, err.Error(), tt.expectedErr.Error())
				}
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
		validToken        = "valid-google-token"
		emptyToken        = ""
		existingEmail     = "existing@example.com"
		registrationError = errors.New("registration failed")
		loginError        = errors.New("login failed")
		testConfig        = createTestConfig()
		dbStoreFailedErr  = errors.New("db store failed")
	)

	tests := []struct {
		name              string
		token             string
		regRepoError      error
		loginUser         *domain.User
		loginRepoError    error
		jwtError          error
		storeTokenError   error
		updateLoginError  error
		expectedUserEmail string
		expectedErr       error
	}{
		{
			name:              "successful registration and login",
			token:             validToken,
			regRepoError:      nil,
			loginUser:         &domain.User{ID: 1, Email: "new@example.com", Role: enums.RoleAdmin},
			loginRepoError:    nil,
			jwtError:          nil,
			storeTokenError:   nil,
			updateLoginError:  nil,
			expectedUserEmail: "new@example.com",
			expectedErr:       nil,
		},
		{
			name:              "email already exists - successful login",
			token:             validToken,
			regRepoError:      domain.ErrEmailAlreadyExists,
			loginUser:         &domain.User{ID: 1, Email: existingEmail, Role: enums.RoleAdmin},
			loginRepoError:    nil,
			jwtError:          nil,
			storeTokenError:   nil,
			updateLoginError:  nil,
			expectedUserEmail: existingEmail,
			expectedErr:       nil,
		},
		{
			name:         "registration error (not ErrEmailAlreadyExists)",
			token:        validToken,
			regRepoError: registrationError,
			expectedErr:  fmt.Errorf("failed Google admin registration: %w", registrationError),
		},
		{
			name:           "registration ok (ErrUserAlreadyExists), login error on retry",
			token:          validToken,
			regRepoError:   domain.ErrUserAlreadyExists,
			loginUser:      nil,
			loginRepoError: loginError,
			expectedErr:    fmt.Errorf("existing user login failed: %w", loginError),
		},
		{
			name:        "empty token",
			token:       emptyToken,
			expectedErr: domain.ErrInvalidToken,
		},
		{
			name:           "login ok, jwt error",
			token:          validToken,
			regRepoError:   nil,
			loginUser:      &domain.User{ID: 1, Email: "new@example.com", Role: enums.RoleAdmin},
			loginRepoError: nil,
			jwtError:       fmt.Errorf("jwt gen failed"),
			expectedErr:    fmt.Errorf("token issuance failed after google registration/login: %w", fmt.Errorf("failed to generate token: %w", errors.New("jwt gen failed"))),
		},
		{
			name:            "login ok, store token error",
			token:           validToken,
			regRepoError:    nil,
			loginUser:       &domain.User{ID: 1, Email: "new@example.com", Role: enums.RoleAdmin},
			loginRepoError:  nil,
			jwtError:        nil,
			storeTokenError: dbStoreFailedErr,
			expectedErr:     fmt.Errorf("token issuance failed after google registration/login: %w", dbStoreFailedErr),
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
				testConfig,
				nil,
			)

			if tt.token != "" {
				if tt.regRepoError == nil {
					if tt.loginUser == nil {
						t.Fatalf("Test setup error: tt.loginUser cannot be nil when tt.regRepoError is nil for test: %s", tt.name)
					}
					mockAuthRepo.On("RegisterAdminWithGoogle", mock.Anything, tt.token).Return(tt.loginUser, &domain.Employee{}, nil).Once()
				} else {
					mockAuthRepo.On("RegisterAdminWithGoogle", mock.Anything, tt.token).Return(nil, nil, tt.regRepoError).Once()
				}

				if errors.Is(tt.regRepoError, domain.ErrEmailAlreadyExists) || errors.Is(tt.regRepoError, domain.ErrUserAlreadyExists) {
					mockAuthRepo.On("LoginWithGoogle", mock.Anything, tt.token).Return(tt.loginUser, tt.loginRepoError).Maybe()
				}

				var userForTokenGen *domain.User = nil
				if tt.regRepoError == nil {
					userForTokenGen = tt.loginUser
				} else if (errors.Is(tt.regRepoError, domain.ErrEmailAlreadyExists) || errors.Is(tt.regRepoError, domain.ErrUserAlreadyExists)) && tt.loginRepoError == nil {
					userForTokenGen = tt.loginUser
				}

				if userForTokenGen != nil {
					mockAuthRepo.On("RevokeAllUserRefreshTokens", mock.Anything, userForTokenGen.ID).Return(nil).Maybe()

					mockJWTService.On("GenerateToken", userForTokenGen.ID, userForTokenGen.Email, userForTokenGen.Role).
						Return("access-token", "refresh-token", "hashed-token", tt.jwtError).Maybe()

					if tt.jwtError == nil {
						mockAuthRepo.On("StoreRefreshToken", mock.Anything, mock.AnythingOfType("*domain.RefreshToken")).
							Return(tt.storeTokenError).Maybe()

						if tt.storeTokenError == nil {
							mockAuthRepo.On("UpdateLastLogin", mock.Anything, userForTokenGen.ID, mock.AnythingOfType("time.Time")).
								Return(tt.updateLoginError).Maybe()
						}
					}
				}
			}

			user, accessToken, refreshToken, err := uc.RegisterAdminWithGoogle(context.Background(), tt.token)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				if errors.Is(tt.expectedErr, domain.ErrInvalidToken) {
					assert.ErrorIs(t, err, domain.ErrInvalidToken)
				} else {
					assert.Contains(t, err.Error(), tt.expectedErr.Error())
				}
				assert.Nil(t, user)
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, "access-token", accessToken)
				assert.Equal(t, "refresh-token", refreshToken)
				assert.Equal(t, tt.expectedUserEmail, user.Email)
				assert.NotNil(t, user.LastLoginAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}

func TestLoginWithGoogle(t *testing.T) {
	var (
		validToken       = "valid-google-token"
		emptyToken       = ""
		loginError       = errors.New("repo login failed")
		testConfig       = createTestConfig()
		dbStoreFailedErr = errors.New("db store failed")
	)

	tests := []struct {
		name              string
		token             string
		repoUser          *domain.User
		repoError         error
		jwtError          error
		storeTokenError   error
		updateLoginError  error
		expectedUserEmail string
		expectedErr       error
	}{
		{
			name:              "successful login",
			token:             validToken,
			repoUser:          &domain.User{ID: 1, Email: "test@example.com", Role: enums.RoleAdmin},
			repoError:         nil,
			jwtError:          nil,
			storeTokenError:   nil,
			updateLoginError:  nil,
			expectedUserEmail: "test@example.com",
			expectedErr:       nil,
		},
		{
			name:        "empty token",
			token:       emptyToken,
			expectedErr: domain.ErrInvalidToken,
		},
		{
			name:        "repository login error",
			token:       validToken,
			repoUser:    nil,
			repoError:   loginError,
			expectedErr: fmt.Errorf("google login failed: %w", loginError),
		},
		{
			name:        "login ok, jwt generation error",
			token:       validToken,
			repoUser:    &domain.User{ID: 1, Email: "test@example.com", Role: enums.RoleAdmin},
			repoError:   nil,
			jwtError:    fmt.Errorf("jwt gen failed"),
			expectedErr: fmt.Errorf("token issuance failed after google login: %w", fmt.Errorf("failed to generate token: %w", errors.New("jwt gen failed"))),
		},
		{
			name:            "login ok, store token error",
			token:           validToken,
			repoUser:        &domain.User{ID: 1, Email: "test@example.com", Role: enums.RoleAdmin},
			repoError:       nil,
			jwtError:        nil,
			storeTokenError: dbStoreFailedErr,
			expectedErr:     fmt.Errorf("token issuance failed after google login: %w", dbStoreFailedErr),
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
				testConfig,
				nil,
			)

			if tt.token != "" {
				mockAuthRepo.On("LoginWithGoogle", mock.Anything, tt.token).
					Return(tt.repoUser, tt.repoError).Maybe()

				if tt.repoError == nil && tt.repoUser != nil {
					mockAuthRepo.On("RevokeAllUserRefreshTokens", mock.Anything, tt.repoUser.ID).Return(nil).Maybe()

					mockJWTService.On("GenerateToken", tt.repoUser.ID, tt.repoUser.Email, tt.repoUser.Role).
						Return("access-token", "refresh-token", "hashed-token", tt.jwtError).Maybe()

					if tt.jwtError == nil {
						mockAuthRepo.On("StoreRefreshToken", mock.Anything, mock.AnythingOfType("*domain.RefreshToken")).
							Return(tt.storeTokenError).Maybe()

						if tt.storeTokenError == nil {
							mockAuthRepo.On("UpdateLastLogin", mock.Anything, tt.repoUser.ID, mock.AnythingOfType("time.Time")).Return(tt.updateLoginError).Maybe()
						}
					}
				}
			}

			user, accessToken, refreshToken, err := uc.LoginWithGoogle(context.Background(), tt.token)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				if errors.Is(tt.expectedErr, domain.ErrInvalidToken) {
					assert.ErrorIs(t, err, domain.ErrInvalidToken)
				} else {
					assert.Contains(t, err.Error(), tt.expectedErr.Error())
				}
				assert.Nil(t, user)
				assert.Empty(t, accessToken)
				assert.Empty(t, refreshToken)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, "access-token", accessToken)
				assert.Equal(t, "refresh-token", refreshToken)
				assert.Equal(t, tt.expectedUserEmail, user.Email)
				assert.NotNil(t, user.LastLoginAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockJWTService.AssertExpectations(t)
		})
	}
}
