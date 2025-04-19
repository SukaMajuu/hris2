package jwt

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID uint       `json:"user_id"`
	Role   enums.UserRole `json:"user_role"`
	jwt.RegisteredClaims
}

type Service interface {
	GenerateToken(userID uint, role enums.UserRole) (string, error)
	ValidateToken(tokenString string) (*CustomClaims, error)
}
