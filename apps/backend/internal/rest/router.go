package rest

import (
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/handler"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/middleware"
	auth "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	branch "github.com/SukaMajuu/hris/apps/backend/internal/usecase/branch"
	checkclocksettingsusecase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/checkclock_settings"
	document "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	employee "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	location "github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	position "github.com/SukaMajuu/hris/apps/backend/internal/usecase/position"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	work_Schedule "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	authHandler               *handler.AuthHandler
	locationHandler           *handler.LocationHandler
	authMiddleware            *middleware.AuthMiddleware
	employeeHandler           *handler.EmployeeHandler
	branchHandler             *handler.BranchHandler
	positionHandler           *handler.PositionHandler
	workScheduleHandler       *handler.WorkScheduleHandler
	checkclockSettingsHandler *handler.CheckclockSettingsHandler
	subscriptionHandler       *handler.SubscriptionHandler
	documentHandler           *handler.DocumentHandler
}

func NewRouter(
	authUseCase *auth.AuthUseCase,
	employeeUseCase *employee.EmployeeUseCase,
	branchUseCase *branch.BranchUseCase,
	positionUseCase *position.PositionUseCase,
	locationUseCase *location.LocationUseCase,
	workScheduleUseCase *work_Schedule.WorkScheduleUseCase,
	checkclockSettingsUseCase *checkclocksettingsusecase.CheckclockSettingsUseCase,
	subscriptionUseCase *subscription.SubscriptionUseCase,
	documentUseCase *document.DocumentUseCase,
) *Router {
	return &Router{
		authHandler:               handler.NewAuthHandler(authUseCase),
		authMiddleware:            middleware.NewAuthMiddleware(authUseCase, employeeUseCase),
		employeeHandler:           handler.NewEmployeeHandler(employeeUseCase),
		branchHandler:             handler.NewBranchHandler(branchUseCase),
		positionHandler:           handler.NewPositionHandler(positionUseCase),
		locationHandler:           handler.NewLocationHandler(locationUseCase),
		workScheduleHandler:       handler.NewWorkScheduleHandler(workScheduleUseCase),
		checkclockSettingsHandler: handler.NewCheckclockSettingsHandler(checkclockSettingsUseCase),
		subscriptionHandler:       handler.NewSubscriptionHandler(subscriptionUseCase),
		documentHandler:           handler.NewDocumentHandler(documentUseCase),
	}
}

func (r *Router) Setup() *gin.Engine {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://hrispblfrontend.agreeablecoast-95647c57.southeastasia.azurecontainerapps.io"},
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
		api.Use(r.authMiddleware.Authenticate())
		{
			employee := api.Group("/employee")
			{
				employee.GET("", r.employeeHandler.ListEmployees)
				employee.GET("/statistics", r.employeeHandler.GetEmployeeStatistics)
				employee.GET("/:id", r.employeeHandler.GetEmployeeByID)
				employee.POST("", r.employeeHandler.CreateEmployee)
				employee.PATCH("/:id", r.employeeHandler.UpdateEmployee)
				employee.PATCH("/:id/status", r.employeeHandler.ResignEmployee)
				// employee.POST("/:id/photo", r.authMiddleware.Authenticate(), r.employeeHandler.UploadEmployeePhoto)
			}

			branches := api.Group("/branches")
			{
				branches.POST("", r.authMiddleware.Authenticate(), r.branchHandler.CreateBranch)
				branches.GET("", r.authMiddleware.Authenticate(), r.branchHandler.GetMyBranches)
				branches.PUT("/:id", r.authMiddleware.Authenticate(), r.branchHandler.UpdateBranch)
				branches.DELETE("/:id", r.authMiddleware.Authenticate(), r.branchHandler.DeleteBranch)
			}

			positions := api.Group("/positions")
			{
				positions.POST("", r.authMiddleware.Authenticate(), r.positionHandler.CreatePosition)
				positions.GET("", r.authMiddleware.Authenticate(), r.positionHandler.GetMyPositions)
				positions.PUT("/:id", r.authMiddleware.Authenticate(), r.positionHandler.UpdatePosition)
				positions.DELETE("/:id", r.authMiddleware.Authenticate(), r.positionHandler.DeletePosition)
			}

			locations := api.Group("/locations")
			{
				locations.POST("", r.locationHandler.CreateLocation)
				locations.GET("", r.locationHandler.ListLocations)
				locations.GET("/:id", r.locationHandler.GetLocationByID)
				locations.PUT("/:id", r.locationHandler.UpdateLocation)
				locations.DELETE("/:id", r.locationHandler.DeleteLocation)
			}

			workScheduleRoutes := api.Group("/work-schedules")
			{
				workScheduleRoutes.POST("", r.workScheduleHandler.CreateWorkSchedule)
				workScheduleRoutes.GET("", r.workScheduleHandler.ListWorkSchedules)
				workScheduleRoutes.GET("/:id", r.workScheduleHandler.GetWorkSchedule)
				workScheduleRoutes.PUT("/:id", r.workScheduleHandler.UpdateWorkSchedule)
				workScheduleRoutes.DELETE("/:id", r.workScheduleHandler.DeleteWorkSchedule)
			}

			checkclockSettings := api.Group("/checkclock-settings")
			{
				checkclockSettings.POST("", r.checkclockSettingsHandler.CreateCheckclockSettings)
				checkclockSettings.GET("/", r.checkclockSettingsHandler.GetAllCheckclockSettings)
				checkclockSettings.GET("/:id", r.checkclockSettingsHandler.GetCheckclockSettingsByID)
				checkclockSettings.GET("/employee/:employee_id", r.checkclockSettingsHandler.GetCheckclockSettingsByEmployeeID)
				checkclockSettings.PUT("/:id", r.checkclockSettingsHandler.UpdateCheckclockSettings)
				checkclockSettings.DELETE("/:id", r.checkclockSettingsHandler.DeleteCheckclockSettings)
			}

			documents := api.Group("/documents")
			{
				documents.POST("/upload", r.authMiddleware.Authenticate(), r.documentHandler.UploadDocument)
				documents.GET("", r.authMiddleware.Authenticate(), r.documentHandler.GetDocuments)
				documents.DELETE("/:id", r.authMiddleware.Authenticate(), r.documentHandler.DeleteDocument)
			}

			// Employee-specific document routes
			employeeDocuments := api.Group("/employees/:employee_id/documents")
			{
				employeeDocuments.POST("/upload", r.documentHandler.UploadDocumentForEmployee)
				employeeDocuments.GET("", r.documentHandler.GetDocumentsByEmployee)
			}

			subscription := api.Group("/subscription")
			{
				subscription.GET("/plans", r.subscriptionHandler.GetSubscriptionPlans)
				subscription.GET("/plans/:subscription_plan_id/seat-plans", r.subscriptionHandler.GetSeatPlans)
				subscription.GET("/checkout/:session_id", r.subscriptionHandler.GetCheckoutSession)

				protected := subscription.Group("")
				{
					protected.GET("/me", r.subscriptionHandler.GetUserSubscription)
					protected.POST("/checkout/trial", r.subscriptionHandler.InitiateTrialCheckout)
					protected.POST("/checkout/paid", r.subscriptionHandler.InitiatePaidCheckout)
					protected.POST("/checkout/complete-trial", r.subscriptionHandler.CompleteTrialCheckout)
				}
			}
		}

		webhooks := v1.Group("/webhooks")
		{
			webhooks.POST("/xendit", r.subscriptionHandler.ProcessWebhook)
		}
	}

	return router

}
