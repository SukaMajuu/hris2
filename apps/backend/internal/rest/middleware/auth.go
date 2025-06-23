package middleware

import (
	"net/http"
	"strings"

	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	"github.com/gin-gonic/gin"
)

type AuthMiddleware struct {
	authUseCase     *auth.AuthUseCase
	employeeUseCase *employee.EmployeeUseCase
}

func NewAuthMiddleware(authUseCase *auth.AuthUseCase, employeeUseCase *employee.EmployeeUseCase) *AuthMiddleware {
	return &AuthMiddleware{authUseCase: authUseCase, employeeUseCase: employeeUseCase}
}

func (m *AuthMiddleware) Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
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

		userID, role, err := m.authUseCase.VerifyAccessToken(c.Request.Context(), accessToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Check if user is an employee and if they have resigned
		employee, err := m.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), userID)
		if err == nil && !employee.EmploymentStatus {
			// Employee exists and has resigned
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Access denied. Your employment has ended and you can no longer access the system.",
			})
			c.Abort()
			return
		}
		// If error occurred (employee not found), continue - allows admin users to access

		c.Set("userID", userID)
		c.Set("userRole", role)

		c.Next()
	}
}

// func (m *AuthMiddleware) RequireRole(roles ...string) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		userIDCtx, exists := c.Get("userID")
// 		if !exists {
// 			response.Unauthorized(c, "User ID not found in context", domain.ErrInvalidToken)
// 			return
// 		}
// 		userID, ok := userIDCtx.(uint)
// 		if !ok {
// 			response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
// 			return
// 		}

// 		user, err := m.employeeUseCase.GetEmployeeByID(c.Request.Context(), userID)
// 		if err != nil {
// 			response.InternalServerError(c, err)
// 			return
// 		}

// 		hasRole := false
// 		for _, requiredRole := range roles {
// 			if user.Role == requiredRole {
// 				hasRole = true
// 				break
// 			}
// 		}

// 		if !hasRole {
// 			response.Forbidden(c, "User does not have the required role", domain.ErrForbidden)
// 			return
// 		}

// 		c.Next()
// 	}
// }
