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
		// - Extract ACCESS token from Authorization header (Bearer <token>)
		// - Verify access token (check signature, expiration)
		// - If valid: Get user details from token payload
		// - If invalid/expired: Return 401 Unauthorized
		// - Set user details (ID, Role, Email etc.) in Gin context (e.g., c.Set("user", userDetails))

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		accessToken := parts[1]
		// TODO: Verify access token using the auth use case or a dedicated JWT service
		// userDetails, err := m.authUseCase.VerifyAccessToken(c.Request.Context(), accessToken)
		// if err != nil {
		//     c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		//     c.Abort()
		//     return
		// }

		// TODO: Set verified user details in context
		// c.Set("user", userDetails)

		_ = accessToken // Placeholder

		c.Next()
	}
}

// TODO: Role checking might be out of scope for Sprint 1, focus on Authentication first
func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Implement role-based access control (Post-Sprint 1)
		// - Get user from context (set by Authenticate middleware)
		// - Check if user's role (e.g., userDetails.Role) is in the allowed `roles` list
		// - If not allowed: Return 403 Forbidden

		// Example:
		// userCtx, exists := c.Get("user")
		// if !exists { /* ... handle error ... */ }
		// userDetails := userCtx.(YourUserDetailsStruct)
		// hasRole := false
		// for _, requiredRole := range roles {
		// 	 if userDetails.Role == requiredRole {
		// 		 hasRole = true
		// 		 break
		// 	 }
		// }
		// if !hasRole { /* ... return 403 ... */ }

		c.Next()
	}
}
