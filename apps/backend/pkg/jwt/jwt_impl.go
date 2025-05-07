package jwt

import (
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/golang-jwt/jwt/v5"
)

type jwtService struct {
	secretKey        []byte
	accessDuration   time.Duration
	refreshDuration  time.Duration
}

// Ensure jwtService implements Service
var _ Service = (*jwtService)(nil)

func NewJWTService(config *config.Config) Service {
	accessDuration, err := time.ParseDuration(config.JWT.AccessDuration)
	if err != nil {
		panic(fmt.Sprintf("invalid JWT access duration: %v", err))
	}
	refreshDuration, err := time.ParseDuration(config.JWT.RefreshDuration)
	if err != nil {
		panic(fmt.Sprintf("invalid JWT refresh duration: %v", err))
	}
	return &jwtService{
		secretKey:        []byte(config.JWT.SecretKey),
		accessDuration:   accessDuration,
		refreshDuration:  refreshDuration,
	}
}

// GenerateToken creates new access and refresh tokens, and the hash of the refresh token.
func (s *jwtService) GenerateToken(userID uint, role enums.UserRole) (string, string, string, error) {
	accessToken, err := s.generateToken(userID, role, s.accessDuration, enums.TokenTypeAccess)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateToken(userID, role, s.refreshDuration, enums.TokenTypeRefresh)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Hash the refresh token before returning
	refreshTokenHash, err := s.HashToken(refreshToken)
	if err != nil {
		return "", "", "", fmt.Errorf("failed to hash refresh token: %w", err)
	}

	return accessToken, refreshToken, refreshTokenHash, nil
}

// generateToken is an internal helper
func (s *jwtService) generateToken(userID uint, role enums.UserRole, duration time.Duration, tokenType enums.TokenType) (string, error) {
	expirationTime := time.Now().Add(duration)
	claims := &CustomClaims{
		UserID:    userID,
		Role:      role,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "hris-backend", // Consider making this configurable
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

// ValidateToken parses and validates a JWT string.
func (s *jwtService) ValidateToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})

	if err != nil {
		// Handle specific JWT errors like expiration
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, domain.ErrTokenExpired
		}
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, domain.ErrInvalidToken
}

// HashToken generates a SHA-256 hash for a given token string.
func (s *jwtService) HashToken(token string) (string, error) {
	hasher := sha256.New()
	_, err := hasher.Write([]byte(token))
	if err != nil {
		return "", fmt.Errorf("failed to write token to hasher: %w", err)
	}
	hashBytes := hasher.Sum(nil)
	return hex.EncodeToString(hashBytes), nil
}

// CompareTokenHash compares a raw token string with its stored SHA-256 hash.
func (s *jwtService) CompareTokenHash(token, storedHashHex string) error {
	incomingHash, err := s.HashToken(token)
	if err != nil {
		return fmt.Errorf("failed to hash incoming token for comparison: %w", err)
	}

	storedHashBytes, err := hex.DecodeString(storedHashHex)
	if err != nil {
		return fmt.Errorf("failed to decode stored hex hash: %w", err)
	}
	incomingHashBytes, _ := hex.DecodeString(incomingHash)

	if subtle.ConstantTimeCompare(incomingHashBytes, storedHashBytes) == 1 {
		return nil
	}

	return domain.ErrTokenMismatch
}
