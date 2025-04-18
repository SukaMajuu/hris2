package middleware

import (
	"net/http"
	"strings"

	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/gin-gonic/gin"
)

type AuthMiddleware struct {
	authUseCase *auth.AuthUseCase
}

func NewAuthMiddleware(authUseCase *auth.AuthUseCase) *AuthMiddleware {
	return &AuthMiddleware{authUseCase: authUseCase}
}

func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement authentication middleware
		// - Extract token from Authorization header
		// - Verify token
		// - Get user from token
		// - Set user in context
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// token := parts[1]
		// TODO: Verify token and get user
		// user, err := m.authUseCase.VerifyToken(c.Request.Context(), token)
		// if err != nil {
		//     c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		//     c.Abort()
		//     return
		// }

		// Set user in context
		// c.Set("user", user)
		c.Next()
	}
}

func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement role-based access control
		// - Get user from context
		// - Check if user has required role
		// user, exists := c.Get("user")
		// if !exists {
		//     c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		//     c.Abort()
		//     return
		// }

		// TODO: Check user roles
		// if !hasRequiredRole(user, roles...) {
		//     c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
		//     c.Abort()
		//     return
		// }

		c.Next()
	}
}
