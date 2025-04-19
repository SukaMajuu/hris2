package interfaces

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type AuthRepository interface {
	// Registration Methods (Admin Only)
	RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) error
	RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, *domain.Employee, error)

	// Login Methods
	LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error)
	LoginWithGoogle(ctx context.Context, token string) (*domain.User, error)
	LoginWithPhone(ctx context.Context, phone, password string) (*domain.User, error)
	LoginWithEmployeeCredentials(ctx context.Context, employeeCode, password string) (*domain.User, error)

	// Password Management
	ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error
	ResetPassword(ctx context.Context, email string) error

	// Common operations
	GetUserByID(ctx context.Context, id uint) (*domain.User, error)
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserByPhone(ctx context.Context, phone string) (*domain.User, error)
	GetUserByEmployeeCode(ctx context.Context, code string) (*domain.User, error)
}
