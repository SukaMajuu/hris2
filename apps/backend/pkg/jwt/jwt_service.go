package jwt

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID    uint           `json:"user_id"`
	Email     string         `json:"email"`
	Role      enums.UserRole `json:"role"`
	TokenType enums.TokenType `json:"token_type"`
	jwt.RegisteredClaims
}

type Service interface {
	GenerateToken(userID uint, userEmail string, role enums.UserRole) (accessToken string, refreshToken string, refreshTokenHash string, err error)
	ValidateToken(tokenString string) (*CustomClaims, error)
	HashToken(token string) (string, error)
	CompareTokenHash(token, hash string) error
}
