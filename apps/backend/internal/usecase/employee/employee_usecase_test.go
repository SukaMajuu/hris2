package employee

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoemployee "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
)

func TestEmployeeUseCase_List(t *testing.T) {
	ctx := context.Background()
	filters := map[string]interface{}{"status": "active"}
	paginationParams := domain.PaginationParams{Page: 1, PageSize: 10}

	mockDomainEmp := &domain.Employee{
		ID:        1,
		FirstName: "John",
		User:      domain.User{Phone: "12345"},
		Branch:    &domain.Branch{Name: "Main Branch"},
		Position:  domain.Position{Name: "Developer"},
	}
	mockDomainEmployees := []*domain.Employee{mockDomainEmp}
	var mockTotalItems int64 = 1

	var expectedGenderDTO *string
	if mockDomainEmp.Gender != nil {
		genderStr := string(*mockDomainEmp.Gender)
		expectedGenderDTO = &genderStr
	}

	expectedEmployeeDTO := &dtoemployee.EmployeeResponseDTO{
		ID:               mockDomainEmp.ID,
		FirstName:        mockDomainEmp.FirstName,
		LastName:         mockDomainEmp.LastName,
		Gender:           expectedGenderDTO,
		Phone:            &mockDomainEmp.User.Phone,
		PositionName:     mockDomainEmp.Position.Name,
		Grade:            mockDomainEmp.Grade,
		EmploymentStatus: mockDomainEmp.EmploymentStatus,
	}

	if mockDomainEmp.Branch != nil {
		expectedEmployeeDTO.BranchName = &mockDomainEmp.Branch.Name
	}

	expectedSuccessResponseData := &domain.EmployeeListResponseData{
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
		expectedResponse   *domain.EmployeeListResponseData
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
			expectedResponse: &domain.EmployeeListResponseData{
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
			uc := NewEmployeeUseCase(mockEmployeeRepo, mockAuthRepo)

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
