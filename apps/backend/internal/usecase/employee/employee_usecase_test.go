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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

			for i := range tt.inputEmployees {
				mockRegisterCall := mockAuthRepo.On("RegisterEmployeeUser", ctx, mock.AnythingOfType("*domain.User"), mock.AnythingOfType("*domain.Employee"))

				if i < len(tt.mockRegisterErrors) && tt.mockRegisterErrors[i] == nil {
					// Capture the index for closure
					index := i
					mockRegisterCall.Run(func(args mock.Arguments) {
						emp := args.Get(2).(*domain.Employee)
						// Safe conversion: index is always non-negative and we add 1
						emp.ID = uint(index) + 1
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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo, nil)

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
