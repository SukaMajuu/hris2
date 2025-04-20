package auth

import (
	"context"
	"errors"
	"fmt"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"google.golang.org/api/option"
	"gorm.io/gorm"
)

type firebaseRepository struct {
	db     *gorm.DB
	client *auth.Client
}

func NewFirebaseRepository(db *gorm.DB, credentialsFile string) (interfaces.AuthRepository, error) {
	opt := option.WithCredentialsFile(credentialsFile)
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, fmt.Errorf("error initializing firebase app: %v", err)
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		return nil, fmt.Errorf("error getting firebase auth client: %v", err)
	}

	return &firebaseRepository{
		db:     db,
		client: client,
	}, nil
}

// --- Registration Methods (Admin Only) ---

func (r *firebaseRepository) RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) error {
	params := (&auth.UserToCreate{}).
		Email(user.Email).
		Password(user.Password).
		DisplayName(fmt.Sprintf("%s %s", employee.FirstName, employee.LastName))

	firebaseUser, err := r.client.CreateUser(ctx, params)
	if err != nil {
		return fmt.Errorf("error creating user in Firebase: %w", err)
	}

	user.FirebaseUID = firebaseUser.UID

	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		_ = r.client.DeleteUser(ctx, firebaseUser.UID)
		return fmt.Errorf("error starting transaction: %w", tx.Error)
	}

	if err := tx.Create(user).Error; err != nil {
		tx.Rollback()
		_ = r.client.DeleteUser(ctx, firebaseUser.UID)
		return fmt.Errorf("error storing user in database: %w", err)
	}

	employee.UserID = user.ID
	if err := tx.Create(employee).Error; err != nil {
		tx.Rollback()
		_ = r.client.DeleteUser(ctx, firebaseUser.UID)
		_ = r.db.WithContext(ctx).Delete(user)
		return fmt.Errorf("error storing employee in database: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		_ = r.client.DeleteUser(ctx, firebaseUser.UID)
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

func (r *firebaseRepository) RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, *domain.Employee, error) {
	decodedToken, err := r.client.VerifyIDToken(ctx, token)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to verify google token: %w", err)
	}

	firebaseUser, err := r.client.GetUser(ctx, decodedToken.UID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get firebase user: %w", err)
	}

	existingUser, err := r.GetUserByEmail(ctx, firebaseUser.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if existingUser != nil {
		return nil, nil, domain.ErrEmailAlreadyExists
	}

	// Create user
	user := &domain.User{
		Email:    firebaseUser.Email,
		GoogleID: &firebaseUser.UID,
		Role:     enums.RoleAdmin,
	}

	// Create employee
	employee := &domain.Employee{
		FirstName:  firebaseUser.DisplayName,
		PositionID: 1,
	}

	tx := r.db.Begin()
	if tx.Error != nil {
		return nil, nil, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	if err := tx.Create(user).Error; err != nil {
		tx.Rollback()
		return nil, nil, fmt.Errorf("failed to create user: %w", err)
	}

	employee.UserID = user.ID

	if err := tx.Create(employee).Error; err != nil {
		tx.Rollback()
		return nil, nil, fmt.Errorf("failed to create employee: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return nil, nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return user, employee, nil
}

// --- Login Methods ---

func (r *firebaseRepository) LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error) {
	userRecord, err := r.client.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	var user domain.User
	if err := r.db.WithContext(ctx).Where("firebase_uid = ?", userRecord.UID).First(&user).Error; err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	return &user, nil
}

func (r *firebaseRepository) LoginWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	// TODO: Implement Google login logic
	return nil, fmt.Errorf("google login not implemented")
}

func (r *firebaseRepository) LoginWithPhone(ctx context.Context, phone, password string) (*domain.User, error) {
	userRecord, err := r.client.GetUserByPhoneNumber(ctx, phone)
	if err != nil {
		return nil, fmt.Errorf("error getting user from Firebase: %w", err)
	}

	var user domain.User
	if err := r.db.WithContext(ctx).Where("firebase_uid = ?", userRecord.UID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("error getting local user: %w", err)
	}

	return &user, nil
}

func (r *firebaseRepository) LoginWithEmployeeCredentials(ctx context.Context, employeeCode, password string) (*domain.User, error) {
	var employee domain.Employee
	if err := r.db.WithContext(ctx).Where("employee_code = ?", employeeCode).Preload("User").First(&employee).Error; err != nil {
		return nil, fmt.Errorf("error finding employee by code: %w", err)
	}

	if employee.User.ID == 0 {
		return nil, fmt.Errorf("employee found but no associated user")
	}

	if _, err := r.client.GetUser(ctx, employee.User.FirebaseUID); err != nil {
		return nil, fmt.Errorf("error verifying user with Firebase: %w", err)
	}

	return &employee.User, nil
}

// --- Password Management ---

// ChangePassword requires verifying the old password, which Firebase Admin SDK cannot do directly.
// This usually involves client-side SDK or custom password handling.
// This implementation *only* updates the password in Firebase, assuming verification happened.
func (r *firebaseRepository) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	user, err := r.GetUserByID(ctx, userID)
	if err != nil {
		return err // User not found locally
	}

	// TODO: Old password verification MUST happen before calling this repository method.

	updateParams := (&auth.UserToUpdate{}).Password(newPassword)
	_, err = r.client.UpdateUser(ctx, user.FirebaseUID, updateParams)
	if err != nil {
		return fmt.Errorf("error updating firebase user password: %w", err)
	}

	// No need to update local DB password as it's not stored there.
	return nil
}

// ResetPassword generates a password reset link via Firebase.
func (r *firebaseRepository) ResetPassword(ctx context.Context, email string) error {
	// Optional: Check if email exists locally first?
	// var user domain.User
	// if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {...

	_, err := r.client.PasswordResetLink(ctx, email)
	if err != nil {
		// Handle specific Firebase errors (e.g., user not found)
		return fmt.Errorf("error generating password reset link: %w", err)
	}

	// The link is usually sent by Firebase Auth service directly or
	// the link can be returned and sent via a custom email service.
	// For this repo method, generating the link is sufficient.
	// log.Printf("Password reset link generated: %s", link) // Don't log sensitive info
	return nil
}

// --- Common Operations ---

func (r *firebaseRepository) GetUserByID(ctx context.Context, id uint) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *firebaseRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *firebaseRepository) GetUserByPhone(ctx context.Context, phone string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *firebaseRepository) GetUserByEmployeeCode(ctx context.Context, code string) (*domain.User, error) {
	var employee domain.Employee
	if err := r.db.WithContext(ctx).Where("employee_code = ?", code).Preload("User").First(&employee).Error; err != nil {
		return nil, fmt.Errorf("error finding employee by code: %w", err)
	}
	if employee.User.ID == 0 {
		return nil, fmt.Errorf("employee found but no associated user")
	}
	return &employee.User, nil
}
