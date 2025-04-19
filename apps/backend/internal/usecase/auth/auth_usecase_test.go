package auth

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestRegisterAdminWithForm(t *testing.T) {
	var repoCreateFailedErr = errors.New("repo create failed")

	tests := []struct {
		name          string
		user          *domain.User
		employee      *domain.Employee
		repoError     error
		rollbackError error
		expectedErr   error
	}{
		{
			name: "successful registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
			},
			employee: &domain.Employee{
				FirstName:    "John",
				LastName:     "Doe",
			},
			repoError:     nil,
			rollbackError: nil,
			expectedErr:   nil,
		},
		{
			name: "repository error during registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
			},
			employee: &domain.Employee{
				FirstName:    "John",
				LastName:     "Doe",
			},
			repoError:     repoCreateFailedErr,
			rollbackError: nil,
			expectedErr:   fmt.Errorf("failed to register admin: %w", repoCreateFailedErr),
		},
		{
			name: "missing required fields - email",
			user: &domain.User{
				Email:    "",
				Password: "password123",
			},
			employee: &domain.Employee{
				FirstName: "John",
				LastName:  "Doe",
			},
			repoError:     nil,
			rollbackError: nil,
			expectedErr:   errors.New("missing required fields for admin registration"),
		},
		{
			name: "missing required fields - first name",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
			},
			employee: &domain.Employee{
				FirstName: "",
				LastName:  "Doe",
			},
			repoError:     nil,
			rollbackError: nil,
			expectedErr:   errors.New("missing required fields for admin registration"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockAuthRepo := new(mocks.AuthRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockJWTService := new(mocks.JWTService)

			uc := NewAuthUseCase(
				mockAuthRepo,
				mockEmployeeRepo,
				mockJWTService,
			)

			if tt.name == "email already exists" {
				mockAuthRepo.On("GetUserByEmail", mock.Anything, tt.user.Email).
					Return(&domain.User{}, nil)
			} else {
				mockAuthRepo.On("GetUserByEmail", mock.Anything, tt.user.Email).
					Return(nil, gorm.ErrRecordNotFound).Maybe()
			}

			if tt.expectedErr == nil || (tt.repoError != nil && errors.Is(tt.expectedErr, tt.repoError)) {
				mockAuthRepo.On("RegisterAdminWithForm", mock.Anything,
						mock.MatchedBy(func(user *domain.User) bool {
							return user.Role == enums.RoleAdmin
						}),
						mock.MatchedBy(func(emp *domain.Employee) bool {
							return emp.FirstName == tt.employee.FirstName &&
							       emp.LastName == tt.employee.LastName &&
							       emp.PositionID == 1
						}),
					).Return(tt.repoError)
			}

			err := uc.RegisterAdminWithForm(context.Background(), tt.user, tt.employee)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr.Error())
			} else {
				assert.NoError(t, err)
				assert.Equal(t, enums.RoleAdmin, tt.user.Role)
				assert.NotNil(t, tt.user.CreatedAt)
				assert.NotNil(t, tt.employee.CreatedAt)
			}

			mockAuthRepo.AssertExpectations(t)
		})
	}
}
