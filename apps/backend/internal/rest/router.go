package rest

import (
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/handler"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/middleware"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	authHandler     *handler.AuthHandler
	locationHandler *handler.LocationHandler
	authMiddleware  *middleware.AuthMiddleware
}

func NewRouter(authUseCase *auth.AuthUseCase, locationUseCase *location.LocationUseCase) *Router {
	return &Router{
		locationHandler: handler.NewLocationHandler(locationUseCase),
		authHandler:    handler.NewAuthHandler(authUseCase),
		authMiddleware: middleware.NewAuthMiddleware(authUseCase, employeeUseCase),
		employeeHandler: handler.NewEmployeeHandler(employeeUseCase),
	}
}

func (r *Router) Setup() *gin.Engine {
	gin.SetMode(gin.DebugMode)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60,
	}))

	// API v1 routes
	v1 := router.Group("/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", r.authHandler.Register)
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/google", r.authHandler.GoogleLogin)

			password := auth.Group("/password")
			{
				password.POST("/change", r.authMiddleware.Authenticate(), r.authHandler.ChangePassword)
				password.POST("/reset", r.authHandler.ResetPassword)
			}

			auth.POST("/logout", r.authMiddleware.Authenticate(), r.authHandler.Logout)
			auth.POST("/refresh", r.authHandler.RefreshToken)
		}

		// Protected API routes
		api := v1.Group("/api")
		// api.Use(r.authMiddleware.Authenticate())
		{
			// User management routes
			users := api.Group("/users")
			{
				users.GET("", r.authMiddleware.RequireRole("admin"), r.authHandler.GetUsers)
				users.GET("/:id", r.authMiddleware.RequireRole("admin", "user"), r.authHandler.GetUser)
				users.PUT("/:id", r.authMiddleware.RequireRole("admin"), r.authHandler.UpdateUser)
				users.DELETE("/:id", r.authMiddleware.RequireRole("admin"), r.authHandler.DeleteUser)
			}

			// Location routes
			locations := api.Group("/locations")
			{
				locations.POST("", r.locationHandler.CreateLocation)
				locations.GET("", r.locationHandler.GetAllLocations)
				locations.GET("/:id", r.locationHandler.GetLocationByID)
				locations.PUT("/:id", r.locationHandler.UpdateLocation)
				locations.DELETE("/:id", r.locationHandler.DeleteLocation)
			}

			// TODO: Add other API resource routes as needed
		}
	}

	return router

}
