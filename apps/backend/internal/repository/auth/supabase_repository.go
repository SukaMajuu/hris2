package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/SukaMajuu/hris/apps/backend/pkg/utils"
	"github.com/google/uuid"

	"strings"

	"github.com/supabase-community/gotrue-go/types"
	supa "github.com/supabase-community/supabase-go"
	"gorm.io/gorm"
)

type supabaseRepository struct {
	db     *gorm.DB
	client *supa.Client
}

func NewSupabaseRepository(db *gorm.DB, supabaseURL, supabaseKey string) (interfaces.AuthRepository, error) {
	client, err := supa.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		return nil, fmt.Errorf("error initializing supabase client: %v", err)
	}

	return &supabaseRepository{
		db:     db,
		client: client,
	}, nil
}

// --- Registration Methods (Admin Only) ---

func (r *supabaseRepository) RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) error {
	signUpOpts := types.SignupRequest{
		Email:    user.Email,
		Password: user.Password,
	}

	supaUserResponse, err := r.client.Auth.Signup(signUpOpts)
	if err != nil {
		errStr := err.Error()
		if strings.Contains(errStr, "User already registered") || strings.Contains(errStr, "user_already_exists") || strings.Contains(errStr, "400") || strings.Contains(errStr, "422"){
			return domain.ErrEmailAlreadyExists
		}
		return fmt.Errorf("error creating user in Supabase: %w", err)
	}

	if supaUserResponse == nil || supaUserResponse.ID == uuid.Nil {
		return fmt.Errorf("supabase SignUp returned nil user or empty ID")
	}

	supaUserIDStr := supaUserResponse.ID.String()
	user.SupabaseUID = &supaUserIDStr

	tx := r.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		deleteReq := types.AdminDeleteUserRequest{
			UserID:               supaUserResponse.ID,
		}
		_ = r.client.Auth.AdminDeleteUser(deleteReq)
		return fmt.Errorf("error starting transaction: %w", tx.Error)
	}

	user.Role = enums.RoleAdmin

	if err := tx.Create(user).Error; err != nil {
		tx.Rollback()
		errStr := err.Error()
		if strings.Contains(errStr, "23505") && strings.Contains(errStr, "uni_users_supabase_uid") {
			deleteReq := types.AdminDeleteUserRequest{
				UserID: supaUserResponse.ID,
			}
			_ = r.client.Auth.AdminDeleteUser(deleteReq)
			return domain.ErrUserAlreadyExists
		}
		deleteReq := types.AdminDeleteUserRequest{
			UserID: supaUserResponse.ID,
		}
		_ = r.client.Auth.AdminDeleteUser(deleteReq)
		return fmt.Errorf("error storing user in database: %w", err)
	}

	employee.UserID = user.ID
	if err := tx.Create(employee).Error; err != nil {
		tx.Rollback()
		deleteReq := types.AdminDeleteUserRequest{
			UserID: supaUserResponse.ID,
		}
		_ = r.client.Auth.AdminDeleteUser(deleteReq)
		_ = r.db.WithContext(ctx).Delete(user)
		return fmt.Errorf("error storing employee in database: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		_ = r.client.Auth.AdminDeleteUser(types.AdminDeleteUserRequest{
			UserID: supaUserResponse.ID,
		})
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *supabaseRepository) RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, *domain.Employee, error) {
	authedClient := r.client.Auth.WithToken(token)
	supaUser, err := authedClient.GetUser()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to verify supabase token: %w", err)
	}
	if supaUser == nil || supaUser.ID == uuid.Nil {
		return nil, nil, fmt.Errorf("invalid supabase user from token")
	}

	var existingUser domain.User
	err = r.db.WithContext(ctx).Where("supabase_uid = ?", supaUser.ID).First(&existingUser).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, nil, fmt.Errorf("failed to check existing user by supabase uid: %w", err)
	}
	if existingUser.ID != 0 {
		return nil, nil, domain.ErrUserAlreadyExists
	}

	err = r.db.WithContext(ctx).Where("email = ?", supaUser.Email).First(&existingUser).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return nil, nil, fmt.Errorf("failed to check existing user by email: %w", err)
	}
	if existingUser.ID != 0 {
		return nil, nil, domain.ErrEmailAlreadyExists
	}

	supaUserIDStr := supaUser.ID.String()
	user := &domain.User{
		Email:       supaUser.Email,
		SupabaseUID: &supaUserIDStr,
		Role:        enums.RoleAdmin,
	}

	var firstName string
	var lastName *string

	if fullName, ok := supaUser.UserMetadata["full_name"].(string); ok {
		firstName, lastName = utils.SplitDisplayName(fullName)
	} else {
		firstName = "Google"
		defaultLastName := "User"
		lastName = &defaultLastName
	}

	employee := &domain.Employee{
		FirstName:  firstName,
		LastName:   lastName,
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
		_ = r.db.WithContext(ctx).Delete(user) // Clean up local user
		return nil, nil, fmt.Errorf("failed to create employee: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return user, employee, nil
}


// --- Login Methods ---

func (r *supabaseRepository) LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error) {
	session, err := r.client.Auth.SignInWithEmailPassword(email, password)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}
	if session == nil || session.User.ID == uuid.Nil {
		return nil, domain.ErrInvalidCredentials
	}

	// Find the local user linked to the Supabase User ID
	var user domain.User
	supaUserIDStr := session.User.ID.String()
	if err := r.db.WithContext(ctx).Where("supabase_uid = ?", supaUserIDStr).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Local user not found, treat as invalid credentials overall
			return nil, domain.ErrInvalidCredentials
		}
		return nil, fmt.Errorf("error retrieving local user: %w", err)
	}

	return &user, nil
}

func (r *supabaseRepository) LoginWithGoogle(ctx context.Context, token string) (*domain.User, error) {
    authedClient := r.client.Auth.WithToken(token)
    supaUser, err := authedClient.GetUser()
    if err != nil {
        return nil, domain.ErrInvalidCredentials
    }
    if supaUser == nil || supaUser.ID == uuid.Nil {
        return nil, domain.ErrInvalidCredentials
    }

    var user domain.User
    supaUserIDStr := supaUser.ID.String()
    if err := r.db.WithContext(ctx).Where("supabase_uid = ?", supaUserIDStr).First(&user).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, domain.ErrUserNotFound
        }
        return nil, fmt.Errorf("error retrieving local user during Google login: %w", err)
    }

    return &user, nil
}

func (r *supabaseRepository) LoginWithPhone(ctx context.Context, phone, password string) (*domain.User, error) {
	// Verify credentials with Supabase
	session, err := r.client.Auth.SignInWithPhonePassword(phone, password)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}
	if session == nil || session.User.ID == uuid.Nil {
		return nil, domain.ErrInvalidCredentials
	}

	// Find local user by Supabase UID
	var user domain.User
	supaUserIDStr := session.User.ID.String()
	if err := r.db.WithContext(ctx).Where("supabase_uid = ?", supaUserIDStr).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrInvalidCredentials
		}
		return nil, fmt.Errorf("error retrieving local user: %w", err)
	}

	return &user, nil
}

func (r *supabaseRepository) LoginWithEmployeeCredentials(ctx context.Context, employeeCode, password string) (*domain.User, error) {
	// Find local employee and associated user
	var employee domain.Employee
	if err := r.db.WithContext(ctx).Where("employee_code = ?", employeeCode).Preload("User").First(&employee).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrInvalidCredentials // Employee code not found
		}
		return nil, fmt.Errorf("error finding employee by code: %w", err)
	}
	if employee.User.ID == 0 {
		return nil, fmt.Errorf("employee found but no associated user record")
	}
	if employee.User.SupabaseUID == nil || *employee.User.SupabaseUID == "" {
		return nil, fmt.Errorf("employee user is not linked to a supabase account")
	}
	if employee.User.Email == "" {
		return nil, fmt.Errorf("cannot verify password, associated user email is missing")
	}

	// Verify the provided password against the linked Supabase user via SignIn
	_, err := r.client.Auth.SignInWithEmailPassword(employee.User.Email, password)
	if err != nil {
		// Password verification failed in Supabase
		return nil, domain.ErrInvalidCredentials
	}

	// Password is correct. Return the local user.
	return &employee.User, nil
}


// --- Password Management ---

func (r *supabaseRepository) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	// 1. Get the local user to find the linked Supabase account UID.
	localUser, err := r.GetUserByID(ctx, userID)
	if err != nil {
		return err // Includes domain.ErrUserNotFound
	}
	if localUser.SupabaseUID == nil || *localUser.SupabaseUID == "" {
		return fmt.Errorf("user is not linked to a supabase account")
	}

	// TODO: Old password verification MUST happen before calling this repository method (similar to Firebase approach).


	updateReq := types.AdminUpdateUserRequest{
		Password: newPassword,
	}
	_, err = r.client.Auth.AdminUpdateUser(updateReq)
	if err != nil {
		return fmt.Errorf("error updating supabase user password: %w", err)
	}

	return nil
}


func (r *supabaseRepository) ResetPassword(ctx context.Context, email string) error {
	// Optional: Check if email exists locally first.
	_, err := r.GetUserByEmail(ctx, email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		// Log unexpected DB error, but don't reveal existence
		fmt.Printf("Error checking local user for password reset %s: %v\n", email, err)
		// Return nil to prevent email enumeration
		return nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		// User doesn't exist locally, still return nil for security
		return nil
	}

	// Trigger Supabase password reset email
	req := types.RecoverRequest{Email: email}
	err = r.client.Auth.Recover(req)
	if err != nil {
		// Log the error internally, but return nil to the caller for security.
		fmt.Printf("Supabase Recover error for %s: %v\n", email, err)
		// Consider specific Supabase error checks if needed, but be cautious.
	}

	// Return nil regardless of Supabase outcome to prevent enumeration attacks.
	return nil
}


// --- Common Operations ---

func (r *supabaseRepository) GetUserByID(ctx context.Context, id uint) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *supabaseRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *supabaseRepository) GetUserByPhone(ctx context.Context, phone string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *supabaseRepository) GetUserByEmployeeCode(ctx context.Context, code string) (*domain.User, error) {
	var employee domain.Employee
	if err := r.db.WithContext(ctx).Where("employee_code = ?", code).Preload("User").First(&employee).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrUserNotFound // Employee not found maps to User not found
		}
		return nil, fmt.Errorf("error finding employee by code: %w", err)
	}
	if employee.User.ID == 0 {
		return nil, domain.ErrUserNotFound // Treat as user not found if link is broken
	}
	return &employee.User, nil
}

// --- Refresh Token Management ---

// StoreRefreshToken saves a new refresh token record to the database.
func (r *supabaseRepository) StoreRefreshToken(ctx context.Context, token *domain.RefreshToken) error {
	if err := r.db.WithContext(ctx).Create(token).Error; err != nil {
		// Handle potential unique constraint violation on TokenHash
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key") {
			return fmt.Errorf("failed to store refresh token due to conflict: %w", err)
		}
		return fmt.Errorf("failed to store refresh token: %w", err)
	}
	return nil
}

// FindRefreshTokenByHash retrieves a refresh token by its hashed value.
// It returns ErrRecordNotFound if the token is not found.
func (r *supabaseRepository) FindRefreshTokenByHash(ctx context.Context, hash string) (*domain.RefreshToken, error) {
	var token domain.RefreshToken
	if err := r.db.WithContext(ctx).Where("token_hash = ?", hash).First(&token).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Use a specific domain error maybe? For now, return gorm's error.
			return nil, gorm.ErrRecordNotFound
		}
		return nil, fmt.Errorf("error finding refresh token by hash: %w", err)
	}
	return &token, nil
}

// RevokeRefreshTokenByID marks a specific refresh token as revoked by its ID.
func (r *supabaseRepository) RevokeRefreshTokenByID(ctx context.Context, tokenID uint) error {
	result := r.db.WithContext(ctx).Model(&domain.RefreshToken{}).
		Where("id = ?", tokenID).
		Update("revoked", true)

	if result.Error != nil {
		return fmt.Errorf("failed to revoke refresh token ID %d: %w", tokenID, result.Error)
	}
	if result.RowsAffected == 0 {
		// Optional: Return an error if the token wasn't found or was already revoked
		// return fmt.Errorf("refresh token ID %d not found or already revoked", tokenID)
		log.Printf("Warning: Attempted to revoke non-existent or already revoked refresh token ID %d", tokenID)
	}
	return nil
}

// RevokeAllUserRefreshTokens marks all active refresh tokens for a given user as revoked.
func (r *supabaseRepository) RevokeAllUserRefreshTokens(ctx context.Context, userID uint) error {
	result := r.db.WithContext(ctx).Model(&domain.RefreshToken{}).
		Where("user_id = ? AND revoked = ?", userID, false).
		Update("revoked", true)

	if result.Error != nil {
		return fmt.Errorf("failed to revoke refresh tokens for user %d: %w", userID, result.Error)
	}
	// GORM V2 returns RowsAffected
	// log.Printf("Revoked %d refresh tokens for user %d", result.RowsAffected, userID)
	return nil
}

func (r *supabaseRepository) UpdateLastLogin(ctx context.Context, userID uint, loginTime time.Time) error {
	result := r.db.WithContext(ctx).Model(&domain.User{}).
		Where("id = ?", userID).
		Update("last_login_at", loginTime)

	if result.Error != nil {
		return fmt.Errorf("failed to update last login time for user %d: %w", userID, result.Error)
	}
	if result.RowsAffected == 0 {
		// This might happen if the user ID doesn't exist, which shouldn't occur
		// if called right after a successful login/registration, but log it.
		log.Printf("Warning: UpdateLastLogin found no user with ID %d to update", userID)
	}
	return nil
}

// TODO: Review authentication flows (e.g., Google Sign-In, Password Change) to ensure they align with Supabase client/server interactions and token management.
// TODO: Implement Supabase user deletion logic in error rollbacks where necessary, likely requiring the Admin API (Service Role Key).
// Note: Some TODOs regarding user deletion on rollback were addressed in RegisterAdminWithForm.
