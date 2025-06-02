package document

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"testing"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/mocks"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/supabase-community/supabase-go"
	"gorm.io/gorm"
)

func TestGetDocumentsByEmployeeID(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name            string
		employeeID      uint
		mockDocuments   []*domain.Document
		repositoryError error
		expectedError   error
	}{
		{
			name:       "successful get documents by employee ID",
			employeeID: 1,
			mockDocuments: []*domain.Document{
				{
					ID:         1,
					EmployeeID: 1,
					Name:       "doc1.pdf",
					URL:        "https://example.com/doc1.pdf",
					CreatedAt:  now,
					UpdatedAt:  now,
				},
				{
					ID:         2,
					EmployeeID: 1,
					Name:       "doc2.pdf",
					URL:        "https://example.com/doc2.pdf",
					CreatedAt:  now,
					UpdatedAt:  now,
				},
			},
			repositoryError: nil,
			expectedError:   nil,
		},
		{
			name:            "no documents found",
			employeeID:      1,
			mockDocuments:   []*domain.Document{},
			repositoryError: nil,
			expectedError:   nil,
		},
		{
			name:            "database error",
			employeeID:      1,
			mockDocuments:   nil,
			repositoryError: errors.New("database connection error"),
			expectedError:   errors.New("database connection error"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockDocumentRepo := new(mocks.DocumentRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockSupabaseClient := &supabase.Client{}

			uc := NewDocumentUseCase(
				mockDocumentRepo,
				mockEmployeeRepo,
				mockSupabaseClient,
			)

			mockDocumentRepo.On("GetByEmployeeID", mock.Anything, tt.employeeID).
				Return(tt.mockDocuments, tt.repositoryError)

			documents, err := uc.GetDocumentsByEmployeeID(context.Background(), tt.employeeID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError.Error())
				assert.Nil(t, documents)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, documents)
				assert.Equal(t, len(tt.mockDocuments), len(documents))
				if len(tt.mockDocuments) > 0 {
					assert.Equal(t, tt.mockDocuments[0].ID, documents[0].ID)
				}
			}

			mockDocumentRepo.AssertExpectations(t)
		})
	}
}

func TestDeleteDocument(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name             string
		documentID       uint
		mockDocument     *domain.Document
		getDocumentError error
		deleteDBError    error
		expectedError    error
	}{
		{
			name:       "successful document deletion",
			documentID: 1,
			mockDocument: &domain.Document{
				ID:         1,
				EmployeeID: 1,
				Name:       "test.pdf",
				URL:        "https://example.com/test.pdf",
				CreatedAt:  now,
				UpdatedAt:  now,
			},
			getDocumentError: nil,
			deleteDBError:    nil,
			expectedError:    nil,
		},
		{
			name:             "document not found for deletion",
			documentID:       1,
			mockDocument:     nil,
			getDocumentError: gorm.ErrRecordNotFound,
			expectedError:    fmt.Errorf("failed to get document: %w", gorm.ErrRecordNotFound),
		},
		{
			name:       "database deletion error",
			documentID: 1,
			mockDocument: &domain.Document{
				ID:         1,
				EmployeeID: 1,
				Name:       "test.pdf",
				URL:        "https://example.com/test.pdf",
			},
			getDocumentError: nil,
			deleteDBError:    errors.New("database constraint error"),
			expectedError:    fmt.Errorf("failed to delete document from database: %w", errors.New("database constraint error")),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockDocumentRepo := new(mocks.DocumentRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockSupabaseClient := &supabase.Client{}

			uc := NewDocumentUseCase(
				mockDocumentRepo,
				mockEmployeeRepo,
				mockSupabaseClient,
			)

			mockDocumentRepo.On("GetByID", mock.Anything, tt.documentID).
				Return(tt.mockDocument, tt.getDocumentError).Maybe()

			if tt.getDocumentError == nil && tt.mockDocument != nil {
				mockDocumentRepo.On("Delete", mock.Anything, tt.documentID).
					Return(tt.deleteDBError).Maybe()
			}

			err := uc.DeleteDocument(context.Background(), tt.documentID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError.Error())
			} else {
				assert.NoError(t, err)
			}

			mockDocumentRepo.AssertExpectations(t)
		})
	}
}

func TestGenerateFileName(t *testing.T) {
	now := time.Now()
	lastName := "Doe"

	tests := []struct {
		name         string
		employee     *domain.Employee
		originalFile string
		expectedBase string
	}{
		{
			name: "employee with last name",
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  &lastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
			originalFile: "resume.pdf",
			expectedBase: "John_Doe_Documents_",
		},
		{
			name: "employee without last name",
			employee: &domain.Employee{
				ID:        1,
				FirstName: "John",
				LastName:  nil,
				CreatedAt: now,
				UpdatedAt: now,
			},
			originalFile: "resume.pdf",
			expectedBase: "John__Documents_",
		},
		{
			name: "employee with spaces in name",
			employee: &domain.Employee{
				ID:        1,
				FirstName: "Mary Jane",
				LastName:  &lastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
			originalFile: "document.docx",
			expectedBase: "Mary_Jane_Doe_Documents_",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockDocumentRepo := new(mocks.DocumentRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockSupabaseClient := &supabase.Client{}

			uc := NewDocumentUseCase(
				mockDocumentRepo,
				mockEmployeeRepo,
				mockSupabaseClient,
			)

			fileName := uc.generateFileName(tt.employee, tt.originalFile)

			assert.True(t, strings.HasPrefix(fileName, tt.expectedBase),
				fmt.Sprintf("Expected filename to start with %s, got %s", tt.expectedBase, fileName))

			assert.True(t, strings.HasSuffix(fileName, ".pdf") || strings.HasSuffix(fileName, ".docx"),
				fmt.Sprintf("Expected filename to have proper extension, got %s", fileName))

			parts := strings.Split(fileName, "_")
			assert.True(t, len(parts) >= 3, "Expected filename to have at least 3 parts separated by underscores")

			lastPart := parts[len(parts)-1]
			numberPart := strings.Split(lastPart, ".")[0]
			assert.Equal(t, 15, len(numberPart), "Expected 15-digit number in filename")
		})
	}
}

func TestGetDocumentsByUserID(t *testing.T) {
	now := time.Now()
	lastName := "Doe"

	tests := []struct {
		name                string
		userID              uint
		mockEmployee        *domain.Employee
		mockDocuments       []*domain.Document
		employeeRepoError   error
		documentRepoError   error
		expectedError       error
	}{
		{
			name:   "successful get documents by user ID",
			userID: 1,
			mockEmployee: &domain.Employee{
				ID:        1,
				UserID:    1,
				FirstName: "John",
				LastName:  &lastName,
				CreatedAt: now,
				UpdatedAt: now,
			},
			mockDocuments: []*domain.Document{
				{
					ID:         1,
					EmployeeID: 1,
					Name:       "doc1.pdf",
					URL:        "https://example.com/doc1.pdf",
					CreatedAt:  now,
					UpdatedAt:  now,
				},
			},
			employeeRepoError: nil,
			documentRepoError: nil,
			expectedError:     nil,
		},
		{
			name:              "employee not found for user ID",
			userID:            1,
			mockEmployee:      nil,
			employeeRepoError: gorm.ErrRecordNotFound,
			expectedError:     fmt.Errorf("failed to get employee for user ID 1: %w", gorm.ErrRecordNotFound),
		},
		{
			name:   "documents repo error",
			userID: 1,
			mockEmployee: &domain.Employee{
				ID:        1,
				UserID:    1,
				FirstName: "John",
				LastName:  &lastName,
			},
			mockDocuments:     nil,
			employeeRepoError: nil,
			documentRepoError: errors.New("database connection error"),
			expectedError:     fmt.Errorf("failed to get documents for employee ID 1: %w", errors.New("database connection error")),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockDocumentRepo := new(mocks.DocumentRepository)
			mockEmployeeRepo := new(mocks.EmployeeRepository)
			mockSupabaseClient := &supabase.Client{}

			uc := NewDocumentUseCase(
				mockDocumentRepo,
				mockEmployeeRepo,
				mockSupabaseClient,
			)

			mockEmployeeRepo.On("GetByUserID", mock.Anything, tt.userID).
				Return(tt.mockEmployee, tt.employeeRepoError).Maybe()

			if tt.employeeRepoError == nil && tt.mockEmployee != nil {
				mockDocumentRepo.On("GetByEmployeeID", mock.Anything, tt.mockEmployee.ID).
					Return(tt.mockDocuments, tt.documentRepoError).Maybe()
			}

			documents, err := uc.GetDocumentsByUserID(context.Background(), tt.userID)

			if tt.expectedError != nil {
				assert.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError.Error())
				assert.Nil(t, documents)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, documents)
				assert.Equal(t, len(tt.mockDocuments), len(documents))
				if len(tt.mockDocuments) > 0 {
					assert.Equal(t, tt.mockDocuments[0].ID, documents[0].ID)
				}
			}

			mockEmployeeRepo.AssertExpectations(t)
			mockDocumentRepo.AssertExpectations(t)
		})
	}
}
