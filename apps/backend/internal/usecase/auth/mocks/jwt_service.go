package mocks

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	"github.com/stretchr/testify/mock"
)

type JWTService struct {
	mock.Mock
}

func (_m *JWTService) GenerateToken(userID uint, role enums.UserRole) (string, string, error) {
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

	var r2 error
	if rf, ok := ret.Get(2).(func(uint, enums.UserRole) error); ok {
		r2 = rf(userID, role)
	} else {
		if ret.Get(2) != nil {
			r2 = ret.Get(2).(error)
		}
	}

	return r0, r1, r2
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
