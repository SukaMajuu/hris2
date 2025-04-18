package auth

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
)

type AuthUseCase struct {
	authRepo     interfaces.AuthRepository
	employeeRepo interfaces.EmployeeRepository
	jwtService   jwt.Service
}

func NewAuthUseCase(
	authRepo interfaces.AuthRepository,
	employeeRepo interfaces.EmployeeRepository,
	jwtService jwt.Service,
) *AuthUseCase {
	return &AuthUseCase{
		authRepo:     authRepo,
		employeeRepo: employeeRepo,
		jwtService:   jwtService,
	}
}

// --- Registration (Admin Only) ---

func (uc *AuthUseCase) RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) error {
	if user.Email == "" || user.Password == "" || employee.FirstName == "" || employee.LastName == "" {
		return fmt.Errorf("missing required fields for admin registration")
	}

	user.Role = enums.RoleAdmin
	employee.PositionID = 1
	user.CreatedAt = time.Now()
	employee.CreatedAt = time.Now()

	err := uc.authRepo.RegisterAdminWithForm(ctx, user, employee)
	if err != nil {
		return fmt.Errorf("failed to register admin: %w", err)
	}

	return nil
}

func (uc *AuthUseCase) RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, *domain.Employee, error) {
	if token == "" {
		return nil, nil, domain.ErrInvalidToken
	}

	user, employee, err := uc.authRepo.RegisterAdminWithGoogle(ctx, token)
	user.Role = enums.RoleAdmin
	employee.PositionID = 1
	user.CreatedAt = time.Now()
	employee.CreatedAt = time.Now()

	if err != nil {
		if user, err := uc.LoginWithGoogle(ctx, token); err == nil {
			return user, employee, nil
		}
		return nil, nil, fmt.Errorf("failed Google admin registration: %w", err)
	}

	return user, employee, nil
}

// --- Login Methods ---

func (uc *AuthUseCase) LoginWithIdentifier(ctx context.Context, identifier, password string) (*domain.User, error) {
	// TODO: Implement form login business logic
	return nil, nil
}

func (uc *AuthUseCase) LoginWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	// TODO: Implement Google login business logic
	// - Verify Google token (Repo does this)
	// - Get user from repo
	// - Check account status
	// - Generate JWT tokens

	if token == "" {
		return nil, domain.ErrInvalidToken
	}
	user, err := uc.authRepo.LoginWithGoogle(ctx, token)
	if err != nil {
		// TODO: Handle specific errors (e.g., user not registered)
		return nil, fmt.Errorf("google login failed: %w", err)
	}

	// TODO: Check user status
	// TODO: Generate Tokens

	return user, nil
}

// --- Password Management ---

func (uc *AuthUseCase) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	// TODO: Implement password change business logic
	// - Validate userID
	// - **VERIFY OLD PASSWORD** (Challenge: How? See login methods)
	// - Check password strength for newPassword
	// - Check password history (if required)
	// - Call repo to update password (in Firebase)

	if userID == 0 || oldPassword == "" || newPassword == "" {
		return domain.ErrInvalidPassword // Or more specific errors
	}
	// TODO: Add New Password Strength Check

	// TODO: How to verify oldPassword? This needs to happen before calling the repo.
	// user, err := uc.authRepo.GetUserByID(ctx, userID) ... verify oldPassword against hash or via Firebase client/API...

	// Assuming old password verified somehow:
	err := uc.authRepo.ChangePassword(ctx, userID, oldPassword, newPassword)
	if err != nil {
		return fmt.Errorf("failed to change password: %w", err)
	}
	return nil
}

func (uc *AuthUseCase) ResetPassword(ctx context.Context, email string) error {
	// TODO: Implement password reset business logic
	// - Validate email format
	// - Check if email exists
	// - Generate reset token/link (Repo handles Firebase link generation)
	// - Potentially log the request or send email via separate service

	if email == "" || !strings.Contains(email, "@") { // Basic validation
		return domain.ErrInvalidEmail
	}

	// Optional: Check if user exists before attempting reset link generation
	// _, err := uc.authRepo.GetUserByEmail(ctx, email)
	// if err != nil { return domain.ErrInvalidEmail } // Don't reveal if email exists

	err := uc.authRepo.ResetPassword(ctx, email)
	if err != nil {
		// Log the error, but maybe return a generic success message to avoid leaking info
		fmt.Printf("Error initiating password reset for %s: %v\n", email, err)
		// return fmt.Errorf("failed to initiate password reset: %w", err)
	}

	// Return nil typically, even if email doesn't exist, to prevent enumeration
	return nil
}
