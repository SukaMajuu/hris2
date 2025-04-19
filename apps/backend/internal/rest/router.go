package rest

import (
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/handler"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/middleware"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/gin-gonic/gin"
)

type Router struct {
	authHandler    *handler.AuthHandler
	authMiddleware *middleware.AuthMiddleware
}

func NewRouter(authUseCase *auth.AuthUseCase) *Router {
	return &Router{
		authHandler:    handler.NewAuthHandler(authUseCase),
		authMiddleware: middleware.NewAuthMiddleware(authUseCase),
	}
}

func (r *Router) Setup() *gin.Engine {
	router := gin.Default()

	// Global middleware
	router.Use(gin.Recovery())
	router.Use(gin.Logger())
	// TODO: Add CORS middleware

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
		}

		// Protected API routes
		api := v1.Group("/api")
		api.Use(r.authMiddleware.Authenticate())
		{
			// User management
			// users := api.Group("/users")
			// {
			// 	// users.GET("", r.authMiddleware.RequireRole("admin"), r.authHandler.GetUsers)
			// 	// users.GET("/:id", r.authMiddleware.RequireRole("admin", "user"), r.authHandler.GetUser)
			// 	// users.PUT("/:id", r.authMiddleware.RequireRole("admin"), r.authHandler.UpdateUser)
			// 	// users.DELETE("/:id", r.authMiddleware.RequireRole("admin"), r.authHandler.DeleteUser)
			// }

			// TODO: Add other API resource routes
			// employees := api.Group("/employees") { ... }
			// departments := api.Group("/departments") { ... }
			// positions := api.Group("/positions") { ... }
			// attendance := api.Group("/attendance") { ... }
		}
	}

	return router
}
