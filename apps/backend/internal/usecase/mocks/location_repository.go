package mocks

import (
	"context"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/stretchr/testify/mock"
)

type LocationRepository struct {
	mock.Mock
}

func (_m *LocationRepository) Create(ctx context.Context, location *domain.Location) (*domain.Location, error) {
	ret := _m.Called(ctx, location)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, *domain.Location) *domain.Location); ok {
		r0 = rf(ctx, location)
	} else {
		r0 = ret.Get(0).(*domain.Location)
	}

	return r0, ret.Error(1)
}

func (_m *LocationRepository) List(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.Location, int64, error) {
	ret := _m.Called(ctx, paginationParams)

	var r0 []*domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, domain.PaginationParams) []*domain.Location); ok {
		r0 = rf(ctx, paginationParams)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*domain.Location)
		}
	}

	var r1 int64
	if rf, ok := ret.Get(1).(func(context.Context, domain.PaginationParams) int64); ok {
		r1 = rf(ctx, paginationParams)
	} else {
		r1 = ret.Get(1).(int64)
	}

	var r2 error
	if rf, ok := ret.Get(2).(func(context.Context, domain.PaginationParams) error); ok {
		r2 = rf(ctx, paginationParams)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

func (_m *LocationRepository) GetByID(ctx context.Context, id string) (*domain.Location, error) {
	ret := _m.Called(ctx, id)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, string) *domain.Location); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*domain.Location)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (_m *LocationRepository) Update(ctx context.Context, id string, location *domain.Location) (*domain.Location, error) {
	ret := _m.Called(ctx, id, location)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, string, *domain.Location) *domain.Location); ok {
		r0 = rf(ctx, id, location)
	} else {
		r0 = ret.Get(0).(*domain.Location)
	}

	return r0, ret.Error(1)
}

func (_m *LocationRepository) Delete(ctx context.Context, id string) error {
	ret := _m.Called(ctx, id)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Exists mocks the Exists method of the LocationRepository interface.
func (_m *LocationRepository) Exists(ctx context.Context, id string) (bool, error) {
	ret := _m.Called(ctx, id)

	var r0 bool
	if rf, ok := ret.Get(0).(func(context.Context, string) bool); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, string) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

var _ interfaces.LocationRepository = (*LocationRepository)(nil)
