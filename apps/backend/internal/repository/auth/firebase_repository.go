package auth

import (
	"context"
	"fmt"
	"time"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/SukaMajuu/hris/apps/backend/domain"
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

func (r *firebaseRepository) RegisterWithForm(ctx context.Context, user *domain.User) error {
	params := (&auth.UserToCreate{}).
		Email(user.Email).
		Password(user.Password).
		PhoneNumber(user.Phone)

	firebaseUser, err := r.client.CreateUser(ctx, params)
	if err != nil {
		return fmt.Errorf("error creating user in Firebase: %w", err)
	}

	user.FirebaseUID = firebaseUser.UID

	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		_ = r.client.DeleteUser(ctx, firebaseUser.UID)
		return fmt.Errorf("error storing user in database: %w", err)
	}

	return nil
}

func (r *firebaseRepository) RegisterWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	auth, err := r.client.VerifyIDToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("error verifying Google token: %v", err)
	}

	existingUser, err := r.client.GetUser(ctx, auth.UID)
	if err == nil {
		var user domain.User
		if err := r.db.WithContext(ctx).Where("firebase_uid = ?", existingUser.UID).First(&user).Error; err != nil {
			return nil, fmt.Errorf("error getting existing user: %v", err)
		}
		return &user, nil
	}

	user := &domain.User{
		FirebaseUID: auth.UID,
		Email:       auth.Claims["email"].(string),
	}
	googleID := auth.Claims["sub"].(string)
	user.GoogleID = &googleID

	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return nil, fmt.Errorf("error storing user in database: %v", err)
	}

	return user, nil
}

func (r *firebaseRepository) LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error) {
	firebaseUser, err := r.client.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("error getting firebase user: %v", err)
	}

	var user domain.User
	if err := r.db.WithContext(ctx).Where("firebase_uid = ?", firebaseUser.UID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("error getting user from database: %v", err)
	}

	now := time.Now()
	user.LastLoginAt = &now
	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, fmt.Errorf("error updating last login: %v", err)
	}

	return &user, nil
}

func (r *firebaseRepository) LoginWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	auth, err := r.client.VerifyIDToken(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("error verifying Google token: %v", err)
	}

	var user domain.User
	if err := r.db.WithContext(ctx).Where("firebase_uid = ?", auth.UID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not registered: %v", err)
	}

	now := time.Now()
	user.LastLoginAt = &now
	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, fmt.Errorf("error updating last login: %v", err)
	}

	return &user, nil
}

func (r *firebaseRepository) LoginWithPhone(ctx context.Context, phone, otp string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %v", err)
	}

	now := time.Now()
	user.LastLoginAt = &now
	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, fmt.Errorf("error updating last login: %v", err)
	}

	return &user, nil
}

func (r *firebaseRepository) LoginWithEmployeeID(ctx context.Context, employeeID, password string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("employee_id = ?", employeeID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("employee not found: %v", err)
	}

	// Verify the user exists in Firebase
	if _, err := r.client.GetUserByEmail(ctx, user.Email); err != nil {
		return nil, fmt.Errorf("error verifying firebase user: %v", err)
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	if err := r.db.WithContext(ctx).Save(&user).Error; err != nil {
		return nil, fmt.Errorf("error updating last login: %v", err)
	}

	return &user, nil
}

func (r *firebaseRepository) RegisterWithEmployeeID(ctx context.Context, employeeID string, user *domain.User) error {
	token, err := r.client.CustomToken(ctx, employeeID)
	if err != nil {
		return fmt.Errorf("error creating custom token: %v", err)
	}

	user.EmployeeID = &employeeID
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		return fmt.Errorf("error storing user in database: %v", err)
	}

	_ = token
	return nil
}

func (r *firebaseRepository) RequestOTP(ctx context.Context, phone string) error {
	if !isValidPhoneNumber(phone) {
		return fmt.Errorf("invalid phone number format")
	}

	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.User{}).Where("phone = ?", phone).Count(&count).Error; err != nil {
		return fmt.Errorf("error checking phone number: %v", err)
	}

	if count == 0 {
		return fmt.Errorf("phone number not registered")
	}

	return nil
}

func (r *firebaseRepository) VerifyOTP(ctx context.Context, phone, otp string) error {
	var count int64
	if err := r.db.WithContext(ctx).Model(&domain.User{}).Where("phone = ?", phone).Count(&count).Error; err != nil {
		return fmt.Errorf("error checking phone number: %v", err)
	}

	if count == 0 {
		return fmt.Errorf("phone number not registered")
	}

	return nil
}

func (r *firebaseRepository) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	user, err := r.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	update := (&auth.UserToUpdate{}).Password(newPassword)
	if _, err := r.client.UpdateUser(ctx, user.Email, update); err != nil {
		return fmt.Errorf("error updating firebase user password: %v", err)
	}

	return nil
}

func (r *firebaseRepository) ResetPassword(ctx context.Context, email string) error {
	link, err := r.client.PasswordResetLink(ctx, email)
	if err != nil {
		return fmt.Errorf("error generating password reset link: %v", err)
	}

	_ = link
	return nil
}

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

func (r *firebaseRepository) UpdateUser(ctx context.Context, user *domain.User) error {
	update := &auth.UserToUpdate{}
	if user.Email != "" {
		update.Email(user.Email)
	}
	if user.Phone != "" {
		update.PhoneNumber(user.Phone)
	}

	if _, err := r.client.UpdateUser(ctx, user.Email, update); err != nil {
		return fmt.Errorf("error updating firebase user: %v", err)
	}

	return r.db.WithContext(ctx).Save(user).Error
}

func (r *firebaseRepository) DeleteUser(ctx context.Context, id uint) error {
	user, err := r.GetUserByID(ctx, id)
	if err != nil {
		return err
	}

	firebaseUser, err := r.client.GetUserByEmail(ctx, user.Email)
	if err != nil {
		return fmt.Errorf("error getting firebase user: %v", err)
	}

	if err := r.client.DeleteUser(ctx, firebaseUser.UID); err != nil {
		return fmt.Errorf("error deleting firebase user: %v", err)
	}

	return r.db.WithContext(ctx).Delete(&domain.User{}, id).Error
}

func isValidPhoneNumber(phone string) bool {
	return len(phone) > 0
}
