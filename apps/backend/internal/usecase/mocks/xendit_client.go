package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/stretchr/testify/mock"
)

type XenditClient struct {
	mock.Mock
}

func (m *XenditClient) CreateInvoice(ctx context.Context, req interfaces.CreateInvoiceRequest) (*interfaces.XenditInvoice, error) {
	args := m.Called(ctx, req)
	return args.Get(0).(*interfaces.XenditInvoice), args.Error(1)
}
