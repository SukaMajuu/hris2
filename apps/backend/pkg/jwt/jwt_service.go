package jwt

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID    uint           `json:"user_id"`
	Role      enums.UserRole `json:"role"`
	TokenType string         `json:"token_type"`
	jwt.RegisteredClaims
}

type Service interface {
	GenerateToken(userID uint, role enums.UserRole) (string, string, error)
	ValidateToken(tokenString string) (*CustomClaims, error)
}
