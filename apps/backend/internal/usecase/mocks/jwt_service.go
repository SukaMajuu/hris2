package mocks

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	"github.com/stretchr/testify/mock"
)

type JWTService struct {
	mock.Mock
}

func (_m *JWTService) GenerateToken(userID uint, userEmail string, role enums.UserRole) (string, string, string, error) {
	ret := _m.Called(userID, role)

	var r0 string
	if rf, ok := ret.Get(0).(func(uint, enums.UserRole) string); ok {
		r0 = rf(userID, role)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(string)
		}
	}

	var r1 string
	if rf, ok := ret.Get(1).(func(uint, enums.UserRole) string); ok {
		r1 = rf(userID, role)
	} else {
		if ret.Get(1) != nil {
			r1 = ret.Get(1).(string)
		}
	}

	var r2 string
	if rf, ok := ret.Get(2).(func(uint, enums.UserRole) string); ok {
		r2 = rf(userID, role)
	} else {
		if ret.Get(2) != nil {
			r2 = ret.Get(2).(string)
		}
	}

	var r3 error
	if rf, ok := ret.Get(3).(func(uint, enums.UserRole) error); ok {
		r3 = rf(userID, role)
	} else {
		if ret.Get(3) != nil {
			r3 = ret.Get(3).(error)
		}
	}

	return r0, r1, r2, r3
}

func (_m *JWTService) ValidateToken(tokenString string) (*jwt.CustomClaims, error) {
	ret := _m.Called(tokenString)

	var r0 *jwt.CustomClaims
	if rf, ok := ret.Get(0).(func(string) *jwt.CustomClaims); ok {
		r0 = rf(tokenString)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*jwt.CustomClaims)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(tokenString)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func NewJWTService() *JWTService {
	return &JWTService{}
}

var _ jwt.Service = (*JWTService)(nil)

func (_m *JWTService) CompareTokenHash(token string, hash string) error {
	ret := _m.Called(token, hash)

	var r0 error
	if rf, ok := ret.Get(0).(func(string, string) error); ok {
		r0 = rf(token, hash)
	} else {
		err := ret.Error(0)
		if err != nil {
			r0 = err
		}
	}

	return r0
}

func (_m *JWTService) HashToken(token string) (string, error) {
	ret := _m.Called(token)

	var r0 string
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (string, error)); ok {
		r0, r1 = rf(token)
	} else {
		r0 = ret.Get(0).(string)
		if ret.Get(1) != nil {
			r1 = ret.Error(1)
		}
	}

	return r0, r1
}
