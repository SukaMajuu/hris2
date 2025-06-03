package branch

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

func TestBranchUseCase_Create(t *testing.T) {
	repoCreateFailedErr := errors.New("repo create failed")

	tests := []struct {
		name        string
		branch      *domain.Branch
		repoError   error
		expectedErr error
	}{
		{
			name: "successful branch creation",
			branch: &domain.Branch{
				Name: "Jakarta Office",
				HrID: 1,
			},
			repoError:   nil,
			expectedErr: nil,
		},
		{
			name: "repository error during creation",
			branch: &domain.Branch{
				Name: "Jakarta Office",
				HrID: 1,
			},
			repoError:   repoCreateFailedErr,
			expectedErr: repoCreateFailedErr,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.BranchRepository)
			uc := NewBranchUseCase(mockRepo)

			mockRepo.On("Create", mock.Anything, tt.branch).Return(tt.repoError)

			result, err := uc.Create(context.Background(), tt.branch)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.branch.Name, result.Name)
				assert.Equal(t, tt.branch.HrID, result.HrID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestBranchUseCase_GetByID(t *testing.T) {
	now := time.Now()
	validBranch := &domain.Branch{
		ID:        1,
		Name:      "Jakarta Office",
		HrID:      1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	tests := []struct {
		name           string
		id             uint
		repoBranch     *domain.Branch
		repoError      error
		expectedBranch *domain.Branch
		expectedErr    string
	}{
		{
			name:           "successful branch retrieval",
			id:             1,
			repoBranch:     validBranch,
			repoError:      nil,
			expectedBranch: validBranch,
			expectedErr:    "",
		},
		{
			name:           "branch not found",
			id:             999,
			repoBranch:     nil,
			repoError:      gorm.ErrRecordNotFound,
			expectedBranch: nil,
			expectedErr:    "branch not found",
		},
		{
			name:           "repository error",
			id:             1,
			repoBranch:     nil,
			repoError:      errors.New("database connection error"),
			expectedBranch: nil,
			expectedErr:    "database connection error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.BranchRepository)
			uc := NewBranchUseCase(mockRepo)

			mockRepo.On("GetByID", mock.Anything, tt.id).Return(tt.repoBranch, tt.repoError)

			result, err := uc.GetByID(context.Background(), tt.id)

			if tt.expectedErr != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedBranch.ID, result.ID)
				assert.Equal(t, tt.expectedBranch.Name, result.Name)
				assert.Equal(t, tt.expectedBranch.HrID, result.HrID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestBranchUseCase_GetByHrID(t *testing.T) {
	now := time.Now()
	validBranches := []*domain.Branch{
		{
			ID:        1,
			Name:      "Jakarta Office",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
		{
			ID:        2,
			Name:      "Bandung Office",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	tests := []struct {
		name             string
		hrID             uint
		repoBranches     []*domain.Branch
		repoError        error
		expectedBranches []*domain.Branch
		expectedErr      error
	}{
		{
			name:             "successful branches retrieval",
			hrID:             1,
			repoBranches:     validBranches,
			repoError:        nil,
			expectedBranches: validBranches,
			expectedErr:      nil,
		},
		{
			name:             "no branches found",
			hrID:             999,
			repoBranches:     []*domain.Branch{},
			repoError:        nil,
			expectedBranches: []*domain.Branch{},
			expectedErr:      nil,
		},
		{
			name:             "repository error",
			hrID:             1,
			repoBranches:     nil,
			repoError:        errors.New("database connection error"),
			expectedBranches: nil,
			expectedErr:      errors.New("database connection error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.BranchRepository)
			uc := NewBranchUseCase(mockRepo)

			mockRepo.On("GetByHrID", mock.Anything, tt.hrID).Return(tt.repoBranches, tt.repoError)

			result, err := uc.GetByHrID(context.Background(), tt.hrID)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, len(tt.expectedBranches), len(result))
				if len(result) > 0 {
					assert.Equal(t, tt.expectedBranches[0].Name, result[0].Name)
					assert.Equal(t, tt.expectedBranches[0].HrID, result[0].HrID)
				}
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestBranchUseCase_Update(t *testing.T) {
	now := time.Now()
	existingBranch := &domain.Branch{
		ID:        1,
		Name:      "Jakarta Office",
		HrID:      1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	updateData := &domain.Branch{
		Name: "Jakarta Main Office",
		HrID: 1,
	}

	tests := []struct {
		name           string
		id             uint
		updateData     *domain.Branch
		getByIDBranch  *domain.Branch
		getByIDError   error
		updateError    error
		expectedBranch *domain.Branch
		expectedErr    string
	}{
		{
			name:          "successful branch update",
			id:            1,
			updateData:    updateData,
			getByIDBranch: existingBranch,
			getByIDError:  nil,
			updateError:   nil,
			expectedBranch: &domain.Branch{
				ID:        1,
				Name:      "Jakarta Main Office",
				HrID:      1,
				CreatedAt: now,
				UpdatedAt: now,
			},
			expectedErr: "",
		},
		{
			name:           "branch not found during update",
			id:             999,
			updateData:     updateData,
			getByIDBranch:  nil,
			getByIDError:   gorm.ErrRecordNotFound,
			updateError:    nil,
			expectedBranch: nil,
			expectedErr:    "branch not found",
		},
		{
			name:           "repository error during get",
			id:             1,
			updateData:     updateData,
			getByIDBranch:  nil,
			getByIDError:   errors.New("database connection error"),
			updateError:    nil,
			expectedBranch: nil,
			expectedErr:    "database connection error",
		},
		{
			name:           "repository error during update",
			id:             1,
			updateData:     updateData,
			getByIDBranch:  existingBranch,
			getByIDError:   nil,
			updateError:    errors.New("update failed"),
			expectedBranch: nil,
			expectedErr:    "update failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.BranchRepository)
			uc := NewBranchUseCase(mockRepo)

			mockRepo.On("GetByID", mock.Anything, tt.id).Return(tt.getByIDBranch, tt.getByIDError)

			if tt.getByIDError == nil {
				expectedUpdatedBranch := &domain.Branch{
					ID:        tt.getByIDBranch.ID,
					Name:      tt.updateData.Name,
					HrID:      tt.updateData.HrID,
					CreatedAt: tt.getByIDBranch.CreatedAt,
					UpdatedAt: tt.getByIDBranch.UpdatedAt,
				}
				mockRepo.On("Update", mock.Anything, expectedUpdatedBranch).Return(tt.updateError)
			}

			result, err := uc.Update(context.Background(), tt.id, tt.updateData)

			if tt.expectedErr != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedBranch.Name, result.Name)
				assert.Equal(t, tt.expectedBranch.HrID, result.HrID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestBranchUseCase_Delete(t *testing.T) {
	now := time.Now()
	existingBranch := &domain.Branch{
		ID:        1,
		Name:      "Jakarta Office",
		HrID:      1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	tests := []struct {
		name          string
		id            uint
		getByIDBranch *domain.Branch
		getByIDError  error
		deleteError   error
		expectedErr   string
	}{
		{
			name:          "successful branch deletion",
			id:            1,
			getByIDBranch: existingBranch,
			getByIDError:  nil,
			deleteError:   nil,
			expectedErr:   "",
		},
		{
			name:          "branch not found during deletion",
			id:            999,
			getByIDBranch: nil,
			getByIDError:  gorm.ErrRecordNotFound,
			deleteError:   nil,
			expectedErr:   "branch not found",
		},
		{
			name:          "repository error during get",
			id:            1,
			getByIDBranch: nil,
			getByIDError:  errors.New("database connection error"),
			deleteError:   nil,
			expectedErr:   "database connection error",
		},
		{
			name:          "repository error during delete",
			id:            1,
			getByIDBranch: existingBranch,
			getByIDError:  nil,
			deleteError:   errors.New("delete failed"),
			expectedErr:   "delete failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.BranchRepository)
			uc := NewBranchUseCase(mockRepo)

			mockRepo.On("GetByID", mock.Anything, tt.id).Return(tt.getByIDBranch, tt.getByIDError)

			if tt.getByIDError == nil {
				mockRepo.On("Delete", mock.Anything, tt.id).Return(tt.deleteError)
			}

			err := uc.Delete(context.Background(), tt.id)

			if tt.expectedErr != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr)
			} else {
				assert.NoError(t, err)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestBranchUseCase_List(t *testing.T) {
	now := time.Now()
	validBranches := []*domain.Branch{
		{
			ID:        1,
			Name:      "Jakarta Office",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
		{
			ID:        2,
			Name:      "Bandung Office",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	tests := []struct {
		name             string
		filters          map[string]interface{}
		repoBranches     []*domain.Branch
		repoError        error
		expectedBranches []*domain.Branch
		expectedErr      error
	}{
		{
			name:             "successful branches list",
			filters:          map[string]interface{}{"hr_id": 1},
			repoBranches:     validBranches,
			repoError:        nil,
			expectedBranches: validBranches,
			expectedErr:      nil,
		},
		{
			name:             "empty filters",
			filters:          map[string]interface{}{},
			repoBranches:     validBranches,
			repoError:        nil,
			expectedBranches: validBranches,
			expectedErr:      nil,
		},
		{
			name:             "repository error",
			filters:          map[string]interface{}{"hr_id": 1},
			repoBranches:     nil,
			repoError:        errors.New("database connection error"),
			expectedBranches: nil,
			expectedErr:      errors.New("database connection error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.BranchRepository)
			uc := NewBranchUseCase(mockRepo)

			mockRepo.On("List", mock.Anything, tt.filters).Return(tt.repoBranches, tt.repoError)

			result, err := uc.List(context.Background(), tt.filters)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, len(tt.expectedBranches), len(result))
				if len(result) > 0 {
					assert.Equal(t, tt.expectedBranches[0].Name, result[0].Name)
					assert.Equal(t, tt.expectedBranches[0].HrID, result[0].HrID)
				}
			}

			mockRepo.AssertExpectations(t)
		})
	}
}
