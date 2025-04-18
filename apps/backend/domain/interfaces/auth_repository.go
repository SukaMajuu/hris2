package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type AuthRepository interface {
	// Registration Methods (only 2 ways)
	RegisterWithForm(ctx context.Context, user *domain.User) error
	RegisterWithGoogle(ctx context.Context, token string) (*domain.User, error)

	// Login Methods (4 ways)
	LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error)
	LoginWithGoogle(ctx context.Context, token string) (*domain.User, error)
	LoginWithPhone(ctx context.Context, phone, otp string) (*domain.User, error)
	LoginWithEmployeeID(ctx context.Context, employeeID, password string) (*domain.User, error)

	// OTP Operations
	RequestOTP(ctx context.Context, phone string) error
	VerifyOTP(ctx context.Context, phone, otp string) error

	// Password Management
	ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error
	ResetPassword(ctx context.Context, email string) error

	// Common operations
	GetUserByID(ctx context.Context, id uint) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	UpdateUser(ctx context.Context, user *domain.User) error
	DeleteUser(ctx context.Context, id uint) error
}
