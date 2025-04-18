package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestRegisterWithForm(t *testing.T) {
	now := time.Now()
	tests := []struct {
		name          string
		user          *domain.User
		employee      *domain.Employee
		repoError     error
		deptError     error
		positionError error
		rollbackError error
		expectedErr   error
	}{
		{
			name: "successful registration",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			employee: &domain.Employee{
				EmployeeCode: "EMP001",
				FirstName:    "John",
				LastName:     "Doe",
				DepartmentID: 1,
				PositionID:   1,
			},
			repoError:     nil,
			deptError:     nil,
			positionError: nil,
			rollbackError: nil,
			expectedErr:   nil,
		},
		{
			name: "department not found",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			employee: &domain.Employee{
				EmployeeCode: "EMP001",
				FirstName:    "John",
				LastName:     "Doe",
				DepartmentID: 999,
				PositionID:   1,
			},
			repoError:     nil,
			deptError:     assert.AnError,
			positionError: nil,
			rollbackError: nil,
			expectedErr:   errors.New("department not found"),
		},
		{
			name: "position not found",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			employee: &domain.Employee{
				EmployeeCode: "EMP001",
				FirstName:    "John",
				LastName:     "Doe",
				DepartmentID: 1,
				PositionID:   999,
			},
			repoError:     nil,
			deptError:     nil,
			positionError: assert.AnError,
			rollbackError: nil,
			expectedErr:   errors.New("position not found"),
		},
		{
			name: "position department mismatch",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			employee: &domain.Employee{
				EmployeeCode: "EMP001",
				FirstName:    "John",
				LastName:     "Doe",
				DepartmentID: 1,
				PositionID:   2,
			},
			repoError:     nil,
			deptError:     nil,
			positionError: nil,
			rollbackError: nil,
			expectedErr:   errors.New("position does not belong to the specified department"),
		},
		{
			name: "employee creation failed with successful rollback",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			employee: &domain.Employee{
				EmployeeCode: "EMP001",
				FirstName:    "John",
				LastName:     "Doe",
				DepartmentID: 1,
				PositionID:   1,
			},
			repoError:     nil,
			deptError:     nil,
			positionError: nil,
			rollbackError: nil,
			expectedErr:   errors.New("employee creation failed: employee creation error"),
		},
		{
			name: "employee creation failed with rollback error",
			user: &domain.User{
				Email:    "test@example.com",
				Password: "password123",
				Phone:    "1234567890",
			},
			employee: &domain.Employee{
				EmployeeCode: "EMP001",
				FirstName:    "John",
				LastName:     "Doe",
				DepartmentID: 1,
				PositionID:   1,
			},
			repoError:     nil,
			deptError:     nil,
			positionError: nil,
			rollbackError: assert.AnError,
			expectedErr:   errors.New("employee creation failed: employee creation error, user rollback failed: assert.AnError general error for testing"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockAuthRepo := new(mocks.AuthRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockDeptRepo := new(mocks.DepartmentRepository)
			mockPositionRepo := new(mocks.PositionRepository)

			uc := NewAuthUseCase(
				mockAuthRepo,
				mockEmployeeRepo,
				mockDeptRepo,
				mockPositionRepo,
			)

			if tt.deptError == nil {
				mockDeptRepo.On("GetByID", mock.Anything, tt.employee.DepartmentID).
					Return(&domain.Department{ID: tt.employee.DepartmentID}, nil)
			} else {
				mockDeptRepo.On("GetByID", mock.Anything, tt.employee.DepartmentID).
					Return(nil, tt.deptError)
			}

			if tt.deptError == nil {
				if tt.positionError == nil {
					if tt.name == "position department mismatch" {
						mockPositionRepo.On("GetByID", mock.Anything, tt.employee.PositionID).
							Return(&domain.Position{
								ID:           tt.employee.PositionID,
								DepartmentID: 999,
							}, nil)
					} else {
						mockPositionRepo.On("GetByID", mock.Anything, tt.employee.PositionID).
							Return(&domain.Position{
								ID:           tt.employee.PositionID,
								DepartmentID: tt.employee.DepartmentID,
							}, nil)
					}
				} else {
					mockPositionRepo.On("GetByID", mock.Anything, tt.employee.PositionID).
						Return(nil, tt.positionError)
				}
			}

			if tt.deptError == nil && tt.positionError == nil && tt.name != "position department mismatch" {
				if tt.repoError == nil {
					mockAuthRepo.On("RegisterWithForm", mock.Anything, mock.MatchedBy(func(user *domain.User) bool {
						return user.Role == enums.UserRole("employee") &&
							user.CreatedAt.After(now.Add(-time.Second)) &&
							user.LastLoginAt != nil &&
							user.LastLoginAt.After(now.Add(-time.Second))
					})).Return(nil)

					tt.user.ID = 1

					if tt.name == "employee creation failed with successful rollback" || tt.name == "employee creation failed with rollback error" {
						mockEmployeeRepo.On("Create", mock.Anything, mock.Anything).Return(errors.New("employee creation error"))
						mockAuthRepo.On("DeleteUser", mock.Anything, tt.user.ID).Return(tt.rollbackError)
					} else {
						mockEmployeeRepo.On("Create", mock.Anything, mock.MatchedBy(func(emp *domain.Employee) bool {
							return emp.EmploymentStatus == true &&
								emp.CreatedAt.After(now.Add(-time.Second)) &&
								emp.UpdatedAt.After(now.Add(-time.Second))
						})).Return(nil)
					}
				} else {
					mockAuthRepo.On("RegisterWithForm", mock.Anything, mock.Anything).Return(tt.repoError)
				}
			}

			err := uc.RegisterWithForm(context.Background(), tt.user, tt.employee)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr.Error(), err.Error())
			} else {
				assert.NoError(t, err)
				assert.Equal(t, enums.UserRole("employee"), tt.user.Role)
				assert.NotNil(t, tt.user.CreatedAt)
				assert.NotNil(t, tt.user.LastLoginAt)
				assert.True(t, tt.user.CreatedAt.After(now.Add(-time.Second)))
				assert.True(t, tt.user.LastLoginAt.After(now.Add(-time.Second)))
				assert.True(t, tt.employee.EmploymentStatus)
				assert.NotNil(t, tt.employee.CreatedAt)
				assert.NotNil(t, tt.employee.UpdatedAt)
			}

			mockAuthRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
			mockDeptRepo.AssertExpectations(t)
			mockPositionRepo.AssertExpectations(t)
		})
	}
}
