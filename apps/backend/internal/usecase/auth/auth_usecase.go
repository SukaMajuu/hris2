package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	"gorm.io/gorm"
)

type AuthUseCase struct {
	authRepo     interfaces.AuthRepository
	employeeRepo interfaces.EmployeeRepository
	jwtService   jwt.Service
	config       *config.Config
}

func NewAuthUseCase(
	authRepo interfaces.AuthRepository,
	employeeRepo interfaces.EmployeeRepository,
	jwtService jwt.Service,
	config *config.Config,
) *AuthUseCase {
	return &AuthUseCase{
		authRepo:     authRepo,
		employeeRepo: employeeRepo,
		jwtService:   jwtService,
		config:       config,
	}
}

func (uc *AuthUseCase) issueTokensAndStoreRefresh(ctx context.Context, user *domain.User, rememberMe bool) (string, string, error) {
	var accessToken, refreshToken string
	var refreshTokenHash string
	var err error

	var refreshDuration time.Duration
	var errParseDur error

	if rememberMe {
		refreshDuration, errParseDur = time.ParseDuration(uc.config.JWT.RememberMeDuration)
	} else {
		refreshDuration, errParseDur = time.ParseDuration(uc.config.JWT.RefreshDuration)
	}

	if errParseDur != nil {
		log.Printf("Error parsing refresh duration: %v", errParseDur)
		return "", "", fmt.Errorf("invalid refresh token duration configuration")
	}

	// Revoke existing refresh tokens for this user to prevent conflicts
	if revokeErr := uc.authRepo.RevokeAllUserRefreshTokens(ctx, user.ID); revokeErr != nil {
		log.Printf("Warning: Failed to revoke existing refresh tokens for user ID %d: %v", user.ID, revokeErr)
		// Continue anyway, as this is not critical
	}

	for i := 0; i < 3; i++ {
		if i > 0 {
			// Exponential backoff with jitter
			backoffDelay := time.Duration(100*(1<<i)) * time.Millisecond
			time.Sleep(backoffDelay)
			log.Printf("Retrying token generation for user ID %d, attempt %d/%d after %v delay.", user.ID, i+1, 3, backoffDelay)
		}

		var genErr error
		accessToken, refreshToken, refreshTokenHash, genErr = uc.jwtService.GenerateToken(user.ID, user.Email, user.Role)
		if genErr != nil {
			log.Printf("JWT generation failed for user ID %d (attempt %d/%d): %v", user.ID, i+1, 3, genErr)
			err = fmt.Errorf("failed to generate token: %w", genErr)
			if i < 2 {
				continue
			} else {
				return "", "", err
			}
		}

		refreshTokenRecord := &domain.RefreshToken{
			UserID:    user.ID,
			TokenHash: refreshTokenHash,
			ExpiresAt: time.Now().Add(refreshDuration),
		}

		storeErr := uc.authRepo.StoreRefreshToken(ctx, refreshTokenRecord)
		if storeErr == nil {
			now := time.Now()
			user.LastLoginAt = &now
			if errUpdateLogin := uc.authRepo.UpdateLastLogin(ctx, user.ID, now); errUpdateLogin != nil {
				log.Printf("Warning: Failed to update LastLoginAt in DB for user %d after token issuance: %v", user.ID, errUpdateLogin)
			}
			return accessToken, refreshToken, nil
		}

		err = storeErr

		if strings.Contains(storeErr.Error(), "failed to store refresh token due to conflict") {
			var hashPrefix string
			if len(refreshTokenHash) > 0 {
				hashPrefix = refreshTokenHash[:min(10, len(refreshTokenHash))] + "..."
			}
			log.Printf("StoreRefreshToken conflict for user ID %d, hash %s (attempt %d/%d). Error: %v", user.ID, hashPrefix, i+1, 3, storeErr)
			if i < 2 {
				continue
			}
			log.Printf("Persistent StoreRefreshToken conflict for user ID %d after %d attempts. Last hash prefix: %s", user.ID, 3, hashPrefix)
			break
		} else {
			log.Printf("Failed to store refresh token for user ID %d (attempt %d/%d) due to non-conflict error: %v", user.ID, i+1, 3, storeErr)
			return "", "", err
		}
	}

	log.Printf("Failed to issue tokens and store refresh for user ID %d after multiple attempts. Last error: %v", user.ID, err)
	return "", "", err
}

// --- Registration (Admin Only) ---

func (uc *AuthUseCase) RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) (*domain.User, string, string, error) {
	user.Role = enums.RoleAdmin

	err := uc.authRepo.RegisterAdminWithForm(ctx, user, employee)
	if err != nil {
		return nil, "", "", fmt.Errorf("failed to register admin: %w", err)
	}

	accessToken, refreshToken, err := uc.issueTokensAndStoreRefresh(ctx, user, false)
	if err != nil {
		return nil, "", "", fmt.Errorf("token issuance failed after registration: %w", err)
	}

	return user, accessToken, refreshToken, nil
}

func (uc *AuthUseCase) RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, string, string, error) {
	if token == "" {
		return nil, "", "", domain.ErrInvalidToken
	}

	newUser, newEmployee, err := uc.authRepo.RegisterAdminWithGoogle(ctx, token)

	var userToProcess *domain.User

	if err == nil {
		userToProcess = newUser
		_ = newEmployee
	} else if errors.Is(err, domain.ErrEmailAlreadyExists) || errors.Is(err, domain.ErrUserAlreadyExists) {
		existingUser, loginErr := uc.authRepo.LoginWithGoogle(ctx, token)
		if loginErr != nil {
			return nil, "", "", fmt.Errorf("existing user login failed: %w", loginErr)
		}
		userToProcess = existingUser
	} else {
		return nil, "", "", fmt.Errorf("failed Google admin registration: %w", err)
	}

	if userToProcess == nil {
		return nil, "", "", fmt.Errorf("internal error: user object not available after registration/login attempt")
	}

	accessToken, refreshToken, err := uc.issueTokensAndStoreRefresh(ctx, userToProcess, false)
	if err != nil {
		return nil, "", "", fmt.Errorf("token issuance failed after google registration/login: %w", err)
	}

	return userToProcess, accessToken, refreshToken, nil
}

// --- Login Methods ---

func (uc *AuthUseCase) LoginWithIdentifier(ctx context.Context, identifier, password string, rememberMe bool) (*domain.User, string, string, error) {
	var user *domain.User
	var err error

	if strings.Contains(identifier, "@") {
		user, err = uc.authRepo.LoginWithEmail(ctx, identifier, password)
	} else if strings.HasPrefix(identifier, "+") || strings.HasPrefix(identifier, "0") {
		user, err = uc.authRepo.LoginWithPhone(ctx, identifier, password)
	} else {
		user, err = uc.authRepo.LoginWithEmployeeCredentials(ctx, identifier, password)
	}

	if err != nil {
		return nil, "", "", fmt.Errorf("login failed: %w", err)
	}

	accessToken, refreshToken, err := uc.issueTokensAndStoreRefresh(ctx, user, rememberMe)
	if err != nil {
		return nil, "", "", fmt.Errorf("token issuance failed after login: %w", err)
	}

	return user, accessToken, refreshToken, nil
}

func (uc *AuthUseCase) LoginWithGoogle(ctx context.Context, token string) (*domain.User, string, string, error) {
	if token == "" {
		return nil, "", "", domain.ErrInvalidToken
	}

	user, err := uc.authRepo.LoginWithGoogle(ctx, token)
	if err != nil {
		return nil, "", "", fmt.Errorf("google login failed: %w", err)
	}

	accessToken, refreshToken, err := uc.issueTokensAndStoreRefresh(ctx, user, false)
	if err != nil {
		return nil, "", "", fmt.Errorf("token issuance failed after google login: %w", err)
	}

	return user, accessToken, refreshToken, nil
}

// --- Password Management ---

func (uc *AuthUseCase) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	if userID == 0 || oldPassword == "" || newPassword == "" {
		return domain.ErrInvalidPassword
	}

	user, err := uc.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user by ID: %w", err)
	}

	_, err = uc.authRepo.LoginWithEmail(ctx, user.Email, oldPassword)
	if err != nil {
		return domain.ErrInvalidCredentials
	}

	err = uc.authRepo.ChangePassword(ctx, userID, oldPassword, newPassword)
	if err != nil {
		return fmt.Errorf("failed to change password in repository: %w", err)
	}

	if err := uc.authRepo.RevokeAllUserRefreshTokens(ctx, userID); err != nil {
		log.Printf("Failed to revoke refresh tokens after password change for user %d: %v", userID, err)
	}

	return nil
}

func (uc *AuthUseCase) ResetPassword(ctx context.Context, email string) error {
	if email == "" || !strings.Contains(email, "@") {
		return domain.ErrInvalidEmail
	}

	err := uc.authRepo.ResetPassword(ctx, email)
	if err != nil {
		fmt.Printf("Error initiating password reset for %s (usecase): %v\n", email, err)
	}
	return nil
}

func (uc *AuthUseCase) RefreshToken(ctx context.Context, rawRefreshToken string) (string, string, error) {
	if rawRefreshToken == "" {
		return "", "", domain.ErrInvalidToken
	}

	claims, err := uc.jwtService.ValidateToken(rawRefreshToken)
	if err != nil {
		if errors.Is(err, domain.ErrTokenExpired) {
			return "", "", fmt.Errorf("refresh token expired: %w", domain.ErrInvalidToken)
		}
		return "", "", fmt.Errorf("failed to validate refresh token structure: %w", domain.ErrInvalidToken)
	}

	if claims.TokenType != enums.TokenTypeRefresh {
		return "", "", fmt.Errorf("token is not a refresh token: %w", domain.ErrInvalidToken)
	}

	incomingTokenHash, err := uc.jwtService.HashToken(rawRefreshToken)
	if err != nil {
		return "", "", fmt.Errorf("internal error during token refresh: %w", err)
	}

	storedToken, err := uc.authRepo.FindRefreshTokenByHash(ctx, incomingTokenHash)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", "", fmt.Errorf("refresh token not found or already used: %w", domain.ErrInvalidToken)
		}
		return "", "", fmt.Errorf("internal error during token refresh: %w", err)
	}

	if storedToken.Revoked {
		return "", "", fmt.Errorf("refresh token has been revoked: %w", domain.ErrInvalidToken)
	}
	if time.Now().After(storedToken.ExpiresAt) {
		return "", "", fmt.Errorf("refresh token expired: %w", domain.ErrInvalidToken)
	}
	if storedToken.UserID != claims.UserID {
		return "", "", fmt.Errorf("token user mismatch: %w", domain.ErrInvalidToken)
	}

	if err := uc.authRepo.RevokeRefreshTokenByID(ctx, storedToken.ID); err != nil {
		return "", "", fmt.Errorf("internal error during token refresh: %w", err)
	}

	user, err := uc.authRepo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return "", "", fmt.Errorf("failed to retrieve user details for refresh: %w", err)
	}

	newAccessToken, newRefreshToken, newRefreshTokenHash, err := uc.jwtService.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return "", "", fmt.Errorf("failed to generate new tokens: %w", err)
	}

	refreshDuration, _ := time.ParseDuration(uc.config.JWT.RefreshDuration)
	newRefreshTokenRecord := &domain.RefreshToken{
		UserID:    user.ID,
		TokenHash: newRefreshTokenHash,
		ExpiresAt: time.Now().Add(refreshDuration),
	}
	if err := uc.authRepo.StoreRefreshToken(ctx, newRefreshTokenRecord); err != nil {
		return "", "", fmt.Errorf("failed to store new refresh token: %w", err)
	}

	return newAccessToken, newRefreshToken, nil
}

func (uc *AuthUseCase) Logout(ctx context.Context, userID uint) error {
	if err := uc.authRepo.RevokeAllUserRefreshTokens(ctx, userID); err != nil {
		return fmt.Errorf("error revoking tokens during logout: %w", err)
	}
	return nil
}

func (uc *AuthUseCase) VerifyAccessToken(ctx context.Context, accessToken string) (uint, enums.UserRole, error) {
	if accessToken == "" {
		return 0, "", domain.ErrInvalidToken
	}

	claims, err := uc.jwtService.ValidateToken(accessToken)
	if err != nil {
		if errors.Is(err, domain.ErrTokenExpired) {
			return 0, "", fmt.Errorf("access token expired: %w", domain.ErrInvalidToken)
		}
		return 0, "", fmt.Errorf("failed to validate access token: %w", domain.ErrInvalidToken)
	}

	if claims.TokenType != enums.TokenTypeAccess {
		return 0, "", fmt.Errorf("token is not an access token: %w", domain.ErrInvalidToken)
	}

	return claims.UserID, claims.Role, nil
}

func (uc *AuthUseCase) UpdateUserPassword(ctx context.Context, userID uint, accessToken, oldPassword, newPassword string) error {
	if userID == 0 || accessToken == "" || oldPassword == "" || newPassword == "" {
		return domain.ErrInvalidPassword
	}

	// Call repository with the oldPassword parameter
	err := uc.authRepo.UpdateUserPassword(ctx, userID, accessToken, oldPassword, newPassword)
	if err != nil {
		return fmt.Errorf("failed to update user password: %w", err)
	}

	// Revoke all refresh tokens for security after password change
	if err := uc.authRepo.RevokeAllUserRefreshTokens(ctx, userID); err != nil {
		log.Printf("Failed to revoke refresh tokens after password change for user %d: %v", userID, err)
	}

	return nil
}
