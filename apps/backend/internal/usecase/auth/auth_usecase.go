package auth

import (
	"context"
	"errors"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

type AuthUseCase struct {
	authRepo     interfaces.AuthRepository
	employeeRepo interfaces.EmployeeRepository
	deptRepo     interfaces.DepartmentRepository
	positionRepo interfaces.PositionRepository
}

func NewAuthUseCase(
	authRepo interfaces.AuthRepository,
	employeeRepo interfaces.EmployeeRepository,
	deptRepo interfaces.DepartmentRepository,
	positionRepo interfaces.PositionRepository,
) *AuthUseCase {
	return &AuthUseCase{
		authRepo:     authRepo,
		employeeRepo: employeeRepo,
		deptRepo:     deptRepo,
		positionRepo: positionRepo,
	}
}

func (uc *AuthUseCase) RegisterWithForm(ctx context.Context, user *domain.User) error {
	if err := validateUserData(user); err != nil {
		return err
	}

	user.Role = enums.UserRole("hr")
	user.CreatedAt = time.Now()
	user.LastLoginAt = &user.CreatedAt

	if err := uc.authRepo.RegisterWithForm(ctx, user); err != nil {
		return err
	}

	return nil
}

func (uc *AuthUseCase) RegisterWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	// TODO: Implement Google registration business logic
	// - Verify Google token
	// - Check if user exists (try login first)
	// - Set default values for new users
	// - Create or update user
	return uc.authRepo.RegisterWithGoogle(ctx, token)
}

// Login Methods
func (uc *AuthUseCase) LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error) {
	// TODO: Implement login business logic
	// - Validate credentials
	// - Check account lockout
	// - Handle failed attempts
	// - Check account status
	// - Generate JWT token
	if email == "" || password == "" {
		return nil, domain.ErrInvalidCredentials
	}
	return uc.authRepo.LoginWithEmail(ctx, email, password)
}

func (uc *AuthUseCase) LoginWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	// TODO: Implement Google login business logic
	// - Verify Google token
	// - Check account status
	// - Generate JWT token
	if token == "" {
		return nil, domain.ErrInvalidToken
	}
	return uc.authRepo.LoginWithGoogle(ctx, token)
}

func (uc *AuthUseCase) LoginWithPhone(ctx context.Context, phone, otp string) (*domain.User, error) {
	// TODO: Implement phone login business logic
	// - Validate phone and OTP
	// - Check OTP expiration
	// - Check attempt limits
	// - Generate JWT token
	if phone == "" || otp == "" {
		return nil, domain.ErrInvalidCredentials
	}
	return uc.authRepo.LoginWithPhone(ctx, phone, otp)
}

func (uc *AuthUseCase) LoginWithEmployeeID(ctx context.Context, employeeID, password string) (*domain.User, error) {
	// TODO: Implement employee login business logic
	// - Validate employee ID
	// - Check account status
	// - Generate JWT token
	if employeeID == "" || password == "" {
		return nil, domain.ErrInvalidCredentials
	}
	return uc.authRepo.LoginWithEmployeeID(ctx, employeeID, password)
}

// OTP Operations
func (uc *AuthUseCase) RequestOTP(ctx context.Context, phone string) error {
	// TODO: Implement OTP request business logic
	// - Validate phone number
	// - Check attempt limits
	// - Generate OTP
	// - Send OTP via SMS
	if phone == "" {
		return domain.ErrInvalidPhoneNumber
	}
	return uc.authRepo.RequestOTP(ctx, phone)
}

func (uc *AuthUseCase) VerifyOTP(ctx context.Context, phone, otp string) error {
	// TODO: Implement OTP verification business logic
	// - Validate OTP
	// - Check expiration
	// - Check attempt limits
	if phone == "" || otp == "" {
		return domain.ErrInvalidOTP
	}
	return uc.authRepo.VerifyOTP(ctx, phone, otp)
}

// Password Management
func (uc *AuthUseCase) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	// TODO: Implement password change business logic
	// - Verify old password
	// - Check password strength
	// - Check password history
	// - Update password
	if oldPassword == "" || newPassword == "" {
		return domain.ErrInvalidPassword
	}
	return uc.authRepo.ChangePassword(ctx, userID, oldPassword, newPassword)
}

func (uc *AuthUseCase) ResetPassword(ctx context.Context, email string) error {
	// TODO: Implement password reset business logic
	// - Validate email
	// - Generate reset token
	// - Send reset email
	if email == "" {
		return domain.ErrInvalidEmail
	}
	return uc.authRepo.ResetPassword(ctx, email)
}

// Common operations
func (uc *AuthUseCase) GetUserByID(ctx context.Context, id uint) (*domain.User, error) {
	// TODO: Implement get user business logic
	// - Check permissions
	// - Validate user ID
	if id == 0 {
		return nil, domain.ErrInvalidUserID
	}
	return uc.authRepo.GetUserByID(ctx, id)
}

func (uc *AuthUseCase) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	// TODO: Implement get user by email business logic
	// - Check permissions
	// - Validate email
	if email == "" {
		return nil, domain.ErrInvalidEmail
	}
	return uc.authRepo.GetUserByEmail(ctx, email)
}

func (uc *AuthUseCase) UpdateUser(ctx context.Context, user *domain.User) error {
	// TODO: Implement update user business logic
	// - Check permissions
	// - Validate user data
	// - Handle role updates
	if user == nil {
		return domain.ErrInvalidUser
	}
	return uc.authRepo.UpdateUser(ctx, user)
}

func (uc *AuthUseCase) DeleteUser(ctx context.Context, id uint) error {
	// TODO: Implement delete user business logic
	// - Check permissions
	// - Handle related data
	// - Soft delete
	if id == 0 {
		return domain.ErrInvalidUserID
	}
	return uc.authRepo.DeleteUser(ctx, id)
}

// Helper functions
func validateUserData(user *domain.User) error {
	if user == nil {
		return domain.ErrInvalidUser
	}
	if user.Email == "" {
		return domain.ErrInvalidEmail
	}
	if user.Password == "" {
		return domain.ErrInvalidPassword
	}
	return nil
}

func (uc *AuthUseCase) CreateEmployee(ctx context.Context, employee *domain.Employee) error {
	if employee == nil {
		return domain.ErrInvalidUser
	}

	if employee.UserID == 0 {
		return domain.ErrInvalidUserID
	}

	if employee.EmployeeCode == "" {
		return errors.New("employee code is required")
	}

	if employee.FirstName == "" {
		return errors.New("first name is required")
	}

	if employee.LastName == "" {
		return errors.New("last name is required")
	}

	if employee.DepartmentID == 0 {
		return errors.New("department ID is required")
	}

	if employee.PositionID == 0 {
		return errors.New("position ID is required")
	}

	// Set default values
	employee.EmploymentStatus = true
	employee.CreatedAt = time.Now()
	employee.UpdatedAt = time.Now()

	// TODO: Implement employee creation in repository
	// For now, we'll just return nil
	return nil
}
