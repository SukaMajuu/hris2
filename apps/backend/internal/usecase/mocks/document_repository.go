package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

type DocumentRepository struct {
	mock.Mock
}

func (m *DocumentRepository) Create(ctx context.Context, document *domain.Document) error {
	args := m.Called(ctx, document)
	return args.Error(0)
}

func (m *DocumentRepository) GetByID(ctx context.Context, id uint) (*domain.Document, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*domain.Document), args.Error(1)
}

func (m *DocumentRepository) GetByEmployeeID(ctx context.Context, employeeID uint) ([]*domain.Document, error) {
	args := m.Called(ctx, employeeID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*domain.Document), args.Error(1)
}

func (m *DocumentRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}
