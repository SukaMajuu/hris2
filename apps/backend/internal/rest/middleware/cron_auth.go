package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CronAPIKeyAuth middleware to secure cron endpoints
func CronAPIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get API key from environment
		expectedAPIKey := os.Getenv("CRON_API_KEY")
		if expectedAPIKey == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Cron API key not configured",
			})
			c.Abort()
			return
		}

		// Get authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// Check if it's a Bearer token
		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authorization format. Use Bearer token",
			})
			c.Abort()
			return
		}

		// Extract and validate the API key
		providedAPIKey := strings.TrimPrefix(authHeader, "Bearer ")
		if providedAPIKey != expectedAPIKey {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid API key",
			})
			c.Abort()
			return
		}

		// Continue to next handler
		c.Next()
	}
}
