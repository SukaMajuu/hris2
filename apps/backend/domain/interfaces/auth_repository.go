package interfaces

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

// AuthRepository defines methods for authentication and user data persistence
type AuthRepository interface {
	// Registration Methods (Admin Only)
	RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) error
	RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, *domain.Employee, error)

	// Method for creating account for employee
	RegisterEmployeeUser(ctx context.Context, user *domain.User, employee *domain.Employee) error

	// Login Methods
	LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error)
	LoginWithGoogle(ctx context.Context, token string) (*domain.User, error)
	LoginWithPhone(ctx context.Context, phone, password string) (*domain.User, error)
	LoginWithEmployeeCredentials(ctx context.Context, employeeCode, password string) (*domain.User, error)

	// Password Management
	ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error
	UpdateUserPassword(ctx context.Context, userID uint, accessToken, oldPassword, newPassword string) error
	ResetPassword(ctx context.Context, email string) error

	// Common operations
	GetUserByID(ctx context.Context, id uint) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserByPhone(ctx context.Context, phone string) (*domain.User, error)
	GetUserByEmployeeCode(ctx context.Context, code string) (*domain.User, error)

	// Refresh Token Management (New)
	StoreRefreshToken(ctx context.Context, token *domain.RefreshToken) error
	FindRefreshTokenByHash(ctx context.Context, hash string) (*domain.RefreshToken, error)
	RevokeRefreshTokenByID(ctx context.Context, tokenID uint) error
	RevokeAllUserRefreshTokens(ctx context.Context, userID uint) error

	// Last Login Update (New)
	UpdateLastLogin(ctx context.Context, userID uint, loginTime time.Time) error

	// Method for updating user details
	UpdateUser(ctx context.Context, user *domain.User) error
}
