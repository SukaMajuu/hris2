package attendance

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/attendance"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestAttendanceUseCase_Create(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	clockInTime := now.Format("15:04:05")
	date := now.Format("2006-01-02")

	lastName := "Doe"

	mockWorkSchedule := &domain.WorkSchedule{
		ID:   1,
		Name: "Standard Schedule",
	}

	mockEmployee := &domain.Employee{
		ID:             1,
		FirstName:      "John",
		LastName:       &lastName,
		WorkScheduleID: &mockWorkSchedule.ID,
	}

	mockAttendance := &domain.Attendance{
		ID:         1,
		EmployeeID: 1,
		Date:       now,
		ClockIn:    &now,
		Status:     domain.OnTime,
		Employee:   *mockEmployee,
	}

	tests := []struct {
		name             string
		reqDTO           *attendance.CreateAttendanceRequestDTO
		mockSetup        func(*mocks.AttendanceRepository, *mocks.EmployeeRepository, *mocks.WorkScheduleRepository)
		expectedError    bool
		expectedErrorMsg string
	}{
		{
			name: "successful create attendance",
			reqDTO: &attendance.CreateAttendanceRequestDTO{
				EmployeeID: 1,

				Date:    date,
				ClockIn: &clockInTime,
			},
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository, employeeRepo *mocks.EmployeeRepository, workScheduleRepo *mocks.WorkScheduleRepository) {
				employeeRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				workScheduleRepo.On("GetByIDWithDetails", ctx, uint(1)).Return(mockWorkSchedule, nil)
				attendanceRepo.On("GetByEmployeeAndDate", ctx, uint(1), date).Return(nil, gorm.ErrRecordNotFound)
				attendanceRepo.On("Create", ctx, mock.AnythingOfType("*domain.Attendance")).Return(nil).Run(func(args mock.Arguments) {
					attendance := args.Get(1).(*domain.Attendance)
					attendance.ID = 1
				})
				attendanceRepo.On("GetByID", ctx, uint(1)).Return(mockAttendance, nil)
			},
			expectedError: false,
		},
		{
			name: "employee not found",
			reqDTO: &attendance.CreateAttendanceRequestDTO{
				EmployeeID:     999,
				WorkScheduleID: 1,
				Date:           date,
				ClockIn:        &clockInTime,
			},
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository, employeeRepo *mocks.EmployeeRepository, workScheduleRepo *mocks.WorkScheduleRepository) {
				employeeRepo.On("GetByID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedError:    true,
			expectedErrorMsg: "employee with ID 999 not found",
		},
		{
			name: "work schedule not found",
			reqDTO: &attendance.CreateAttendanceRequestDTO{
				EmployeeID:     1,
				WorkScheduleID: 999,
				Date:           date,
				ClockIn:        &clockInTime,
			},
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository, employeeRepo *mocks.EmployeeRepository, workScheduleRepo *mocks.WorkScheduleRepository) {
				employeeRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				workScheduleRepo.On("GetByIDWithDetails", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedError:    true,
			expectedErrorMsg: "work schedule with ID 999 not found",
		},
		{
			name: "attendance already exists",
			reqDTO: &attendance.CreateAttendanceRequestDTO{
				EmployeeID:     1,
				WorkScheduleID: 1,
				Date:           date,
				ClockIn:        &clockInTime,
			},
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository, employeeRepo *mocks.EmployeeRepository, workScheduleRepo *mocks.WorkScheduleRepository) {
				employeeRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				workScheduleRepo.On("GetByIDWithDetails", ctx, uint(1)).Return(mockWorkSchedule, nil)
				attendanceRepo.On("GetByEmployeeAndDate", ctx, uint(1), date).Return(mockAttendance, nil)
			},
			expectedError:    true,
			expectedErrorMsg: "attendance record already exists for employee 1 on",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			attendanceRepo := &mocks.AttendanceRepository{}
			employeeRepo := &mocks.EmployeeRepository{}
			workScheduleRepo := &mocks.WorkScheduleRepository{}

			tt.mockSetup(attendanceRepo, employeeRepo, workScheduleRepo)

			uc := NewAttendanceUseCase(attendanceRepo, employeeRepo, workScheduleRepo)
			result, err := uc.Create(ctx, tt.reqDTO)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, mockAttendance.ID, result.ID)
			}

			attendanceRepo.AssertExpectations(t)
			employeeRepo.AssertExpectations(t)
			workScheduleRepo.AssertExpectations(t)
		})
	}
}

func TestAttendanceUseCase_GetByID(t *testing.T) {
	ctx := context.Background()
	now := time.Now()

	lastName := "Doe"

	mockWorkSchedule := &domain.WorkSchedule{
		ID:   1,
		Name: "Standard Schedule",
	}

	mockEmployee := &domain.Employee{
		ID:             1,
		FirstName:      "John",
		LastName:       &lastName,
		WorkScheduleID: &mockWorkSchedule.ID,
	}

	mockAttendance := &domain.Attendance{
		ID:         1,
		EmployeeID: 1,
		Date:       now,
		ClockIn:    &now,
		Status:     domain.OnTime,
		Employee:   *mockEmployee,
	}

	tests := []struct {
		name             string
		attendanceID     uint
		mockSetup        func(*mocks.AttendanceRepository)
		expectedError    bool
		expectedErrorMsg string
	}{
		{
			name:         "successful get attendance by ID",
			attendanceID: 1,
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository) {
				attendanceRepo.On("GetByID", ctx, uint(1)).Return(mockAttendance, nil)
			},
			expectedError: false,
		},
		{
			name:         "attendance not found",
			attendanceID: 999,
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository) {
				attendanceRepo.On("GetByID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedError:    true,
			expectedErrorMsg: "attendance with ID 999 not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			attendanceRepo := &mocks.AttendanceRepository{}
			employeeRepo := &mocks.EmployeeRepository{}
			workScheduleRepo := &mocks.WorkScheduleRepository{}

			tt.mockSetup(attendanceRepo)

			uc := NewAttendanceUseCase(attendanceRepo, employeeRepo, workScheduleRepo)
			result, err := uc.GetByID(ctx, tt.attendanceID)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, mockAttendance.ID, result.ID)
			}

			attendanceRepo.AssertExpectations(t)
		})
	}
}

func TestAttendanceUseCase_List(t *testing.T) {
	ctx := context.Background()
	now := time.Now()

	lastName := "Doe"

	mockWorkSchedule := &domain.WorkSchedule{
		ID:   1,
		Name: "Standard Schedule",
	}

	mockEmployee := &domain.Employee{
		ID:             1,
		FirstName:      "John",
		LastName:       &lastName,
		WorkScheduleID: &mockWorkSchedule.ID,
	}

	mockAttendances := []*domain.Attendance{
		{
			ID:         1,
			EmployeeID: 1,
			Date:       now,
			ClockIn:    &now,
			Status:     domain.OnTime,
			Employee:   *mockEmployee,
		},
	}

	paginationParams := domain.PaginationParams{
		Page:     1,
		PageSize: 10,
	}

	tests := []struct {
		name             string
		paginationParams domain.PaginationParams
		mockSetup        func(*mocks.AttendanceRepository)
		expectedError    bool
		expectedErrorMsg string
	}{
		{
			name:             "successful list attendances",
			paginationParams: paginationParams,
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository) {
				attendanceRepo.On("ListAll", ctx, paginationParams).Return(mockAttendances, int64(1), nil)
			},
			expectedError: false,
		},
		{
			name:             "database error",
			paginationParams: paginationParams,
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository) {
				attendanceRepo.On("ListAll", ctx, paginationParams).Return(nil, int64(0), errors.New("database error"))
			},
			expectedError:    true,
			expectedErrorMsg: "failed to list attendances",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			attendanceRepo := &mocks.AttendanceRepository{}
			employeeRepo := &mocks.EmployeeRepository{}
			workScheduleRepo := &mocks.WorkScheduleRepository{}

			tt.mockSetup(attendanceRepo)

			uc := NewAttendanceUseCase(attendanceRepo, employeeRepo, workScheduleRepo)
			result, err := uc.List(ctx, tt.paginationParams)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Len(t, result.Items, 1)
				assert.Equal(t, int64(1), result.Pagination.TotalItems)
			}

			attendanceRepo.AssertExpectations(t)
		})
	}
}

func TestAttendanceUseCase_ListByEmployee(t *testing.T) {
	ctx := context.Background()
	now := time.Now()

	lastName := "Doe"

	mockWorkSchedule := &domain.WorkSchedule{
		ID:   1,
		Name: "Standard Schedule",
	}

	mockEmployee := &domain.Employee{
		ID:             1,
		FirstName:      "John",
		LastName:       &lastName,
		WorkScheduleID: &mockWorkSchedule.ID,
	}

	mockAttendances := []*domain.Attendance{
		{
			ID:         1,
			EmployeeID: 1,
			Date:       now,
			ClockIn:    &now,
			Status:     domain.OnTime,
			Employee:   *mockEmployee,
		},
	}

	paginationParams := domain.PaginationParams{
		Page:     1,
		PageSize: 10,
	}

	tests := []struct {
		name             string
		employeeID       uint
		paginationParams domain.PaginationParams
		mockSetup        func(*mocks.AttendanceRepository, *mocks.EmployeeRepository)
		expectedError    bool
		expectedErrorMsg string
	}{
		{
			name:             "successful list attendances by employee",
			employeeID:       1,
			paginationParams: paginationParams,
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository, employeeRepo *mocks.EmployeeRepository) {
				employeeRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				attendanceRepo.On("ListByEmployee", ctx, uint(1), paginationParams).Return(mockAttendances, int64(1), nil)
			},
			expectedError: false,
		},
		{
			name:             "employee not found",
			employeeID:       999,
			paginationParams: paginationParams,
			mockSetup: func(attendanceRepo *mocks.AttendanceRepository, employeeRepo *mocks.EmployeeRepository) {
				employeeRepo.On("GetByID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedError:    true,
			expectedErrorMsg: "employee with ID 999 not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			attendanceRepo := &mocks.AttendanceRepository{}
			employeeRepo := &mocks.EmployeeRepository{}
			workScheduleRepo := &mocks.WorkScheduleRepository{}

			tt.mockSetup(attendanceRepo, employeeRepo)

			uc := NewAttendanceUseCase(attendanceRepo, employeeRepo, workScheduleRepo)
			result, err := uc.ListByEmployee(ctx, tt.employeeID, tt.paginationParams)

			if tt.expectedError {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErrorMsg)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Len(t, result.Items, 1)
				assert.Equal(t, int64(1), result.Pagination.TotalItems)
			}

			attendanceRepo.AssertExpectations(t)
			employeeRepo.AssertExpectations(t)
		})
	}
}

func TestCalculateWorkHours(t *testing.T) {
	tests := []struct {
		name     string
		clockIn  *time.Time
		clockOut *time.Time
		expected *float64
	}{
		{
			name:     "valid work hours calculation",
			clockIn:  timePtr(time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)),
			clockOut: timePtr(time.Date(2024, 1, 1, 17, 0, 0, 0, time.UTC)),
			expected: float64Ptr(8.0),
		},
		{
			name:     "nil clock in",
			clockIn:  nil,
			clockOut: timePtr(time.Date(2024, 1, 1, 17, 0, 0, 0, time.UTC)),
			expected: nil,
		},
		{
			name:     "nil clock out",
			clockIn:  timePtr(time.Date(2024, 1, 1, 9, 0, 0, 0, time.UTC)),
			clockOut: nil,
			expected: nil,
		},
		{
			name:     "both nil",
			clockIn:  nil,
			clockOut: nil,
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := calculateWorkHours(tt.clockIn, tt.clockOut)

			if tt.expected == nil {
				assert.Nil(t, result)
			} else {
				assert.NotNil(t, result)
				assert.Equal(t, *tt.expected, *result)
			}
		})
	}
}

// Helper functions
func timePtr(t time.Time) *time.Time {
	return &t
}

func float64Ptr(f float64) *float64 {
	return &f
}
