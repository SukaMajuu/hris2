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

func (_m *LocationRepository) GetByID(ctx context.Context, id uint) (*domain.Location, error) {
	ret := _m.Called(ctx, id)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, uint) *domain.Location); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*domain.Location)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, uint) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (_m *LocationRepository) Update(ctx context.Context, id uint, location *domain.Location) (*domain.Location, error) {
	ret := _m.Called(ctx, id, location)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, uint, *domain.Location) *domain.Location); ok {
		r0 = rf(ctx, id, location)
	} else {
		r0 = ret.Get(0).(*domain.Location)
	}

	return r0, ret.Error(1)
}

func (_m *LocationRepository) Delete(ctx context.Context, id uint) error {
	ret := _m.Called(ctx, id)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uint) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// Exists mocks the Exists method of the LocationRepository interface.
func (_m *LocationRepository) Exists(ctx context.Context, id uint) (bool, error) {
	ret := _m.Called(ctx, id)

	var r0 bool
	if rf, ok := ret.Get(0).(func(context.Context, uint) bool); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, uint) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (_m *LocationRepository) ListByUser(ctx context.Context, userID uint, paginationParams domain.PaginationParams) ([]*domain.Location, int64, error) {
	ret := _m.Called(ctx, userID, paginationParams)

	var r0 []*domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, uint, domain.PaginationParams) []*domain.Location); ok {
		r0 = rf(ctx, userID, paginationParams)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*domain.Location)
		}
	}

	var r1 int64
	if rf, ok := ret.Get(1).(func(context.Context, uint, domain.PaginationParams) int64); ok {
		r1 = rf(ctx, userID, paginationParams)
	} else {
		r1 = ret.Get(1).(int64)
	}

	var r2 error
	if rf, ok := ret.Get(2).(func(context.Context, uint, domain.PaginationParams) error); ok {
		r2 = rf(ctx, userID, paginationParams)
	} else {
		r2 = ret.Error(2)
	}

	return r0, r1, r2
}

func (_m *LocationRepository) GetByIDAndUser(ctx context.Context, id uint, userID uint) (*domain.Location, error) {
	ret := _m.Called(ctx, id, userID)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, uint, uint) *domain.Location); ok {
		r0 = rf(ctx, id, userID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*domain.Location)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, uint, uint) error); ok {
		r1 = rf(ctx, id, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (_m *LocationRepository) UpdateByUser(ctx context.Context, id uint, userID uint, location *domain.Location) (*domain.Location, error) {
	ret := _m.Called(ctx, id, userID, location)

	var r0 *domain.Location
	if rf, ok := ret.Get(0).(func(context.Context, uint, uint, *domain.Location) *domain.Location); ok {
		r0 = rf(ctx, id, userID, location)
	} else {
		r0 = ret.Get(0).(*domain.Location)
	}

	return r0, ret.Error(1)
}

func (_m *LocationRepository) DeleteByUser(ctx context.Context, id uint, userID uint) error {
	ret := _m.Called(ctx, id, userID)

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uint, uint) error); ok {
		r0 = rf(ctx, id, userID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

func (_m *LocationRepository) ExistsByUser(ctx context.Context, id uint, userID uint) (bool, error) {
	ret := _m.Called(ctx, id, userID)

	var r0 bool
	if rf, ok := ret.Get(0).(func(context.Context, uint, uint) bool); ok {
		r0 = rf(ctx, id, userID)
	} else {
		r0 = ret.Get(0).(bool)
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(context.Context, uint, uint) error); ok {
		r1 = rf(ctx, id, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

var _ interfaces.LocationRepository = (*LocationRepository)(nil)
