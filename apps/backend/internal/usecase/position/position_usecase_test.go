package position

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

func TestPositionUseCase_Create(t *testing.T) {
	repoCreateFailedErr := errors.New("repo create failed")

	tests := []struct {
		name        string
		position    *domain.Position
		repoError   error
		expectedErr error
	}{
		{
			name: "successful position creation",
			position: &domain.Position{
				Name: "Software Engineer",
				HrID: 1,
			},
			repoError:   nil,
			expectedErr: nil,
		},
		{
			name: "repository error during creation",
			position: &domain.Position{
				Name: "Software Engineer",
				HrID: 1,
			},
			repoError:   repoCreateFailedErr,
			expectedErr: repoCreateFailedErr,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.PositionRepository)
			uc := NewPositionUseCase(mockRepo)

			mockRepo.On("Create", mock.Anything, tt.position).Return(tt.repoError)

			result, err := uc.Create(context.Background(), tt.position)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.position.Name, result.Name)
				assert.Equal(t, tt.position.HrID, result.HrID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestPositionUseCase_GetByID(t *testing.T) {
	now := time.Now()
	validPosition := &domain.Position{
		ID:        1,
		Name:      "Software Engineer",
		HrID:      1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	tests := []struct {
		name             string
		id               uint
		repoPosition     *domain.Position
		repoError        error
		expectedPosition *domain.Position
		expectedErr      string
	}{
		{
			name:             "successful position retrieval",
			id:               1,
			repoPosition:     validPosition,
			repoError:        nil,
			expectedPosition: validPosition,
			expectedErr:      "",
		},
		{
			name:             "position not found",
			id:               999,
			repoPosition:     nil,
			repoError:        gorm.ErrRecordNotFound,
			expectedPosition: nil,
			expectedErr:      "position not found",
		},
		{
			name:             "repository error",
			id:               1,
			repoPosition:     nil,
			repoError:        errors.New("database connection error"),
			expectedPosition: nil,
			expectedErr:      "database connection error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.PositionRepository)
			uc := NewPositionUseCase(mockRepo)

			mockRepo.On("GetByID", mock.Anything, tt.id).Return(tt.repoPosition, tt.repoError)

			result, err := uc.GetByID(context.Background(), tt.id)

			if tt.expectedErr != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedPosition.ID, result.ID)
				assert.Equal(t, tt.expectedPosition.Name, result.Name)
				assert.Equal(t, tt.expectedPosition.HrID, result.HrID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestPositionUseCase_GetByHrID(t *testing.T) {
	now := time.Now()
	validPositions := []*domain.Position{
		{
			ID:        1,
			Name:      "Software Engineer",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
		{
			ID:        2,
			Name:      "QA Engineer",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	tests := []struct {
		name              string
		hrID              uint
		repoPositions     []*domain.Position
		repoError         error
		expectedPositions []*domain.Position
		expectedErr       error
	}{
		{
			name:              "successful positions retrieval",
			hrID:              1,
			repoPositions:     validPositions,
			repoError:         nil,
			expectedPositions: validPositions,
			expectedErr:       nil,
		},
		{
			name:              "no positions found",
			hrID:              999,
			repoPositions:     []*domain.Position{},
			repoError:         nil,
			expectedPositions: []*domain.Position{},
			expectedErr:       nil,
		},
		{
			name:              "repository error",
			hrID:              1,
			repoPositions:     nil,
			repoError:         errors.New("database connection error"),
			expectedPositions: nil,
			expectedErr:       errors.New("database connection error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.PositionRepository)
			uc := NewPositionUseCase(mockRepo)

			mockRepo.On("GetByHrID", mock.Anything, tt.hrID).Return(tt.repoPositions, tt.repoError)

			result, err := uc.GetByHrID(context.Background(), tt.hrID)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, len(tt.expectedPositions), len(result))
				if len(result) > 0 {
					assert.Equal(t, tt.expectedPositions[0].Name, result[0].Name)
					assert.Equal(t, tt.expectedPositions[0].HrID, result[0].HrID)
				}
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestPositionUseCase_Update(t *testing.T) {
	now := time.Now()
	existingPosition := &domain.Position{
		ID:        1,
		Name:      "Software Engineer",
		HrID:      1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	updateData := &domain.Position{
		Name: "Senior Software Engineer",
		HrID: 1,
	}

	tests := []struct {
		name             string
		id               uint
		updateData       *domain.Position
		getByIDPosition  *domain.Position
		getByIDError     error
		updateError      error
		expectedPosition *domain.Position
		expectedErr      string
	}{
		{
			name:            "successful position update",
			id:              1,
			updateData:      updateData,
			getByIDPosition: existingPosition,
			getByIDError:    nil,
			updateError:     nil,
			expectedPosition: &domain.Position{
				ID:        1,
				Name:      "Senior Software Engineer",
				HrID:      1,
				CreatedAt: now,
				UpdatedAt: now,
			},
			expectedErr: "",
		},
		{
			name:             "position not found during update",
			id:               999,
			updateData:       updateData,
			getByIDPosition:  nil,
			getByIDError:     gorm.ErrRecordNotFound,
			updateError:      nil,
			expectedPosition: nil,
			expectedErr:      "position not found",
		},
		{
			name:             "repository error during get",
			id:               1,
			updateData:       updateData,
			getByIDPosition:  nil,
			getByIDError:     errors.New("database connection error"),
			updateError:      nil,
			expectedPosition: nil,
			expectedErr:      "database connection error",
		},
		{
			name:             "repository error during update",
			id:               1,
			updateData:       updateData,
			getByIDPosition:  existingPosition,
			getByIDError:     nil,
			updateError:      errors.New("update failed"),
			expectedPosition: nil,
			expectedErr:      "update failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.PositionRepository)
			uc := NewPositionUseCase(mockRepo)

			mockRepo.On("GetByID", mock.Anything, tt.id).Return(tt.getByIDPosition, tt.getByIDError)

			if tt.getByIDError == nil {
				expectedUpdatedPosition := &domain.Position{
					ID:        tt.getByIDPosition.ID,
					Name:      tt.updateData.Name,
					HrID:      tt.updateData.HrID,
					CreatedAt: tt.getByIDPosition.CreatedAt,
					UpdatedAt: tt.getByIDPosition.UpdatedAt,
				}
				mockRepo.On("Update", mock.Anything, expectedUpdatedPosition).Return(tt.updateError)
			}

			result, err := uc.Update(context.Background(), tt.id, tt.updateData)

			if tt.expectedErr != "" {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedErr)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, result)
				assert.Equal(t, tt.expectedPosition.Name, result.Name)
				assert.Equal(t, tt.expectedPosition.HrID, result.HrID)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestPositionUseCase_Delete(t *testing.T) {
	now := time.Now()
	existingPosition := &domain.Position{
		ID:        1,
		Name:      "Software Engineer",
		HrID:      1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	tests := []struct {
		name            string
		id              uint
		getByIDPosition *domain.Position
		getByIDError    error
		deleteError     error
		expectedErr     string
	}{
		{
			name:            "successful position deletion",
			id:              1,
			getByIDPosition: existingPosition,
			getByIDError:    nil,
			deleteError:     nil,
			expectedErr:     "",
		},
		{
			name:            "position not found during deletion",
			id:              999,
			getByIDPosition: nil,
			getByIDError:    gorm.ErrRecordNotFound,
			deleteError:     nil,
			expectedErr:     "position not found",
		},
		{
			name:            "repository error during get",
			id:              1,
			getByIDPosition: nil,
			getByIDError:    errors.New("database connection error"),
			deleteError:     nil,
			expectedErr:     "database connection error",
		},
		{
			name:            "repository error during delete",
			id:              1,
			getByIDPosition: existingPosition,
			getByIDError:    nil,
			deleteError:     errors.New("delete failed"),
			expectedErr:     "delete failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.PositionRepository)
			uc := NewPositionUseCase(mockRepo)

			mockRepo.On("GetByID", mock.Anything, tt.id).Return(tt.getByIDPosition, tt.getByIDError)

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

func TestPositionUseCase_List(t *testing.T) {
	now := time.Now()
	validPositions := []*domain.Position{
		{
			ID:        1,
			Name:      "Software Engineer",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
		{
			ID:        2,
			Name:      "QA Engineer",
			HrID:      1,
			CreatedAt: now,
			UpdatedAt: now,
		},
	}

	tests := []struct {
		name              string
		filters           map[string]interface{}
		repoPositions     []*domain.Position
		repoError         error
		expectedPositions []*domain.Position
		expectedErr       error
	}{
		{
			name:              "successful positions list",
			filters:           map[string]interface{}{"hr_id": 1},
			repoPositions:     validPositions,
			repoError:         nil,
			expectedPositions: validPositions,
			expectedErr:       nil,
		},
		{
			name:              "empty filters",
			filters:           map[string]interface{}{},
			repoPositions:     validPositions,
			repoError:         nil,
			expectedPositions: validPositions,
			expectedErr:       nil,
		},
		{
			name:              "repository error",
			filters:           map[string]interface{}{"hr_id": 1},
			repoPositions:     nil,
			repoError:         errors.New("database connection error"),
			expectedPositions: nil,
			expectedErr:       errors.New("database connection error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(mocks.PositionRepository)
			uc := NewPositionUseCase(mockRepo)

			mockRepo.On("List", mock.Anything, tt.filters).Return(tt.repoPositions, tt.repoError)

			result, err := uc.List(context.Background(), tt.filters)

			if tt.expectedErr != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectedErr, err)
				assert.Nil(t, result)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, len(tt.expectedPositions), len(result))
				if len(result) > 0 {
					assert.Equal(t, tt.expectedPositions[0].Name, result[0].Name)
					assert.Equal(t, tt.expectedPositions[0].HrID, result[0].HrID)
				}
			}

			mockRepo.AssertExpectations(t)
		})
	}
}
