package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/stretchr/testify/mock"
)

type MidtransClient struct {
	mock.Mock
}

func (m *MidtransClient) CreateSnapTransaction(ctx context.Context, req interfaces.MidtransSnapRequest) (*interfaces.MidtransSnapResponse, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(*interfaces.MidtransSnapResponse), args.Error(1)
}

func (m *MidtransClient) GetTransactionStatus(ctx context.Context, orderID string) (*interfaces.MidtransTransactionStatus, error) {
	args := m.Called(ctx, orderID)
	return args.Get(0).(*interfaces.MidtransTransactionStatus), args.Error(1)
}
