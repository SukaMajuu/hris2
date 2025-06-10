package employee

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoemployee "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	supa "github.com/supabase-community/supabase-go"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func uintPtr(u uint) *uint {
	return &u
}

func TestEmployeeUseCase_List(t *testing.T) {
	ctx := context.Background()
	filters := map[string]interface{}{"status": "active"}
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}

	mockDomainEmp := &domain.Employee{
		ID:        1,
		FirstName: "John",
		User:      domain.User{Phone: "12345"},
	}
	mockDomainEmployees := []*domain.Employee{mockDomainEmp}
	var mockTotalItems int64 = 1

	var expectedGenderDTO *string
	if mockDomainEmp.Gender != nil {
		genderStr := string(*mockDomainEmp.Gender)
		expectedGenderDTO = &genderStr
	}

	zeroTime := time.Time{}
	formattedZeroTime := zeroTime.Format(time.RFC3339)

	expectedEmployeeDTO := &dtoemployee.EmployeeResponseDTO{
		ID:               mockDomainEmp.ID,
		FirstName:        mockDomainEmp.FirstName,
		LastName:         mockDomainEmp.LastName,
		Gender:           expectedGenderDTO,
		Phone:            &mockDomainEmp.User.Phone,
		PositionName:     mockDomainEmp.PositionName,
		Grade:            mockDomainEmp.Grade,
		EmploymentStatus: mockDomainEmp.EmploymentStatus,
		CreatedAt:        formattedZeroTime,
		UpdatedAt:        formattedZeroTime,
	}

	if mockDomainEmp.Branch != nil {
		expectedEmployeeDTO.Branch = mockDomainEmp.Branch
	}

	expectedSuccessResponseData := &dtoemployee.EmployeeListResponseData{
		Items: []*dtoemployee.EmployeeResponseDTO{expectedEmployeeDTO},
		Pagination: domain.Pagination{
			TotalItems:  mockTotalItems,
			TotalPages:  1,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: false,
			HasPrevPage: false,
		},
	}

	repoError := errors.New("repository database error")

	tests := []struct {
		name               string
		mockRepoEmployees  []*domain.Employee
		mockRepoTotalItems int64
		mockRepoError      error
		expectedResponse   *dtoemployee.EmployeeListResponseData
		expectedErrorMsg   string
		checkErrorIs       error
		checkErrorContains string
	}{
		{
			name:               "successful retrieval",
			mockRepoEmployees:  mockDomainEmployees,
			mockRepoTotalItems: mockTotalItems,
			mockRepoError:      nil,
			expectedResponse:   expectedSuccessResponseData,
			expectedErrorMsg:   "",
		},
		{
			name:               "repository returns an error",
			mockRepoEmployees:  nil,
			mockRepoTotalItems: 0,
			mockRepoError:      repoError,
			expectedResponse:   nil,
			expectedErrorMsg:   fmt.Errorf("failed to list employees from repository: %w", repoError).Error(),
			checkErrorIs:       repoError,
		},
		{
			name:               "repository returns no employees",
			mockRepoEmployees:  []*domain.Employee{},
			mockRepoTotalItems: 0,
			mockRepoError:      nil,
			expectedResponse: &dtoemployee.EmployeeListResponseData{
				Items: []*dtoemployee.EmployeeResponseDTO{},
				Pagination: domain.Pagination{
					TotalItems:  0,
					TotalPages:  0,
					CurrentPage: paginationParams.Page,
					PageSize:    paginationParams.PageSize,
					HasNextPage: false,
					HasPrevPage: false,
				},
			},
			expectedErrorMsg: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("List", ctx, filters, paginationParams).
				Return(tt.mockRepoEmployees, tt.mockRepoTotalItems, tt.mockRepoError).Once()

			actualResponse, actualErr := uc.List(ctx, filters, paginationParams)

			assert.Equal(t, tt.expectedResponse, actualResponse)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, actualErr)
				assert.EqualError(t, actualErr, tt.expectedErrorMsg)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(actualErr, tt.checkErrorIs), "Expected error to wrap: %v, but got: %v", tt.checkErrorIs, actualErr)
				}
				if tt.checkErrorContains != "" {
					assert.Contains(t, actualErr.Error(), tt.checkErrorContains)
				}
			} else {
				assert.NoError(t, actualErr)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_Create(t *testing.T) {
	ctx := context.Background()
	creatorEmployeeID := uint(1)

	tests := []struct {
		name                   string
		inputEmployee          *domain.Employee
		mockRegisterError      error
		expectedEmployee       *domain.Employee
		expectedErrorMsg       string
		checkErrorIs           error
		validateEmployeeFields bool
	}{
		{
			name: "successful creation with email",
			inputEmployee: &domain.Employee{
				FirstName:    "John",
				PositionName: "Developer",
				User: domain.User{
					Email: "john@example.com",
				},
			},
			mockRegisterError: nil,
			expectedEmployee: &domain.Employee{
				ID:           1,
				FirstName:    "John",
				PositionName: "Developer",
				ManagerID:    &creatorEmployeeID,
				User: domain.User{
					ID:       1,
					Email:    "john@example.com",
					Password: defaultPassword,
				},
			},
			expectedErrorMsg:       "",
			validateEmployeeFields: true,
		},
		{
			name: "successful creation without email",
			inputEmployee: &domain.Employee{
				FirstName:    "Jane",
				PositionName: "Designer",
				User:         domain.User{},
			},
			mockRegisterError: nil,
			expectedEmployee: &domain.Employee{
				ID:           2,
				FirstName:    "Jane",
				PositionName: "Designer",
				ManagerID:    &creatorEmployeeID,
				User: domain.User{
					ID:       2,
					Password: defaultPassword,
				},
			},
			expectedErrorMsg:       "",
			validateEmployeeFields: true,
		},
		{
			name: "successful creation with custom password",
			inputEmployee: &domain.Employee{
				FirstName:    "Bob",
				PositionName: "Manager",
				User: domain.User{
					Email:    "bob@example.com",
					Password: "custompassword",
				},
			},
			mockRegisterError: nil,
			expectedEmployee: &domain.Employee{
				ID:           3,
				FirstName:    "Bob",
				PositionName: "Manager",
				ManagerID:    &creatorEmployeeID,
				User: domain.User{
					ID:       3,
					Email:    "bob@example.com",
					Password: "custompassword",
				},
			},
			expectedErrorMsg:       "",
			validateEmployeeFields: true,
		},
		{
			name: "repository returns error",
			inputEmployee: &domain.Employee{
				FirstName:    "Error",
				PositionName: "Test",
				User: domain.User{
					Email: "error@example.com",
				},
			},
			mockRegisterError:      errors.New("database error"),
			expectedEmployee:       nil,
			expectedErrorMsg:       "failed to create employee and user: database error",
			checkErrorIs:           errors.New("database error"),
			validateEmployeeFields: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			// Mock checkEmployeeLimit flow
			if tt.mockRegisterError == nil {
				// Mock creator employee
				creatorEmployee := &domain.Employee{
					ID: creatorEmployeeID,
					User: domain.User{
						ID:   creatorEmployeeID,
						Role: "admin",
					},
				}
				mockEmployeeRepo.On("GetByID", ctx, creatorEmployeeID).Return(creatorEmployee, nil).Once()

				// Mock admin user
				adminUser := &domain.User{
					ID:   creatorEmployeeID,
					Role: "admin",
				}
				mockAuthRepo.On("GetUserByID", ctx, creatorEmployeeID).Return(adminUser, nil).Once()

				// Mock admin employee for count
				mockEmployeeRepo.On("GetByUserID", ctx, creatorEmployeeID).Return(creatorEmployee, nil).Once()

				// Mock current employee count
				mockEmployeeRepo.On("List", ctx, mock.Anything, mock.Anything).Return([]*domain.Employee{}, int64(0), nil).Once()

				// Mock subscription not found (use default limits)
				mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, creatorEmployeeID).Return(nil, errors.New("subscription not found")).Once()
			}

			mockAuthRepo.On("RegisterEmployeeUser", ctx, mock.AnythingOfType("*domain.User"), mock.AnythingOfType("*domain.Employee")).
				Run(func(args mock.Arguments) {
					if tt.mockRegisterError == nil {
						user := args.Get(1).(*domain.User)
						employee := args.Get(2).(*domain.Employee)
						if tt.expectedEmployee != nil {
							user.ID = tt.expectedEmployee.User.ID
							employee.ID = tt.expectedEmployee.ID
						}
					}
				}).
				Return(tt.mockRegisterError).Once()

			result, err := uc.Create(ctx, tt.inputEmployee, creatorEmployeeID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.ReplaceAll(tt.expectedErrorMsg, "database error", ""))
				assert.Nil(t, result)
				if tt.checkErrorIs != nil {
					assert.Contains(t, err.Error(), tt.checkErrorIs.Error())
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)

				if tt.validateEmployeeFields {
					assert.Equal(t, tt.expectedEmployee.FirstName, result.FirstName)
					assert.Equal(t, tt.expectedEmployee.PositionName, result.PositionName)
					assert.Equal(t, creatorEmployeeID, *result.ManagerID)

					if tt.inputEmployee.User.Password == "" {
						assert.Equal(t, defaultPassword, result.User.Password)
					} else {
						assert.Equal(t, tt.inputEmployee.User.Password, result.User.Password)
					}
				}
			}

			mockAuthRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
			mockXenditRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetByID(t *testing.T) {
	ctx := context.Background()
	employeeID := uint(1)

	mockEmployee := &domain.Employee{
		ID:        1,
		FirstName: "John",
		LastName:  stringPtr("Doe"),
		User: domain.User{
			ID:    1,
			Email: "john@example.com",
			Phone: "+1234567890",
		},
		PositionName: "Developer",
	}

	tests := []struct {
		name             string
		inputID          uint
		mockEmployee     *domain.Employee
		mockError        error
		expectedResponse *dtoemployee.EmployeeResponseDTO
		expectedErrorMsg string
		checkErrorIs     error
	}{
		{
			name:         "successful retrieval",
			inputID:      employeeID,
			mockEmployee: mockEmployee,
			mockError:    nil,
			expectedResponse: &dtoemployee.EmployeeResponseDTO{
				ID:           1,
				FirstName:    "John",
				LastName:     stringPtr("Doe"),
				PositionName: "Developer",
				Email:        stringPtr("john@example.com"),
				Phone:        &mockEmployee.User.Phone,
			},
			expectedErrorMsg: "",
		},
		{
			name:             "employee not found",
			inputID:          999,
			mockEmployee:     nil,
			mockError:        gorm.ErrRecordNotFound,
			expectedResponse: nil,
			expectedErrorMsg: domain.ErrEmployeeNotFound.Error(),
			checkErrorIs:     domain.ErrEmployeeNotFound,
		},
		{
			name:             "repository error",
			inputID:          employeeID,
			mockEmployee:     nil,
			mockError:        errors.New("database error"),
			expectedResponse: nil,
			expectedErrorMsg: fmt.Sprintf("failed to get employee by ID %d: database error", employeeID),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetByID", ctx, tt.inputID).
				Return(tt.mockEmployee, tt.mockError).Once()

			result, err := uc.GetByID(ctx, tt.inputID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs))
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedResponse.ID, result.ID)
				assert.Equal(t, tt.expectedResponse.FirstName, result.FirstName)
				assert.Equal(t, tt.expectedResponse.PositionName, result.PositionName)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetEmployeeByUserID(t *testing.T) {
	ctx := context.Background()
	userID := uint(1)

	mockEmployee := &domain.Employee{
		ID:     1,
		UserID: userID,
		User: domain.User{
			ID:    userID,
			Email: "john@example.com",
		},
		FirstName: "John",
	}

	tests := []struct {
		name             string
		inputUserID      uint
		mockEmployee     *domain.Employee
		mockError        error
		expectedEmployee *domain.Employee
		expectedErrorMsg string
		checkErrorIs     error
	}{
		{
			name:             "successful retrieval",
			inputUserID:      userID,
			mockEmployee:     mockEmployee,
			mockError:        nil,
			expectedEmployee: mockEmployee,
			expectedErrorMsg: "",
		},
		{
			name:             "employee not found",
			inputUserID:      999,
			mockEmployee:     nil,
			mockError:        gorm.ErrRecordNotFound,
			expectedEmployee: nil,
			expectedErrorMsg: domain.ErrEmployeeNotFound.Error(),
			checkErrorIs:     domain.ErrEmployeeNotFound,
		},
		{
			name:             "repository error",
			inputUserID:      userID,
			mockEmployee:     nil,
			mockError:        errors.New("database error"),
			expectedEmployee: nil,
			expectedErrorMsg: fmt.Sprintf("failed to get employee by UserID %d: database error", userID),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetByUserID", ctx, tt.inputUserID).
				Return(tt.mockEmployee, tt.mockError).Once()

			result, err := uc.GetEmployeeByUserID(ctx, tt.inputUserID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs))
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedEmployee.ID, result.ID)
				assert.Equal(t, tt.expectedEmployee.UserID, result.UserID)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetByNIK(t *testing.T) {
	ctx := context.Background()
	nik := "1234567890123456"

	mockEmployee := &domain.Employee{
		ID:        1,
		FirstName: "John",
		NIK:       &nik,
	}

	tests := []struct {
		name             string
		inputNIK         string
		mockEmployee     *domain.Employee
		mockError        error
		expectedEmployee *domain.Employee
		expectedErrorMsg string
		checkErrorIs     error
	}{
		{
			name:             "successful retrieval",
			inputNIK:         nik,
			mockEmployee:     mockEmployee,
			mockError:        nil,
			expectedEmployee: mockEmployee,
			expectedErrorMsg: "",
		},
		{
			name:             "employee not found",
			inputNIK:         "9999999999999999",
			mockEmployee:     nil,
			mockError:        gorm.ErrRecordNotFound,
			expectedEmployee: nil,
			expectedErrorMsg: domain.ErrEmployeeNotFound.Error(),
			checkErrorIs:     domain.ErrEmployeeNotFound,
		},
		{
			name:             "repository error",
			inputNIK:         nik,
			mockEmployee:     nil,
			mockError:        errors.New("database error"),
			expectedEmployee: nil,
			expectedErrorMsg: fmt.Sprintf("failed to get employee by NIK %s: database error", nik),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetByNIK", ctx, tt.inputNIK).
				Return(tt.mockEmployee, tt.mockError).Once()

			result, err := uc.GetByNIK(ctx, tt.inputNIK)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs))
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedEmployee.ID, result.ID)
				assert.Equal(t, tt.expectedEmployee.NIK, result.NIK)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetByEmployeeCode(t *testing.T) {
	ctx := context.Background()
	employeeCode := "EMP001"

	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		EmployeeCode: &employeeCode,
	}

	tests := []struct {
		name             string
		inputCode        string
		mockEmployee     *domain.Employee
		mockError        error
		expectedEmployee *domain.Employee
		expectedErrorMsg string
		checkErrorIs     error
	}{
		{
			name:             "successful retrieval",
			inputCode:        employeeCode,
			mockEmployee:     mockEmployee,
			mockError:        nil,
			expectedEmployee: mockEmployee,
			expectedErrorMsg: "",
		},
		{
			name:             "employee not found",
			inputCode:        "EMP999",
			mockEmployee:     nil,
			mockError:        gorm.ErrRecordNotFound,
			expectedEmployee: nil,
			expectedErrorMsg: domain.ErrEmployeeNotFound.Error(),
			checkErrorIs:     domain.ErrEmployeeNotFound,
		},
		{
			name:             "repository error",
			inputCode:        employeeCode,
			mockEmployee:     nil,
			mockError:        errors.New("database error"),
			expectedEmployee: nil,
			expectedErrorMsg: fmt.Sprintf("failed to get employee by EmployeeCode %s: database error", employeeCode),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetByEmployeeCode", ctx, tt.inputCode).
				Return(tt.mockEmployee, tt.mockError).Once()

			result, err := uc.GetByEmployeeCode(ctx, tt.inputCode)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs))
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedEmployee.ID, result.ID)
				assert.Equal(t, tt.expectedEmployee.EmployeeCode, result.EmployeeCode)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetUserByEmail(t *testing.T) {
	ctx := context.Background()
	email := "john@example.com"

	mockUser := &domain.User{
		ID:    1,
		Email: email,
	}

	tests := []struct {
		name             string
		inputEmail       string
		mockUser         *domain.User
		mockError        error
		expectedUser     *domain.User
		expectedErrorMsg string
	}{
		{
			name:             "successful retrieval",
			inputEmail:       email,
			mockUser:         mockUser,
			mockError:        nil,
			expectedUser:     mockUser,
			expectedErrorMsg: "",
		},
		{
			name:             "user not found",
			inputEmail:       "notfound@example.com",
			mockUser:         nil,
			mockError:        domain.ErrUserNotFound,
			expectedUser:     nil,
			expectedErrorMsg: domain.ErrUserNotFound.Error(),
		},
		{
			name:             "repository error",
			inputEmail:       email,
			mockUser:         nil,
			mockError:        errors.New("database error"),
			expectedUser:     nil,
			expectedErrorMsg: "database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockAuthRepo.On("GetUserByEmail", ctx, tt.inputEmail).
				Return(tt.mockUser, tt.mockError).Once()

			result, err := uc.GetUserByEmail(ctx, tt.inputEmail)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedUser.ID, result.ID)
				assert.Equal(t, tt.expectedUser.Email, result.Email)
			}

			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetUserByPhone(t *testing.T) {
	ctx := context.Background()
	phone := "+1234567890"

	mockUser := &domain.User{
		ID:    1,
		Phone: phone,
	}

	tests := []struct {
		name             string
		inputPhone       string
		mockUser         *domain.User
		mockError        error
		expectedUser     *domain.User
		expectedErrorMsg string
	}{
		{
			name:             "successful retrieval",
			inputPhone:       phone,
			mockUser:         mockUser,
			mockError:        nil,
			expectedUser:     mockUser,
			expectedErrorMsg: "",
		},
		{
			name:             "user not found",
			inputPhone:       "+9999999999",
			mockUser:         nil,
			mockError:        domain.ErrUserNotFound,
			expectedUser:     nil,
			expectedErrorMsg: domain.ErrUserNotFound.Error(),
		},
		{
			name:             "repository error",
			inputPhone:       phone,
			mockUser:         nil,
			mockError:        errors.New("database error"),
			expectedUser:     nil,
			expectedErrorMsg: "database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockAuthRepo.On("GetUserByPhone", ctx, tt.inputPhone).
				Return(tt.mockUser, tt.mockError).Once()

			result, err := uc.GetUserByPhone(ctx, tt.inputPhone)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedUser.ID, result.ID)
				assert.Equal(t, tt.expectedUser.Phone, result.Phone)
			}

			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_Update(t *testing.T) {
	ctx := context.Background()
	employeeID := uint(1)
	workScheduleID := uint(5)

	existingEmployee := &domain.Employee{
		ID:        employeeID,
		UserID:    1,
		FirstName: "John",
		LastName:  stringPtr("Doe"),
		User: domain.User{
			ID:    1,
			Email: "john@example.com",
			Phone: "+1234567890",
		},
		PositionName:     "Developer",
		WorkScheduleID:   uintPtr(3),
		EmploymentStatus: true,
	}

	updateEmployee := &domain.Employee{
		ID:             employeeID,
		FirstName:      "John Updated",
		LastName:       stringPtr("Doe Updated"),
		PositionName:   "Senior Developer",
		WorkScheduleID: &workScheduleID,
		User: domain.User{
			Email: "john.updated@example.com",
			Phone: "+1234567891",
		},
	}

	updatedEmployee := &domain.Employee{
		ID:        employeeID,
		UserID:    1,
		FirstName: "John Updated",
		LastName:  stringPtr("Doe Updated"),
		User: domain.User{
			ID:    1,
			Email: "john.updated@example.com",
			Phone: "+1234567891",
		},
		PositionName:     "Senior Developer",
		WorkScheduleID:   &workScheduleID,
		EmploymentStatus: true,
	}

	tests := []struct {
		name                 string
		inputEmployee        *domain.Employee
		mockGetByIDEmployee  *domain.Employee
		mockGetByIDError     error
		mockUpdateUserError  error
		mockUpdateError      error
		mockRefreshEmployee  *domain.Employee
		mockRefreshError     error
		expectedEmployee     *domain.Employee
		expectedErrorMsg     string
		checkErrorIs         error
		shouldCallUpdateUser bool
		shouldCallRefresh    bool
	}{
		{
			name:                 "successful update with user details",
			inputEmployee:        updateEmployee,
			mockGetByIDEmployee:  existingEmployee,
			mockGetByIDError:     nil,
			mockUpdateUserError:  nil,
			mockUpdateError:      nil,
			mockRefreshEmployee:  updatedEmployee,
			mockRefreshError:     nil,
			expectedEmployee:     updatedEmployee,
			expectedErrorMsg:     "",
			shouldCallUpdateUser: true,
			shouldCallRefresh:    true,
		},
		{
			name: "successful update without user details",
			inputEmployee: &domain.Employee{
				ID:           employeeID,
				FirstName:    "John Updated",
				PositionName: "Senior Developer",
				User:         domain.User{},
			},
			mockGetByIDEmployee:  existingEmployee,
			mockGetByIDError:     nil,
			mockUpdateError:      nil,
			mockRefreshEmployee:  updatedEmployee,
			mockRefreshError:     nil,
			expectedEmployee:     updatedEmployee,
			expectedErrorMsg:     "",
			shouldCallUpdateUser: false,
			shouldCallRefresh:    true,
		},
		{
			name:                 "employee not found",
			inputEmployee:        updateEmployee,
			mockGetByIDEmployee:  nil,
			mockGetByIDError:     gorm.ErrRecordNotFound,
			expectedEmployee:     nil,
			expectedErrorMsg:     "failed to get employee for update",
			shouldCallUpdateUser: false,
			shouldCallRefresh:    false,
		},
		{
			name:                 "update user error",
			inputEmployee:        updateEmployee,
			mockGetByIDEmployee:  existingEmployee,
			mockGetByIDError:     nil,
			mockUpdateUserError:  errors.New("user update error"),
			expectedEmployee:     nil,
			expectedErrorMsg:     fmt.Sprintf("failed to update user details for employee ID %d: user update error", employeeID),
			shouldCallUpdateUser: true,
			shouldCallRefresh:    false,
		},
		{
			name:                 "repository update error",
			inputEmployee:        updateEmployee,
			mockGetByIDEmployee:  existingEmployee,
			mockGetByIDError:     nil,
			mockUpdateError:      errors.New("database error"),
			expectedEmployee:     nil,
			expectedErrorMsg:     fmt.Sprintf("failed to update employee ID %d: database error", employeeID),
			shouldCallUpdateUser: true,
			shouldCallRefresh:    false,
		},
		{
			name:                 "refresh error but update successful",
			inputEmployee:        updateEmployee,
			mockGetByIDEmployee:  existingEmployee,
			mockGetByIDError:     nil,
			mockUpdateError:      nil,
			mockRefreshEmployee:  nil,
			mockRefreshError:     errors.New("refresh error"),
			expectedEmployee:     existingEmployee,
			expectedErrorMsg:     "",
			shouldCallUpdateUser: true,
			shouldCallRefresh:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetByID", ctx, employeeID).
				Return(tt.mockGetByIDEmployee, tt.mockGetByIDError).Once()

			if tt.shouldCallUpdateUser {
				mockAuthRepo.On("UpdateUser", ctx, mock.AnythingOfType("*domain.User")).
					Return(tt.mockUpdateUserError).Once()
			}

			if tt.mockGetByIDError == nil && (tt.mockUpdateUserError == nil || !tt.shouldCallUpdateUser) {
				mockEmployeeRepo.On("Update", ctx, mock.AnythingOfType("*domain.Employee")).
					Return(tt.mockUpdateError).Once()
			}

			if tt.shouldCallRefresh && tt.mockUpdateError == nil {
				mockEmployeeRepo.On("GetByID", ctx, employeeID).
					Return(tt.mockRefreshEmployee, tt.mockRefreshError).Once()
			}

			result, err := uc.Update(ctx, tt.inputEmployee)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs))
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				if tt.expectedEmployee != nil {
					assert.Equal(t, tt.expectedEmployee.ID, result.ID)
				}
			}

			mockEmployeeRepo.AssertExpectations(t)
			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_calculateTotalPages(t *testing.T) {
	uc := &EmployeeUseCase{}

	tests := []struct {
		name         string
		totalItems   int64
		pageSize     int
		expectedPage int
	}{
		{
			name:         "normal case",
			totalItems:   25,
			pageSize:     10,
			expectedPage: 3,
		},
		{
			name:         "exact division",
			totalItems:   20,
			pageSize:     10,
			expectedPage: 2,
		},
		{
			name:         "zero items",
			totalItems:   0,
			pageSize:     10,
			expectedPage: 0,
		},
		{
			name:         "invalid page size",
			totalItems:   25,
			pageSize:     0,
			expectedPage: 0,
		},
		{
			name:         "negative page size",
			totalItems:   25,
			pageSize:     -5,
			expectedPage: 0,
		},
		{
			name:         "one item",
			totalItems:   1,
			pageSize:     10,
			expectedPage: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := uc.calculateTotalPages(tt.totalItems, tt.pageSize)
			assert.Equal(t, tt.expectedPage, result)
		})
	}
}

func TestEmployeeUseCase_Resign(t *testing.T) {
	ctx := context.Background()
	employeeID := uint(1)

	mockEmployee := &domain.Employee{
		ID:               employeeID,
		FirstName:        "John",
		EmploymentStatus: true,
		ResignationDate:  nil,
	}

	tests := []struct {
		name             string
		inputID          uint
		mockEmployee     *domain.Employee
		mockGetError     error
		mockUpdateError  error
		expectedErrorMsg string
		checkErrorIs     error
	}{
		{
			name:             "successful resignation",
			inputID:          employeeID,
			mockEmployee:     mockEmployee,
			mockGetError:     nil,
			mockUpdateError:  nil,
			expectedErrorMsg: "",
		},
		{
			name:             "employee not found",
			inputID:          999,
			mockEmployee:     nil,
			mockGetError:     gorm.ErrRecordNotFound,
			mockUpdateError:  nil,
			expectedErrorMsg: domain.ErrEmployeeNotFound.Error(),
			checkErrorIs:     domain.ErrEmployeeNotFound,
		},
		{
			name:             "get employee error",
			inputID:          employeeID,
			mockEmployee:     nil,
			mockGetError:     errors.New("database error"),
			mockUpdateError:  nil,
			expectedErrorMsg: fmt.Sprintf("failed to get employee by ID %d: database error", employeeID),
		},
		{
			name:             "update error",
			inputID:          employeeID,
			mockEmployee:     mockEmployee,
			mockGetError:     nil,
			mockUpdateError:  errors.New("update error"),
			expectedErrorMsg: "failed to update employee resignation status: update error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetByID", ctx, tt.inputID).
				Return(tt.mockEmployee, tt.mockGetError).Once()

			if tt.mockGetError == nil {
				mockEmployeeRepo.On("Update", ctx, mock.AnythingOfType("*domain.Employee")).
					Run(func(args mock.Arguments) {
						employee := args.Get(1).(*domain.Employee)

						assert.False(t, employee.EmploymentStatus)
						assert.NotNil(t, employee.ResignationDate)
					}).
					Return(tt.mockUpdateError).Once()
			}

			err := uc.Resign(ctx, tt.inputID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				if tt.checkErrorIs != nil {
					assert.True(t, errors.Is(err, tt.checkErrorIs))
				}
			} else {
				assert.NoError(t, err)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_BulkImport(t *testing.T) {
	ctx := context.Background()
	creatorEmployeeID := uint(1)

	employees := []*domain.Employee{
		{
			FirstName:    "John",
			PositionName: "Developer",
			User: domain.User{
				Email: "john@example.com",
			},
		},
		{
			FirstName:    "Jane",
			PositionName: "Designer",
			User: domain.User{
				Email: "jane@example.com",
			},
		},
	}

	tests := []struct {
		name                  string
		inputEmployees        []*domain.Employee
		mockRegisterErrors    []error
		expectedSuccessfulIDs []uint
		expectedErrorCount    int
	}{
		{
			name:                  "all employees successful",
			inputEmployees:        employees,
			mockRegisterErrors:    []error{nil, nil},
			expectedSuccessfulIDs: []uint{1, 2},
			expectedErrorCount:    0,
		},
		{
			name:                  "one employee fails",
			inputEmployees:        employees,
			mockRegisterErrors:    []error{nil, errors.New("duplicate email")},
			expectedSuccessfulIDs: []uint{1},
			expectedErrorCount:    1,
		},
		{
			name:                  "all employees fail",
			inputEmployees:        employees,
			mockRegisterErrors:    []error{errors.New("error1"), errors.New("error2")},
			expectedSuccessfulIDs: []uint{},
			expectedErrorCount:    2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			for i := range tt.inputEmployees {
				mockRegisterCall := mockAuthRepo.On("RegisterEmployeeUser", ctx, mock.AnythingOfType("*domain.User"), mock.AnythingOfType("*domain.Employee"))

				if i < len(tt.mockRegisterErrors) && tt.mockRegisterErrors[i] == nil {
					var empID uint = 1
					switch i {
					case 0:
						empID = 1
					case 1:
						empID = 2
					case 2:
						empID = 3
					default:
						if i >= 0 {
							empID = uint(i + 1)
						} else {
							empID = 1
						}
					}

					mockRegisterCall.Run(func(args mock.Arguments) {
						emp := args.Get(2).(*domain.Employee)
						emp.ID = empID
					})
				}

				if i < len(tt.mockRegisterErrors) {
					mockRegisterCall.Return(tt.mockRegisterErrors[i]).Once()
				} else {
					mockRegisterCall.Return(nil).Once()
				}
			}

			successfulIDs, importErrors := uc.BulkImport(ctx, tt.inputEmployees, creatorEmployeeID)

			assert.Equal(t, len(tt.expectedSuccessfulIDs), len(successfulIDs))
			assert.Equal(t, tt.expectedErrorCount, len(importErrors))

			for i, expectedID := range tt.expectedSuccessfulIDs {
				assert.Equal(t, expectedID, successfulIDs[i])
			}

			mockAuthRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetStatisticsByManager(t *testing.T) {
	ctx := context.Background()
	managerID := uint(1)

	tests := []struct {
		name             string
		inputManagerID   uint
		mockStatistics   []interface{}
		mockError        error
		expectedResponse *dtoemployee.EmployeeStatisticsResponseDTO
		expectedErrorMsg string
	}{
		{
			name:           "successful statistics retrieval",
			inputManagerID: managerID,
			mockStatistics: []interface{}{
				int64(100), int64(10), int64(90), int64(5),
				int64(60), int64(25), int64(15),
				float64(5.0), float64(10.0), float64(2.0),
			},
			mockError: nil,
			expectedResponse: &dtoemployee.EmployeeStatisticsResponseDTO{
				TotalEmployees:       100,
				NewEmployees:         10,
				ActiveEmployees:      90,
				ResignedEmployees:    5,
				PermanentEmployees:   60,
				ContractEmployees:    25,
				FreelanceEmployees:   15,
				TotalEmployeesTrend:  floatPtr(5.0),
				NewEmployeesTrend:    floatPtr(10.0),
				ActiveEmployeesTrend: floatPtr(2.0),
			},
			expectedErrorMsg: "",
		},
		{
			name:             "repository error",
			inputManagerID:   managerID,
			mockStatistics:   nil,
			mockError:        errors.New("database error"),
			expectedResponse: nil,
			expectedErrorMsg: "failed to get employee statistics by manager: database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			if tt.mockStatistics != nil {
				mockEmployeeRepo.On("GetStatisticsWithTrendsByManager", ctx, tt.inputManagerID).
					Return(
						tt.mockStatistics[0].(int64), tt.mockStatistics[1].(int64),
						tt.mockStatistics[2].(int64), tt.mockStatistics[3].(int64),
						tt.mockStatistics[4].(int64), tt.mockStatistics[5].(int64),
						tt.mockStatistics[6].(int64), tt.mockStatistics[7].(float64),
						tt.mockStatistics[8].(float64), tt.mockStatistics[9].(float64),
						tt.mockError,
					).Once()
			} else {
				mockEmployeeRepo.On("GetStatisticsWithTrendsByManager", ctx, tt.inputManagerID).
					Return(
						int64(0), int64(0), int64(0), int64(0),
						int64(0), int64(0), int64(0), float64(0),
						float64(0), float64(0), tt.mockError,
					).Once()
			}

			result, err := uc.GetStatisticsByManager(ctx, tt.inputManagerID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedResponse.TotalEmployees, result.TotalEmployees)
				assert.Equal(t, tt.expectedResponse.NewEmployees, result.NewEmployees)
				assert.Equal(t, tt.expectedResponse.ActiveEmployees, result.ActiveEmployees)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetStatisticsByManagerAndMonth(t *testing.T) {
	ctx := context.Background()
	managerID := uint(1)
	month := "2023-12"

	tests := []struct {
		name             string
		inputManagerID   uint
		inputMonth       string
		mockStatistics   []interface{}
		mockError        error
		expectedResponse *dtoemployee.EmployeeStatisticsResponseDTO
		expectedErrorMsg string
	}{
		{
			name:           "successful statistics retrieval",
			inputManagerID: managerID,
			inputMonth:     month,
			mockStatistics: []interface{}{
				int64(50), int64(5), int64(45), int64(2),
				int64(30), int64(15), int64(5),
				float64(2.5), float64(5.0), float64(1.0),
			},
			mockError: nil,
			expectedResponse: &dtoemployee.EmployeeStatisticsResponseDTO{
				TotalEmployees:       50,
				NewEmployees:         5,
				ActiveEmployees:      45,
				ResignedEmployees:    2,
				PermanentEmployees:   30,
				ContractEmployees:    15,
				FreelanceEmployees:   5,
				TotalEmployeesTrend:  floatPtr(2.5),
				NewEmployeesTrend:    floatPtr(5.0),
				ActiveEmployeesTrend: floatPtr(1.0),
			},
			expectedErrorMsg: "",
		},
		{
			name:             "repository error",
			inputManagerID:   managerID,
			inputMonth:       month,
			mockStatistics:   nil,
			mockError:        errors.New("database error"),
			expectedResponse: nil,
			expectedErrorMsg: "failed to get employee statistics by manager and month: database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			if tt.mockStatistics != nil {
				mockEmployeeRepo.On("GetStatisticsWithTrendsByManagerAndMonth", ctx, tt.inputManagerID, tt.inputMonth).
					Return(
						tt.mockStatistics[0].(int64), tt.mockStatistics[1].(int64),
						tt.mockStatistics[2].(int64), tt.mockStatistics[3].(int64),
						tt.mockStatistics[4].(int64), tt.mockStatistics[5].(int64),
						tt.mockStatistics[6].(int64), tt.mockStatistics[7].(float64),
						tt.mockStatistics[8].(float64), tt.mockStatistics[9].(float64),
						tt.mockError,
					).Once()
			} else {
				mockEmployeeRepo.On("GetStatisticsWithTrendsByManagerAndMonth", ctx, tt.inputManagerID, tt.inputMonth).
					Return(
						int64(0), int64(0), int64(0), int64(0),
						int64(0), int64(0), int64(0), float64(0),
						float64(0), float64(0), tt.mockError,
					).Once()
			}

			result, err := uc.GetStatisticsByManagerAndMonth(ctx, tt.inputManagerID, tt.inputMonth)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedResponse.TotalEmployees, result.TotalEmployees)
				assert.Equal(t, tt.expectedResponse.NewEmployees, result.NewEmployees)
				assert.Equal(t, tt.expectedResponse.ActiveEmployees, result.ActiveEmployees)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_GetHireDateRange(t *testing.T) {
	ctx := context.Background()
	managerID := uint(1)

	earliestDate := time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)
	latestDate := time.Date(2023, 12, 31, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name             string
		inputManagerID   uint
		mockEarliest     *time.Time
		mockLatest       *time.Time
		mockError        error
		expectedEarliest *time.Time
		expectedLatest   *time.Time
		expectedErrorMsg string
	}{
		{
			name:             "successful retrieval",
			inputManagerID:   managerID,
			mockEarliest:     &earliestDate,
			mockLatest:       &latestDate,
			mockError:        nil,
			expectedEarliest: &earliestDate,
			expectedLatest:   &latestDate,
			expectedErrorMsg: "",
		},
		{
			name:             "no hire dates found",
			inputManagerID:   managerID,
			mockEarliest:     nil,
			mockLatest:       nil,
			mockError:        nil,
			expectedEarliest: nil,
			expectedLatest:   nil,
			expectedErrorMsg: "",
		},
		{
			name:             "repository error",
			inputManagerID:   managerID,
			mockEarliest:     nil,
			mockLatest:       nil,
			mockError:        errors.New("database error"),
			expectedEarliest: nil,
			expectedLatest:   nil,
			expectedErrorMsg: "failed to get hire date range: database error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockEmployeeRepo.On("GetHireDateRange", ctx, tt.inputManagerID).
				Return(tt.mockEarliest, tt.mockLatest, tt.mockError).Once()

			earliest, latest, err := uc.GetHireDateRange(ctx, tt.inputManagerID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), strings.Split(tt.expectedErrorMsg, ":")[0])
				assert.Nil(t, earliest)
				assert.Nil(t, latest)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedEarliest, earliest)
				assert.Equal(t, tt.expectedLatest, latest)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func floatPtr(f float64) *float64 {
	return &f
}

func TestEmployeeUseCase_BulkImportWithTransaction(t *testing.T) {
	ctx := context.Background()
	creatorEmployeeID := uint(1)

	employees := []*domain.Employee{
		{
			FirstName:    "John",
			PositionName: "Developer",
			User: domain.User{
				Email: "john@example.com",
			},
		},
		{
			FirstName:    "Jane",
			PositionName: "Designer",
			User: domain.User{
				Email: "jane@example.com",
			},
		},
	}

	tests := []struct {
		name                     string
		inputEmployees           []*domain.Employee
		mockPreValidationErrors  []EmployeeImportError
		mockRegisterErrors       []error
		expectedSuccessfulIDs    []uint
		expectedErrorCount       int
		expectPreValidationError bool
	}{
		{
			name:                     "all employees successful",
			inputEmployees:           employees,
			mockPreValidationErrors:  nil,
			mockRegisterErrors:       []error{nil, nil},
			expectedSuccessfulIDs:    []uint{1, 2},
			expectedErrorCount:       0,
			expectPreValidationError: false,
		},
		{
			name:           "pre-validation fails",
			inputEmployees: employees,
			mockPreValidationErrors: []EmployeeImportError{
				{
					Row:     2,
					Field:   "email",
					Message: "Email is required",
					Value:   "",
				},
			},
			mockRegisterErrors:       nil,
			expectedSuccessfulIDs:    nil,
			expectedErrorCount:       1,
			expectPreValidationError: true,
		},
		{
			name:                     "one employee fails",
			inputEmployees:           employees,
			mockPreValidationErrors:  nil,
			mockRegisterErrors:       []error{nil, errors.New("duplicate email")},
			expectedSuccessfulIDs:    nil,
			expectedErrorCount:       1,
			expectPreValidationError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			// Mock checkBulkEmployeeLimit flow
			if !tt.expectPreValidationError {
				creatorEmployee := &domain.Employee{
					ID: creatorEmployeeID,
					User: domain.User{
						ID:   creatorEmployeeID,
						Role: "admin",
					},
				}
				mockEmployeeRepo.On("GetByID", ctx, creatorEmployeeID).Return(creatorEmployee, nil).Once()
				mockAuthRepo.On("GetUserByID", ctx, creatorEmployeeID).Return(&domain.User{
					ID:   creatorEmployeeID,
					Role: "admin",
				}, nil).Once()
				mockEmployeeRepo.On("GetByUserID", ctx, creatorEmployeeID).Return(creatorEmployee, nil).Once()
				mockEmployeeRepo.On("List", ctx, mock.Anything, mock.Anything).Return([]*domain.Employee{}, int64(0), nil).Once()
				mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, creatorEmployeeID).Return(nil, errors.New("subscription not found")).Once()

				// Mock validation checks
				for _, emp := range tt.inputEmployees {
					mockAuthRepo.On("GetUserByEmail", ctx, emp.User.Email).Return(nil, errors.New("user not found")).Maybe()
				}
			}

			// Mock register calls if needed
			if !tt.expectPreValidationError && tt.mockRegisterErrors != nil {
				for i := range tt.inputEmployees {
					mockRegisterCall := mockAuthRepo.On("RegisterEmployeeUser", ctx, mock.AnythingOfType("*domain.User"), mock.AnythingOfType("*domain.Employee"))

					if i < len(tt.mockRegisterErrors) && tt.mockRegisterErrors[i] == nil {
						empID := uint(i + 1)
						mockRegisterCall.Run(func(args mock.Arguments) {
							employee := args.Get(2).(*domain.Employee)
							employee.ID = empID
						})
					}

					if i < len(tt.mockRegisterErrors) {
						mockRegisterCall.Return(tt.mockRegisterErrors[i]).Once()
					} else {
						mockRegisterCall.Return(nil).Once()
					}
				}
			}

			successfulIDs, importErrors := uc.BulkImportWithTransaction(ctx, tt.inputEmployees, creatorEmployeeID)

			if tt.expectPreValidationError || len(tt.mockRegisterErrors) > 0 && tt.mockRegisterErrors[1] != nil {
				assert.Equal(t, tt.expectedErrorCount, len(importErrors))
				assert.Nil(t, successfulIDs)
			} else {
				assert.Equal(t, len(tt.expectedSuccessfulIDs), len(successfulIDs))
				assert.Equal(t, tt.expectedErrorCount, len(importErrors))

				for i, expectedID := range tt.expectedSuccessfulIDs {
					assert.Equal(t, expectedID, successfulIDs[i])
				}
			}

			mockAuthRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
			mockXenditRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_SyncSubscriptionEmployeeCount(t *testing.T) {
	ctx := context.Background()
	adminUserID := uint(1)

	tests := []struct {
		name                  string
		inputAdminUserID      uint
		mockSubscription      *domain.Subscription
		mockSubscriptionError error
		mockCurrentCount      int
		mockCurrentCountError error
		mockUpdateError       error
		expectedErrorMsg      string
	}{
		{
			name:             "successful sync",
			inputAdminUserID: adminUserID,
			mockSubscription: &domain.Subscription{
				ID:                   1,
				CurrentEmployeeCount: 5,
			},
			mockSubscriptionError: nil,
			mockCurrentCount:      10,
			mockCurrentCountError: nil,
			mockUpdateError:       nil,
			expectedErrorMsg:      "",
		},
		{
			name:                  "subscription not found",
			inputAdminUserID:      adminUserID,
			mockSubscription:      nil,
			mockSubscriptionError: errors.New("subscription not found"),
			expectedErrorMsg:      "failed to get subscription: subscription not found",
		},
		{
			name:             "get current count error",
			inputAdminUserID: adminUserID,
			mockSubscription: &domain.Subscription{
				ID: 1,
			},
			mockSubscriptionError: nil,
			mockCurrentCountError: errors.New("count error"),
			expectedErrorMsg:      "failed to get current employee count: count error",
		},
		{
			name:             "update error",
			inputAdminUserID: adminUserID,
			mockSubscription: &domain.Subscription{
				ID: 1,
			},
			mockSubscriptionError: nil,
			mockCurrentCount:      10,
			mockCurrentCountError: nil,
			mockUpdateError:       errors.New("update error"),
			expectedErrorMsg:      "failed to update subscription: update error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAuthRepo := new(mocks.AuthRepository)
			mockXenditRepo := new(mocks.XenditRepository)
			mockSupabaseClient := &supa.Client{}
			mockDB := &gorm.DB{}
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

			mockXenditRepo.On("GetSubscriptionByAdminUserID", ctx, tt.inputAdminUserID).
				Return(tt.mockSubscription, tt.mockSubscriptionError).Once()

			if tt.mockSubscriptionError == nil {
				// Mock getCurrentEmployeeCount flow
				adminUser := &domain.User{
					ID:   tt.inputAdminUserID,
					Role: "admin",
				}
				mockAuthRepo.On("GetUserByID", ctx, tt.inputAdminUserID).Return(adminUser, tt.mockCurrentCountError).Maybe()

				if tt.mockCurrentCountError == nil {
					adminEmployee := &domain.Employee{
						ID:     tt.inputAdminUserID,
						UserID: tt.inputAdminUserID,
					}
					mockEmployeeRepo.On("GetByUserID", ctx, tt.inputAdminUserID).Return(adminEmployee, nil).Maybe()
					mockEmployeeRepo.On("List", ctx, mock.Anything, mock.Anything).Return([]*domain.Employee{}, int64(tt.mockCurrentCount-1), nil).Maybe()

					if tt.mockUpdateError != nil {
						mockXenditRepo.On("UpdateSubscription", ctx, mock.AnythingOfType("*domain.Subscription")).
							Return(tt.mockUpdateError).Once()
					} else {
						mockXenditRepo.On("UpdateSubscription", ctx, mock.AnythingOfType("*domain.Subscription")).
							Run(func(args mock.Arguments) {
								subscription := args.Get(1).(*domain.Subscription)
								assert.Equal(t, tt.mockCurrentCount, subscription.CurrentEmployeeCount)
							}).
							Return(nil).Once()
					}
				}
			}

			err := uc.SyncSubscriptionEmployeeCount(ctx, tt.inputAdminUserID)

			if tt.expectedErrorMsg != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
			} else {
				assert.NoError(t, err)
			}

			mockXenditRepo.AssertExpectations(t)
			mockAuthRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestEmployeeUseCase_ValidationHelpers(t *testing.T) {
	mockEmployeeRepo := new(mocks.EmployeeRepository)
	mockAuthRepo := new(mocks.AuthRepository)
	mockXenditRepo := new(mocks.XenditRepository)
	mockSupabaseClient := &supa.Client{}
	mockDB := &gorm.DB{}
	uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

	t.Run("isValidEmailFormat", func(t *testing.T) {
		tests := []struct {
			email    string
			expected bool
		}{
			{"test@example.com", true},
			{"user@domain.org", true},
			{"invalid-email", false},
			{"@domain.com", false},
			{"user@", false},
			{"", false},
		}

		for _, tt := range tests {
			result := uc.isValidEmailFormat(tt.email)
			assert.Equal(t, tt.expected, result, "Email: %s", tt.email)
		}
	})

	t.Run("isValidPhoneFormat", func(t *testing.T) {
		tests := []struct {
			phone    string
			expected bool
		}{
			{"+628123456789", true},
			{"081234567890", true},
			{"8123456789", true},
			{"123", false},
			{"", false},
			{"12345678901234567890123", false},
		}

		for _, tt := range tests {
			result := uc.isValidPhoneFormat(tt.phone)
			assert.Equal(t, tt.expected, result, "Phone: %s", tt.phone)
		}
	})

	t.Run("isValidNIKFormat", func(t *testing.T) {
		tests := []struct {
			nik      string
			expected bool
		}{
			{"1234567890123456", true},
			{"0000000000000000", true},
			{"123456789012345", false},   // 15 digits
			{"12345678901234567", false}, // 17 digits
			{"123456789012345a", false},  // contains letter
			{"", false},
		}

		for _, tt := range tests {
			result := uc.isValidNIKFormat(tt.nik)
			assert.Equal(t, tt.expected, result, "NIK: %s", tt.nik)
		}
	})

	t.Run("isValidPositionName", func(t *testing.T) {
		tests := []struct {
			position string
			expected bool
		}{
			{"Developer", true},
			{"Senior Manager", true},
			{"   ", false},
			{"", false},
		}

		for _, tt := range tests {
			result := uc.isValidPositionName(tt.position)
			assert.Equal(t, tt.expected, result, "Position: %s", tt.position)
		}
	})
}

func TestEmployeeUseCase_ComprehensivePreValidation(t *testing.T) {
	ctx := context.Background()
	futureDate := time.Now().AddDate(1, 0, 0) // 1 year in future
	pastDate := time.Now().AddDate(-25, 0, 0) // 25 years ago

	employees := []*domain.Employee{
		{
			FirstName:    "John",
			PositionName: "Developer",
			User: domain.User{
				Email: "invalid-email",
				Phone: "123", // invalid phone
			},
			NIK:         stringPtr("123"), // invalid NIK
			DateOfBirth: &futureDate,      // future date
		},
		{
			FirstName:    "Jane",
			PositionName: "Designer",
			User: domain.User{
				Email: "jane@example.com",
				Phone: "+628123456789",
			},
			NIK:         stringPtr("1234567890123456"),
			DateOfBirth: &pastDate,
		},
	}

	mockEmployeeRepo := new(mocks.EmployeeRepository)
	mockAuthRepo := new(mocks.AuthRepository)
	mockXenditRepo := new(mocks.XenditRepository)
	mockSupabaseClient := &supa.Client{}
	mockDB := &gorm.DB{}
	uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

	errors := uc.comprehensivePreValidation(ctx, employees)

	// Should have multiple validation errors for the first employee
	assert.Greater(t, len(errors), 0)

	// Check specific error types
	foundEmailError := false
	foundPhoneError := false
	foundNIKError := false
	foundDateError := false

	for _, err := range errors {
		if err.Field == "email" && strings.Contains(err.Message, "Invalid email format") {
			foundEmailError = true
		}
		if err.Field == "phone" && strings.Contains(err.Message, "Invalid phone format") {
			foundPhoneError = true
		}
		if err.Field == "nik" && strings.Contains(err.Message, "Invalid NIK format") {
			foundNIKError = true
		}
		if err.Field == "date_of_birth" && strings.Contains(err.Message, "cannot be in the future") {
			foundDateError = true
		}
	}

	assert.True(t, foundEmailError, "Should have email validation error")
	assert.True(t, foundPhoneError, "Should have phone validation error")
	assert.True(t, foundNIKError, "Should have NIK validation error")
	assert.True(t, foundDateError, "Should have date validation error")
}

func TestEmployeeUseCase_UpdateEmployeeFields(t *testing.T) {
	mockEmployeeRepo := new(mocks.EmployeeRepository)
	mockAuthRepo := new(mocks.AuthRepository)
	mockXenditRepo := new(mocks.XenditRepository)
	mockSupabaseClient := &supa.Client{}
	mockDB := &gorm.DB{}
	uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

	existingEmployee := &domain.Employee{
		ID:             1,
		FirstName:      "John",
		LastName:       stringPtr("Doe"),
		EmployeeCode:   stringPtr("EMP001"),
		PositionName:   "Developer",
		WorkScheduleID: uintPtr(1),
		User: domain.User{
			Email: "john@example.com",
			Phone: "+1234567890",
		},
	}

	updateEmployee := &domain.Employee{
		FirstName:      "John Updated",
		LastName:       stringPtr("Doe Updated"),
		EmployeeCode:   stringPtr("EMP002"),
		PositionName:   "Senior Developer",
		WorkScheduleID: uintPtr(2),
		User: domain.User{
			Email: "john.updated@example.com",
			Phone: "+1234567891",
		},
	}

	uc.updateEmployeeFields(existingEmployee, updateEmployee)

	// Verify all fields were updated
	assert.Equal(t, "John Updated", existingEmployee.FirstName)
	assert.Equal(t, "Doe Updated", *existingEmployee.LastName)
	assert.Equal(t, "EMP002", *existingEmployee.EmployeeCode)
	assert.Equal(t, "Senior Developer", existingEmployee.PositionName)
	assert.Equal(t, uint(2), *existingEmployee.WorkScheduleID)
	assert.Equal(t, "john.updated@example.com", existingEmployee.User.Email)
	assert.Equal(t, "+1234567891", existingEmployee.User.Phone)
}

func TestEmployeeUseCase_ConvertToImportError(t *testing.T) {
	mockEmployeeRepo := new(mocks.EmployeeRepository)
	mockAuthRepo := new(mocks.AuthRepository)
	mockXenditRepo := new(mocks.XenditRepository)
	mockSupabaseClient := &supa.Client{}
	mockDB := &gorm.DB{}
	uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

	employee := &domain.Employee{
		FirstName: "John",
		LastName:  stringPtr("Doe"),
		User: domain.User{
			Email: "john@example.com",
			Phone: "+1234567890",
		},
		NIK:          stringPtr("1234567890123456"),
		EmployeeCode: stringPtr("EMP001"),
	}

	tests := []struct {
		name          string
		inputError    error
		expectedField string
		expectedMsg   string
	}{
		{
			name:          "email duplicate error",
			inputError:    errors.New("duplicate key value violates unique constraint \"uni_users_email\""),
			expectedField: "email",
			expectedMsg:   "Email 'john@example.com' is already used by another employee",
		},
		{
			name:          "phone duplicate error",
			inputError:    errors.New("duplicate key value violates unique constraint \"uni_users_phone\""),
			expectedField: "phone",
			expectedMsg:   "Phone number '+1234567890' is already used by another employee",
		},
		{
			name:          "NIK duplicate error",
			inputError:    errors.New("duplicate key value violates unique constraint \"uni_employees_nik\""),
			expectedField: "nik",
			expectedMsg:   "NIK '1234567890123456' is already registered for another employee",
		},
		{
			name:          "employee code duplicate error",
			inputError:    errors.New("duplicate key value violates unique constraint \"uni_employees_employee_code\""),
			expectedField: "employee_code",
			expectedMsg:   "Employee code 'EMP001' is already used",
		},
		{
			name:          "invalid email format",
			inputError:    errors.New("invalid email format"),
			expectedField: "email",
			expectedMsg:   "Invalid email format 'john@example.com'",
		},
		{
			name:          "phone format error",
			inputError:    errors.New("phone number format error"),
			expectedField: "phone",
			expectedMsg:   "Invalid phone format '+1234567890'. Use international format like +628123456789",
		},
		{
			name:          "connection error",
			inputError:    errors.New("connection timeout"),
			expectedField: "general",
			expectedMsg:   "Failed to connect to database. Please try again in a few moments",
		},
		{
			name:          "general error",
			inputError:    errors.New("some unknown error"),
			expectedField: "general",
			expectedMsg:   "Failed to create account for employee 'John Doe'. Please check the data entered",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := uc.convertToImportError(tt.inputError, employee, 2)

			assert.Equal(t, 2, result.Row)
			assert.Equal(t, tt.expectedField, result.Field)
			assert.Contains(t, result.Message, tt.expectedMsg)
			assert.Equal(t, employee, result.Employee)
		})
	}
}

func TestEmployeeUseCase_ValidateRequiredFields(t *testing.T) {
	mockEmployeeRepo := new(mocks.EmployeeRepository)
	mockAuthRepo := new(mocks.AuthRepository)
	mockXenditRepo := new(mocks.XenditRepository)
	mockSupabaseClient := &supa.Client{}
	mockDB := &gorm.DB{}
	uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

	tests := []struct {
		name           string
		employee       *domain.Employee
		expectedErrors int
		expectedFields []string
	}{
		{
			name: "all fields valid",
			employee: &domain.Employee{
				FirstName:    "John",
				PositionName: "Developer",
				User: domain.User{
					Email: "john@example.com",
				},
			},
			expectedErrors: 0,
			expectedFields: []string{},
		},
		{
			name: "missing email",
			employee: &domain.Employee{
				FirstName:    "John",
				PositionName: "Developer",
				User:         domain.User{},
			},
			expectedErrors: 1,
			expectedFields: []string{"email"},
		},
		{
			name: "missing first name",
			employee: &domain.Employee{
				FirstName:    "",
				PositionName: "Developer",
				User: domain.User{
					Email: "john@example.com",
				},
			},
			expectedErrors: 1,
			expectedFields: []string{"first_name"},
		},
		{
			name: "missing position name",
			employee: &domain.Employee{
				FirstName:    "John",
				PositionName: "",
				User: domain.User{
					Email: "john@example.com",
				},
			},
			expectedErrors: 1,
			expectedFields: []string{"position_name"},
		},
		{
			name: "all fields missing",
			employee: &domain.Employee{
				FirstName:    "",
				PositionName: "",
				User:         domain.User{},
			},
			expectedErrors: 3,
			expectedFields: []string{"email", "first_name", "position_name"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errors := uc.validateRequiredFields(tt.employee, 2)

			assert.Equal(t, tt.expectedErrors, len(errors))

			if tt.expectedErrors > 0 {
				foundFields := make(map[string]bool)
				for _, err := range errors {
					foundFields[err.Field] = true
					assert.Equal(t, 2, err.Row)
					assert.Equal(t, tt.employee, err.Employee)
				}

				for _, field := range tt.expectedFields {
					assert.True(t, foundFields[field], "Expected error for field: %s", field)
				}
			}
		})
	}
}

func TestEmployeeUseCase_CheckBatchDuplicates(t *testing.T) {
	mockEmployeeRepo := new(mocks.EmployeeRepository)
	mockAuthRepo := new(mocks.AuthRepository)
	mockXenditRepo := new(mocks.XenditRepository)
	mockSupabaseClient := &supa.Client{}
	mockDB := &gorm.DB{}
	uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, mockXenditRepo, mockSupabaseClient, mockDB)

	employees := []*domain.Employee{
		{
			User: domain.User{
				Email: "john@example.com",
				Phone: "+1234567890",
			},
			NIK:          stringPtr("1234567890123456"),
			EmployeeCode: stringPtr("EMP001"),
		},
		{
			User: domain.User{
				Email: "john@example.com", // duplicate email
				Phone: "+1234567891",
			},
			NIK:          stringPtr("1234567890123457"),
			EmployeeCode: stringPtr("EMP002"),
		},
		{
			User: domain.User{
				Email: "jane@example.com",
				Phone: "+1234567890", // duplicate phone
			},
			NIK:          stringPtr("1234567890123456"), // duplicate NIK
			EmployeeCode: stringPtr("EMP001"),           // duplicate employee code
		},
	}

	tests := []struct {
		name           string
		employeeIndex  int
		expectedErrors int
		expectedFields []string
	}{
		{
			name:           "first employee - no duplicates",
			employeeIndex:  0,
			expectedErrors: 0,
			expectedFields: []string{},
		},
		{
			name:           "second employee - duplicate email",
			employeeIndex:  1,
			expectedErrors: 1,
			expectedFields: []string{"email"},
		},
		{
			name:           "third employee - multiple duplicates",
			employeeIndex:  2,
			expectedErrors: 3,
			expectedFields: []string{"phone", "nik", "employee_code"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errors := uc.checkBatchDuplicates(employees[tt.employeeIndex], employees, tt.employeeIndex)

			assert.Equal(t, tt.expectedErrors, len(errors))

			if tt.expectedErrors > 0 {
				foundFields := make(map[string]bool)
				for _, err := range errors {
					foundFields[err.Field] = true
					assert.Equal(t, tt.employeeIndex+2, err.Row) // Row numbers start from 2
					assert.Equal(t, employees[tt.employeeIndex], err.Employee)
				}

				for _, field := range tt.expectedFields {
					assert.True(t, foundFields[field], "Expected error for field: %s", field)
				}
			}
		})
	}
}
