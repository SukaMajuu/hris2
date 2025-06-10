package mocks

import (
	"context"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

type AuthRepository struct {
	mock.Mock
}

func (m *AuthRepository) RegisterAdminWithForm(ctx context.Context, user *domain.User, employee *domain.Employee) error {
	args := m.Called(ctx, user, employee)
	return args.Error(0)
}

func (m *AuthRepository) RegisterAdminWithGoogle(ctx context.Context, token string) (*domain.User, *domain.Employee, error) {
	args := m.Called(ctx, token)
	if args.Get(0) == nil {
		return nil, nil, args.Error(2)
	}
	return args.Get(0).(*domain.User), args.Get(1).(*domain.Employee), args.Error(2)
}

func (m *AuthRepository) LoginWithEmail(ctx context.Context, email, password string) (*domain.User, error) {
	args := m.Called(ctx, email, password)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) LoginWithGoogle(ctx context.Context, token string) (*domain.User, error) {
	args := m.Called(ctx, token)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) LoginWithPhone(ctx context.Context, phone, password string) (*domain.User, error) {
	args := m.Called(ctx, phone, password)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) LoginWithEmployeeCredentials(ctx context.Context, employeeID, password string) (*domain.User, error) {
	args := m.Called(ctx, employeeID, password)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	args := m.Called(ctx, userID, oldPassword, newPassword)
	return args.Error(0)
}

func (m *AuthRepository) ResetPassword(ctx context.Context, email string) error {
	args := m.Called(ctx, email)
	return args.Error(0)
}

func (m *AuthRepository) GetUserByID(ctx context.Context, id uint) (*domain.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) GetUserByPhone(ctx context.Context, phone string) (*domain.User, error) {
	args := m.Called(ctx, phone)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) GetUserByEmployeeCode(ctx context.Context, code string) (*domain.User, error) {
	args := m.Called(ctx, code)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.User), args.Error(1)
}

func (m *AuthRepository) FindRefreshTokenByHash(ctx context.Context, hash string) (*domain.RefreshToken, error) {
	args := m.Called(ctx, hash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.RefreshToken), args.Error(1)
}

func (m *AuthRepository) StoreRefreshToken(ctx context.Context, token *domain.RefreshToken) error {
	args := m.Called(ctx, token)
	return args.Error(0)
}

func (m *AuthRepository) RevokeRefreshTokenByID(ctx context.Context, tokenID uint) error {
	args := m.Called(ctx, tokenID)
	return args.Error(0)
}

func (m *AuthRepository) RevokeAllUserRefreshTokens(ctx context.Context, userID uint) error {
	args := m.Called(ctx, userID)
	return args.Error(0)
}

func (m *AuthRepository) UpdateLastLogin(ctx context.Context, userID uint, loginTime time.Time) error {
	args := m.Called(ctx, userID, loginTime)
	return args.Error(0)
}

func (m *AuthRepository) RegisterEmployeeUser(ctx context.Context, user *domain.User, employee *domain.Employee) error {
	args := m.Called(ctx, user, employee)
	return args.Error(0)
}

func (m *AuthRepository) UpdateUser(ctx context.Context, user *domain.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *AuthRepository) UpdateUserPassword(ctx context.Context, userID uint, accessToken, oldPassword, newPassword string) error {
	args := m.Called(ctx, userID, accessToken, oldPassword, newPassword)
	return args.Error(0)
}
