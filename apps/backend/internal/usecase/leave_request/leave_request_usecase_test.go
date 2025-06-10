package leave_request

import (
	"context"
	"errors"
	"mime/multipart"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoleave "github.com/SukaMajuu/hris/apps/backend/domain/dto/leave_request"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestLeaveRequestUseCase_Create(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	startDate := time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC)

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}
	mockLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  startDate,
		EndDate:    endDate,
		Duration:   2,
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Waiting Approval",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	repoError := errors.New("repository create failed")
	employeeNotFoundError := gorm.ErrRecordNotFound

	tests := []struct {
		name           string
		leaveRequest   *domain.LeaveRequest
		file           *multipart.FileHeader
		setupMocks     func(*mocks.LeaveRequestRepository, *mocks.EmployeeRepository)
		expectedResult *dtoleave.LeaveRequestResponseDTO
		expectedError  string
	}{
		{
			name:         "successful leave request creation without file",
			leaveRequest: mockLeaveRequest,
			file:         nil,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				lrRepo.On("Create", ctx, mock.MatchedBy(func(lr *domain.LeaveRequest) bool {
					return lr.EmployeeID == 1 && lr.Status == domain.LeaveStatusPending
				})).Return(nil)
				lrRepo.On("GetByID", ctx, uint(1)).Return(mockLeaveRequest, nil)
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name:         "employee not found",
			leaveRequest: mockLeaveRequest,
			file:         nil,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByID", ctx, uint(1)).Return(nil, employeeNotFoundError)
			},
			expectedResult: nil,
			expectedError:  "failed to validate employee ID 1:",
		},
		{
			name: "invalid date range - start date after end date",
			leaveRequest: &domain.LeaveRequest{
				EmployeeID: 1,
				StartDate:  endDate,   // end date as start
				EndDate:    startDate, // start date as end
			},
			file: nil,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
			},
			expectedResult: nil,
			expectedError:  "start date cannot be after end date",
		},
		{
			name:         "repository create error",
			leaveRequest: mockLeaveRequest,
			file:         nil,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				lrRepo.On("Create", ctx, mock.AnythingOfType("*domain.LeaveRequest")).Return(repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to create leave request:",
		},
		{
			name:         "get created leave request error",
			leaveRequest: mockLeaveRequest,
			file:         nil,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				lrRepo.On("Create", ctx, mock.AnythingOfType("*domain.LeaveRequest")).Return(nil)
				lrRepo.On("GetByID", ctx, uint(1)).Return(nil, repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to retrieve created leave request:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo, mockEmployeeRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)

			result, err := useCase.Create(ctx, tt.leaveRequest, tt.file)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_CreateForEmployee(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	startDate := time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC)

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	mockLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  startDate,
		EndDate:    endDate,
		Duration:   2,
		Status:     domain.LeaveStatusApproved, // Admin created requests are auto-approved
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Approved",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	tests := []struct {
		name           string
		leaveRequest   *domain.LeaveRequest
		setupMocks     func(*mocks.LeaveRequestRepository, *mocks.EmployeeRepository, *mocks.AttendanceRepository)
		expectedResult *dtoleave.LeaveRequestResponseDTO
		expectedError  string
	}{
		{
			name: "successful admin-created leave request",
			leaveRequest: &domain.LeaveRequest{
				EmployeeID: 1,
				LeaveType:  enums.AnnualLeave,
				StartDate:  startDate,
				EndDate:    endDate,
				Duration:   2,
			}, setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository, attRepo *mocks.AttendanceRepository) {
				empRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
				lrRepo.On("Create", ctx, mock.MatchedBy(func(lr *domain.LeaveRequest) bool {
					return lr.EmployeeID == 1 && lr.Status == domain.LeaveStatusApproved
				})).Return(nil)
				lrRepo.On("GetByID", ctx, uint(1)).Return(mockLeaveRequest, nil)

				// Mock attendance repository calls for createLeaveAttendanceRecords
				// For each day in the leave period (2023-12-25 to 2023-12-26, skipping Sunday 2023-12-24)
				// 2023-12-25 is Monday, 2023-12-26 is Tuesday - both working days
				attRepo.On("GetByEmployeeAndDate", ctx, uint(1), "2023-12-25").Return(nil, errors.New("not found"))
				attRepo.On("Create", ctx, mock.MatchedBy(func(att *domain.Attendance) bool {
					return att.EmployeeID == 1 && att.Status == domain.Leave && att.Date.Format("2006-01-02") == "2023-12-25"
				})).Return(nil)

				attRepo.On("GetByEmployeeAndDate", ctx, uint(1), "2023-12-26").Return(nil, errors.New("not found"))
				attRepo.On("Create", ctx, mock.MatchedBy(func(att *domain.Attendance) bool {
					return att.EmployeeID == 1 && att.Status == domain.Leave && att.Date.Format("2006-01-02") == "2023-12-26"
				})).Return(nil)
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.CreateForEmployee(ctx, tt.leaveRequest, nil)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
			mockAttendanceRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_GetByID(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	startDate := time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC)

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	mockLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  startDate,
		EndDate:    endDate,
		Duration:   2,
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Waiting Approval",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	repoError := errors.New("repository get failed")

	tests := []struct {
		name           string
		id             uint
		setupMocks     func(*mocks.LeaveRequestRepository)
		expectedResult *dtoleave.LeaveRequestResponseDTO
		expectedError  string
	}{
		{
			name: "successful get by ID",
			id:   1,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(mockLeaveRequest, nil)
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name: "leave request not found",
			id:   999,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedResult: nil,
			expectedError:  "failed to get leave request by ID 999:",
		},
		{
			name: "repository error",
			id:   1,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(nil, repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to get leave request by ID 1:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.GetByID(ctx, tt.id)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_List(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}
	filters := map[string]interface{}{"status": "Waiting Approval"}

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	mockLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC),
		EndDate:    time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC),
		Duration:   2,
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	mockLeaveRequests := []*domain.LeaveRequest{mockLeaveRequest}
	var mockTotalItems int64 = 1

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Waiting Approval",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	expectedSuccessResponseData := &dtoleave.LeaveRequestListResponseData{
		Items: []*dtoleave.LeaveRequestResponseDTO{expectedResponseDTO},
		Pagination: domain.Pagination{
			TotalItems:  mockTotalItems,
			TotalPages:  1,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: false,
			HasPrevPage: false,
		},
	}

	repoError := errors.New("repository list failed")

	tests := []struct {
		name           string
		filters        map[string]interface{}
		pagination     domain.PaginationParams
		setupMocks     func(*mocks.LeaveRequestRepository)
		expectedResult *dtoleave.LeaveRequestListResponseData
		expectedError  string
	}{
		{
			name:       "successful list with filters",
			filters:    filters,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("List", ctx, filters, paginationParams).Return(mockLeaveRequests, mockTotalItems, nil)
			},
			expectedResult: expectedSuccessResponseData,
			expectedError:  "",
		},
		{
			name:       "empty list",
			filters:    filters,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("List", ctx, filters, paginationParams).Return([]*domain.LeaveRequest{}, int64(0), nil)
			},
			expectedResult: &dtoleave.LeaveRequestListResponseData{
				Items: []*dtoleave.LeaveRequestResponseDTO{},
				Pagination: domain.Pagination{
					TotalItems:  0,
					TotalPages:  0,
					CurrentPage: paginationParams.Page,
					PageSize:    paginationParams.PageSize,
					HasNextPage: false,
					HasPrevPage: false,
				},
			},
			expectedError: "",
		},
		{
			name:       "repository error",
			filters:    filters,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("List", ctx, filters, paginationParams).Return(nil, int64(0), repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to list leave requests:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.List(ctx, tt.filters, tt.pagination)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_GetByEmployeeID(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	mockLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC),
		EndDate:    time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC),
		Duration:   2,
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	mockLeaveRequests := []*domain.LeaveRequest{mockLeaveRequest}
	var mockTotalItems int64 = 1

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Waiting Approval",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	expectedSuccessResponseData := &dtoleave.LeaveRequestListResponseData{
		Items: []*dtoleave.LeaveRequestResponseDTO{expectedResponseDTO},
		Pagination: domain.Pagination{
			TotalItems:  mockTotalItems,
			TotalPages:  1,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: false,
			HasPrevPage: false,
		},
	}

	repoError := errors.New("repository get by employee ID failed")

	tests := []struct {
		name           string
		employeeID     uint
		pagination     domain.PaginationParams
		setupMocks     func(*mocks.LeaveRequestRepository)
		expectedResult *dtoleave.LeaveRequestListResponseData
		expectedError  string
	}{
		{
			name:       "successful get by employee ID",
			employeeID: 1,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByEmployeeID", ctx, uint(1), paginationParams).Return(mockLeaveRequests, mockTotalItems, nil)
			},
			expectedResult: expectedSuccessResponseData,
			expectedError:  "",
		},
		{
			name:       "repository error",
			employeeID: 1,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByEmployeeID", ctx, uint(1), paginationParams).Return(nil, int64(0), repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to get leave requests for employee ID 1:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.GetByEmployeeID(ctx, tt.employeeID, tt.pagination)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_Update(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	startDate := time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC)
	newEndDate := time.Date(2023, 12, 27, 0, 0, 0, 0, time.UTC)

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	existingLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  startDate,
		EndDate:    endDate,
		Duration:   2,
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	updatedLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  startDate,
		EndDate:    newEndDate, // Updated end date
		Duration:   3,          // Updated duration
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	updateData := &domain.LeaveRequest{
		EndDate: newEndDate,
	}

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-27",
		Status:       "Waiting Approval",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	repoError := errors.New("repository update failed")

	tests := []struct {
		name           string
		id             uint
		updates        *domain.LeaveRequest
		setupMocks     func(*mocks.LeaveRequestRepository, *mocks.EmployeeRepository)
		expectedResult *dtoleave.LeaveRequestResponseDTO
		expectedError  string
	}{
		{
			name:    "successful update",
			id:      1,
			updates: updateData,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(existingLeaveRequest, nil).Once()
				lrRepo.On("Update", ctx, mock.MatchedBy(func(lr *domain.LeaveRequest) bool {
					return lr.ID == 1 && lr.EndDate.Equal(newEndDate)
				})).Return(nil)
				lrRepo.On("GetByID", ctx, uint(1)).Return(updatedLeaveRequest, nil).Once()
			},
			expectedResult: expectedResponseDTO,
			expectedError:  "",
		},
		{
			name:    "leave request not found",
			id:      999,
			updates: updateData,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				lrRepo.On("GetByID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedResult: nil,
			expectedError:  "failed to get existing leave request:",
		},
		{
			name:    "cannot update non-pending request",
			id:      1,
			updates: updateData,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				approvedRequest := &domain.LeaveRequest{
					ID:     1,
					Status: domain.LeaveStatusApproved,
				}
				lrRepo.On("GetByID", ctx, uint(1)).Return(approvedRequest, nil)
			},
			expectedResult: nil,
			expectedError:  "cannot update leave request with status: Approved",
		},
		{
			name: "invalid date range",
			id:   1,
			updates: &domain.LeaveRequest{
				StartDate: newEndDate,
				EndDate:   startDate,
			},
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(existingLeaveRequest, nil)
			},
			expectedResult: nil,
			expectedError:  "start date cannot be after end date",
		},
		{
			name:    "repository update error",
			id:      1,
			updates: updateData,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(existingLeaveRequest, nil).Once()
				lrRepo.On("Update", ctx, mock.AnythingOfType("*domain.LeaveRequest")).Return(repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to update leave request:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo, mockEmployeeRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.Update(ctx, tt.id, tt.updates, nil)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_UpdateStatus(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	startDate := time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC)

	lastName := "Doe"
	adminNote := "Approved by manager"

	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	updatedLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  startDate,
		EndDate:    endDate,
		Duration:   2,
		Status:     domain.LeaveStatusApproved,
		AdminNote:  &adminNote,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Approved",
		AdminNote:    &adminNote,
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	repoError := errors.New("repository update status failed")
	tests := []struct {
		name           string
		id             uint
		status         domain.LeaveStatus
		adminNote      *string
		setupMocks     func(*mocks.LeaveRequestRepository, *mocks.AttendanceRepository)
		expectedResult *dtoleave.LeaveRequestResponseDTO
		expectedError  string
	}{{
		name:      "successful status update to approved",
		id:        1,
		status:    domain.LeaveStatusApproved,
		adminNote: &adminNote,
		setupMocks: func(lrRepo *mocks.LeaveRequestRepository, attRepo *mocks.AttendanceRepository) {
			// Mock GetByID call that happens before UpdateStatus
			lrRepo.On("GetByID", ctx, uint(1)).Return(updatedLeaveRequest, nil)
			lrRepo.On("UpdateStatus", ctx, uint(1), domain.LeaveStatusApproved, &adminNote).Return(nil)

			// Mock attendance repository calls for createLeaveAttendanceRecords (for approved status)
			attRepo.On("GetByEmployeeAndDate", ctx, uint(1), "2023-12-25").Return(nil, errors.New("not found"))
			attRepo.On("Create", ctx, mock.MatchedBy(func(att *domain.Attendance) bool {
				return att.EmployeeID == 1 && att.Status == domain.Leave && att.Date.Format("2006-01-02") == "2023-12-25"
			})).Return(nil)

			attRepo.On("GetByEmployeeAndDate", ctx, uint(1), "2023-12-26").Return(nil, errors.New("not found"))
			attRepo.On("Create", ctx, mock.MatchedBy(func(att *domain.Attendance) bool {
				return att.EmployeeID == 1 && att.Status == domain.Leave && att.Date.Format("2006-01-02") == "2023-12-26"
			})).Return(nil)

			// Mock GetByID call that happens after UpdateStatus
			lrRepo.On("GetByID", ctx, uint(1)).Return(updatedLeaveRequest, nil)
		},
		expectedResult: expectedResponseDTO,
		expectedError:  "",
	}, {
		name:      "successful status update to rejected",
		id:        1,
		status:    domain.LeaveStatusRejected,
		adminNote: nil,
		setupMocks: func(lrRepo *mocks.LeaveRequestRepository, attRepo *mocks.AttendanceRepository) {
			rejectedRequest := &domain.LeaveRequest{
				ID:         1,
				EmployeeID: 1,
				Employee:   *mockEmployee,
				LeaveType:  enums.AnnualLeave,
				StartDate:  startDate,
				EndDate:    endDate,
				Duration:   2,
				Status:     domain.LeaveStatusRejected,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			// Mock GetByID call that happens before UpdateStatus
			lrRepo.On("GetByID", ctx, uint(1)).Return(rejectedRequest, nil)
			lrRepo.On("UpdateStatus", ctx, uint(1), domain.LeaveStatusRejected, (*string)(nil)).Return(nil)
			// No attendance repository calls for rejected status

			// Mock GetByID call that happens after UpdateStatus
			lrRepo.On("GetByID", ctx, uint(1)).Return(rejectedRequest, nil)
		},
		expectedResult: &dtoleave.LeaveRequestResponseDTO{
			ID:           1,
			EmployeeID:   1,
			EmployeeName: "John Doe",
			PositionName: "Software Engineer",
			LeaveType:    string(enums.AnnualLeave),
			StartDate:    "2023-12-25",
			EndDate:      "2023-12-26",
			Status:       "Rejected",
			CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		},
		expectedError: "",
	}, {
		name:      "invalid status",
		id:        1,
		status:    domain.LeaveStatusPending,
		adminNote: nil,
		setupMocks: func(lrRepo *mocks.LeaveRequestRepository, attRepo *mocks.AttendanceRepository) {
			// No repository calls expected for invalid status
		},
		expectedResult: nil,
		expectedError:  "invalid status: Waiting Approval",
	}, {
		name:      "repository update status error",
		id:        1,
		status:    domain.LeaveStatusApproved,
		adminNote: nil,
		setupMocks: func(lrRepo *mocks.LeaveRequestRepository, attRepo *mocks.AttendanceRepository) {
			// Mock GetByID call that happens before UpdateStatus
			lrRepo.On("GetByID", ctx, uint(1)).Return(updatedLeaveRequest, nil)
			lrRepo.On("UpdateStatus", ctx, uint(1), domain.LeaveStatusApproved, (*string)(nil)).Return(repoError)
		},
		expectedResult: nil,
		expectedError:  "failed to update leave request status:",
	}, {
		name:      "get updated leave request error",
		id:        1,
		status:    domain.LeaveStatusApproved,
		adminNote: nil,
		setupMocks: func(lrRepo *mocks.LeaveRequestRepository, attRepo *mocks.AttendanceRepository) {
			// Mock GetByID call that happens before UpdateStatus (this one succeeds)
			lrRepo.On("GetByID", ctx, uint(1)).Return(updatedLeaveRequest, nil).Once()
			lrRepo.On("UpdateStatus", ctx, uint(1), domain.LeaveStatusApproved, (*string)(nil)).Return(nil)

			// Mock attendance repository calls for createLeaveAttendanceRecords (for approved status)
			attRepo.On("GetByEmployeeAndDate", ctx, uint(1), "2023-12-25").Return(nil, errors.New("not found"))
			attRepo.On("Create", ctx, mock.MatchedBy(func(att *domain.Attendance) bool {
				return att.EmployeeID == 1 && att.Status == domain.Leave && att.Date.Format("2006-01-02") == "2023-12-25"
			})).Return(nil)

			attRepo.On("GetByEmployeeAndDate", ctx, uint(1), "2023-12-26").Return(nil, errors.New("not found"))
			attRepo.On("Create", ctx, mock.MatchedBy(func(att *domain.Attendance) bool {
				return att.EmployeeID == 1 && att.Status == domain.Leave && att.Date.Format("2006-01-02") == "2023-12-26"
			})).Return(nil)

			// Mock GetByID call that happens after UpdateStatus (this one fails)
			lrRepo.On("GetByID", ctx, uint(1)).Return(nil, repoError).Once()
		},
		expectedResult: nil,
		expectedError:  "failed to retrieve updated leave request:",
	},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo, mockAttendanceRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.UpdateStatus(ctx, tt.id, tt.status, tt.adminNote)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
			mockAttendanceRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_Delete(t *testing.T) {
	ctx := context.Background()
	now := time.Now()

	pendingLeaveRequest := &domain.LeaveRequest{
		ID:        1,
		Status:    domain.LeaveStatusPending,
		CreatedAt: now,
		UpdatedAt: now,
	}

	approvedLeaveRequest := &domain.LeaveRequest{
		ID:        1,
		Status:    domain.LeaveStatusApproved,
		CreatedAt: now,
		UpdatedAt: now,
	}

	repoError := errors.New("repository delete failed")

	tests := []struct {
		name          string
		id            uint
		setupMocks    func(*mocks.LeaveRequestRepository)
		expectedError string
	}{
		{
			name: "successful delete pending request",
			id:   1,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(pendingLeaveRequest, nil)
				lrRepo.On("Delete", ctx, uint(1)).Return(nil)
			},
			expectedError: "",
		},
		{
			name: "leave request not found",
			id:   999,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedError: "failed to get leave request for deletion:",
		},
		{
			name: "cannot delete non-pending request",
			id:   1,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(approvedLeaveRequest, nil)
			},
			expectedError: "cannot delete leave request with status: Approved",
		},
		{
			name: "repository delete error",
			id:   1,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository) {
				lrRepo.On("GetByID", ctx, uint(1)).Return(pendingLeaveRequest, nil)
				lrRepo.On("Delete", ctx, uint(1)).Return(repoError)
			},
			expectedError: "failed to delete leave request:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			err := useCase.Delete(ctx, tt.id)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_GetByEmployeeUserID(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}
	filters := map[string]interface{}{"status": "Waiting Approval"}

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	mockLeaveRequest := &domain.LeaveRequest{
		ID:         1,
		EmployeeID: 1,
		Employee:   *mockEmployee,
		LeaveType:  enums.AnnualLeave,
		StartDate:  time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC),
		EndDate:    time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC),
		Duration:   2,
		Status:     domain.LeaveStatusPending,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	mockLeaveRequests := []*domain.LeaveRequest{mockLeaveRequest}
	var mockTotalItems int64 = 1

	expectedResponseDTO := &dtoleave.LeaveRequestResponseDTO{
		ID:           1,
		EmployeeID:   1,
		EmployeeName: "John Doe",
		PositionName: "Software Engineer",
		LeaveType:    string(enums.AnnualLeave),
		StartDate:    "2023-12-25",
		EndDate:      "2023-12-26",
		Status:       "Waiting Approval",
		CreatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    now.Format("2006-01-02T15:04:05Z07:00"),
	}

	expectedSuccessResponseData := &dtoleave.LeaveRequestListResponseData{
		Items: []*dtoleave.LeaveRequestResponseDTO{expectedResponseDTO},
		Pagination: domain.Pagination{
			TotalItems:  mockTotalItems,
			TotalPages:  1,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: false,
			HasPrevPage: false,
		},
	}

	repoError := errors.New("repository error")

	tests := []struct {
		name           string
		userID         uint
		filters        map[string]interface{}
		pagination     domain.PaginationParams
		setupMocks     func(*mocks.LeaveRequestRepository, *mocks.EmployeeRepository)
		expectedResult *dtoleave.LeaveRequestListResponseData
		expectedError  string
	}{
		{
			name:       "successful get by employee user ID",
			userID:     1,
			filters:    filters,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByUserID", ctx, uint(1)).Return(mockEmployee, nil)
				lrRepo.On("GetByEmployeeID", ctx, uint(1), paginationParams).Return(mockLeaveRequests, mockTotalItems, nil)
			},
			expectedResult: expectedSuccessResponseData,
			expectedError:  "",
		},
		{
			name:       "employee not found for user ID",
			userID:     999,
			filters:    filters,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByUserID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedResult: nil,
			expectedError:  "failed to get employee for user ID 999:",
		},
		{
			name:       "get leave requests repository error",
			userID:     1,
			filters:    filters,
			pagination: paginationParams,
			setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByUserID", ctx, uint(1)).Return(mockEmployee, nil)
				lrRepo.On("GetByEmployeeID", ctx, uint(1), paginationParams).Return(nil, int64(0), repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to get leave requests for employee ID 1:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo, mockEmployeeRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.GetByEmployeeUserID(ctx, tt.userID, tt.filters, tt.pagination)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_GetEmployeeByUserID(t *testing.T) {
	ctx := context.Background()

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}

	repoError := errors.New("repository get employee failed")

	tests := []struct {
		name           string
		userID         uint
		setupMocks     func(*mocks.EmployeeRepository)
		expectedResult *domain.Employee
		expectedError  string
	}{
		{
			name:   "successful get employee by user ID",
			userID: 1,
			setupMocks: func(empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByUserID", ctx, uint(1)).Return(mockEmployee, nil)
			},
			expectedResult: mockEmployee,
			expectedError:  "",
		},
		{
			name:   "employee not found",
			userID: 999,
			setupMocks: func(empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByUserID", ctx, uint(999)).Return(nil, gorm.ErrRecordNotFound)
			},
			expectedResult: nil,
			expectedError:  "failed to get employee for user ID 999:",
		},
		{
			name:   "repository error",
			userID: 1,
			setupMocks: func(empRepo *mocks.EmployeeRepository) {
				empRepo.On("GetByUserID", ctx, uint(1)).Return(nil, repoError)
			},
			expectedResult: nil,
			expectedError:  "failed to get employee for user ID 1:",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockEmployeeRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			result, err := useCase.GetEmployeeByUserID(ctx, tt.userID)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedResult, result)
			}

			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}

func TestLeaveRequestUseCase_CreateWithFile(t *testing.T) {
	ctx := context.Background()
	now := time.Now()
	startDate := time.Date(2023, 12, 25, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(2023, 12, 26, 0, 0, 0, 0, time.UTC)

	lastName := "Doe"
	mockEmployee := &domain.Employee{
		ID:           1,
		FirstName:    "John",
		LastName:     &lastName,
		PositionName: "Software Engineer",
	}
	tests := []struct {
		name          string
		leaveRequest  *domain.LeaveRequest
		file          *multipart.FileHeader
		setupMocks    func(*mocks.LeaveRequestRepository, *mocks.EmployeeRepository)
		expectedError string
	}{{
		name: "file upload not tested due to supabase complexity",
		leaveRequest: &domain.LeaveRequest{
			EmployeeID: 1,
			LeaveType:  enums.AnnualLeave,
			StartDate:  startDate,
			EndDate:    endDate,
			Duration:   2,
		},
		file: nil, // Skip file upload tests for now
		setupMocks: func(lrRepo *mocks.LeaveRequestRepository, empRepo *mocks.EmployeeRepository) {
			empRepo.On("GetByID", ctx, uint(1)).Return(mockEmployee, nil)
			lrRepo.On("Create", ctx, mock.AnythingOfType("*domain.LeaveRequest")).Return(nil)

			// Create a leave request with proper employee data
			leaveRequestWithEmployee := &domain.LeaveRequest{
				ID:         1,
				EmployeeID: 1,
				Employee:   *mockEmployee, // Properly set the employee
				LeaveType:  enums.AnnualLeave,
				StartDate:  startDate,
				EndDate:    endDate,
				Duration:   2,
				Status:     domain.LeaveStatusPending,
				CreatedAt:  now,
				UpdatedAt:  now,
			}
			lrRepo.On("GetByID", ctx, uint(1)).Return(leaveRequestWithEmployee, nil)
		},
		expectedError: "",
	},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockLeaveRequestRepo := new(mocks.LeaveRequestRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockAttendanceRepo := new(mocks.AttendanceRepository)

			tt.setupMocks(mockLeaveRequestRepo, mockEmployeeRepo)

			useCase := NewLeaveRequestUseCase(mockLeaveRequestRepo, mockEmployeeRepo, mockAttendanceRepo, nil)
			_, err := useCase.Create(ctx, tt.leaveRequest, tt.file)

			if tt.expectedError != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)
			} else {
				assert.NoError(t, err)
			}

			mockLeaveRequestRepo.AssertExpectations(t)
			mockEmployeeRepo.AssertExpectations(t)
		})
	}
}
