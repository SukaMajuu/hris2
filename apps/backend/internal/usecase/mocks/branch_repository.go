package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/stretchr/testify/mock"
)

type BranchRepository struct {
	mock.Mock
}

func (m *BranchRepository) Create(ctx context.Context, branch *domain.Branch) error {
	args := m.Called(ctx, branch)
	return args.Error(0)
}

func (m *BranchRepository) GetByID(ctx context.Context, id uint) (*domain.Branch, error) {
	args := m.Called(ctx, id)
	return args.Get(0).(*domain.Branch), args.Error(1)
}

func (m *BranchRepository) GetByHrID(ctx context.Context, hrID uint) ([]*domain.Branch, error) {
	args := m.Called(ctx, hrID)
	return args.Get(0).([]*domain.Branch), args.Error(1)
}

func (m *BranchRepository) Update(ctx context.Context, branch *domain.Branch) error {
	args := m.Called(ctx, branch)
	return args.Error(0)
}

func (m *BranchRepository) Delete(ctx context.Context, id uint) error {
	args := m.Called(ctx, id)
	return args.Error(0)
}

func (m *BranchRepository) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Branch, error) {
	args := m.Called(ctx, filters)
	return args.Get(0).([]*domain.Branch), args.Error(1)
}
