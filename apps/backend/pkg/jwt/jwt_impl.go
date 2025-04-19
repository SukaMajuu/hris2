package jwt

import (
	"fmt"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/golang-jwt/jwt/v5"
)

type jwtService struct {
	secretKey []byte
	duration  time.Duration
}

func NewJWTService(config *config.Config) Service {
	duration, err := time.ParseDuration(config.JWT.Duration)
	if err != nil {
		panic(err)
	}
	return &jwtService{
		secretKey: []byte(config.JWT.SecretKey),
		duration:  duration,
	}
}

func (s *jwtService) GenerateToken(userID uint, role enums.UserRole) (string, error) {
	expirationTime := time.Now().Add(s.duration)
	claims := &CustomClaims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "hris-backend",
			Subject:   fmt.Sprintf("%d", userID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.secretKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

func (s *jwtService) ValidateToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
