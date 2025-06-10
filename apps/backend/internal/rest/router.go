package rest

import (
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/handler"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest/middleware"
	attendance "github.com/SukaMajuu/hris/apps/backend/internal/usecase/attendance"
	auth "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	document "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	employee "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/leave_request"
	location "github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	work_Schedule "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Router struct {
	authHandler         *handler.AuthHandler
	locationHandler     *handler.LocationHandler
	authMiddleware      *middleware.AuthMiddleware
	employeeHandler     *handler.EmployeeHandler
	workScheduleHandler *handler.WorkScheduleHandler
	subscriptionHandler *handler.SubscriptionHandler
	documentHandler     *handler.DocumentHandler
	leaveRequestHandler *handler.LeaveRequestHandler
	attendanceHandler   *handler.AttendanceHandler
	cronHandler         *handler.CronHandler
}

func NewRouter(
	authUC *auth.AuthUseCase,
	employeeUC *employee.EmployeeUseCase,
	attendanceUC *attendance.AttendanceUseCase,
	locationUC *location.LocationUseCase,
	leaveRequestUC *leave_request.LeaveRequestUseCase,
	workScheduleUC *work_Schedule.WorkScheduleUseCase,
	documentUC *document.DocumentUseCase,
	subscriptionUC *subscription.SubscriptionUseCase,
	midtransSubscriptionUC *subscription.MidtransSubscriptionUseCase,
) *Router {
	authHandler := handler.NewAuthHandler(authUC)
	employeeHandler := handler.NewEmployeeHandler(employeeUC)
	attendanceHandler := handler.NewAttendanceHandler(attendanceUC, employeeUC)
	leaveRequestHandler := handler.NewLeaveRequestHandler(leaveRequestUC)
	workScheduleHandler := handler.NewWorkScheduleHandler(workScheduleUC)
	locationHandler := handler.NewLocationHandler(locationUC)
	documentHandler := handler.NewDocumentHandler(documentUC)
	subscriptionHandler := handler.NewSubscriptionHandlerWithMidtrans(subscriptionUC, midtransSubscriptionUC)
	cronHandler := handler.NewCronHandler(subscriptionUC, attendanceUC)

	return &Router{
		authHandler:         authHandler,
		locationHandler:     locationHandler,
		authMiddleware:      middleware.NewAuthMiddleware(authUC, employeeUC),
		employeeHandler:     employeeHandler,
		workScheduleHandler: workScheduleHandler,
		subscriptionHandler: subscriptionHandler,
		documentHandler:     documentHandler,
		leaveRequestHandler: leaveRequestHandler,
		attendanceHandler:   attendanceHandler,
		cronHandler:         cronHandler,
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
			employee := api.Group("/employees")
			{
				employee.GET("", r.employeeHandler.ListEmployees)
				employee.GET("/statistics", r.employeeHandler.GetEmployeeStatistics)
				employee.GET("/hire-date-range", r.employeeHandler.GetHireDateRange)
				employee.GET("/validate-unique", r.employeeHandler.ValidateUniqueField)
				employee.GET("/me", r.employeeHandler.GetCurrentUserProfile)
				employee.PATCH("/me", r.employeeHandler.UpdateCurrentUserProfile)
				employee.GET("/:id", r.employeeHandler.GetEmployeeByID)
				employee.POST("", r.employeeHandler.CreateEmployee)
				employee.POST("/bulk-import", r.employeeHandler.BulkImportEmployees)
				employee.PATCH("/:id", r.employeeHandler.UpdateEmployee)
				employee.PATCH("/:id/status", r.employeeHandler.ResignEmployee)
				employee.POST("/:id/documents", r.documentHandler.UploadDocumentForEmployee)
				employee.GET("/:id/documents", r.documentHandler.GetDocumentsByEmployee)
			}

			locations := api.Group("/locations")
			{
				locations.POST("", r.locationHandler.CreateLocation)
				locations.GET("", r.locationHandler.ListLocations)
				locations.GET("/:id", r.locationHandler.GetLocationByID)
				locations.PUT("/:id", r.locationHandler.UpdateLocation)
				locations.PATCH("/:id", r.locationHandler.DeleteLocation)
			}

			workScheduleRoutes := api.Group("/work-schedules")
			{
				workScheduleRoutes.POST("", r.workScheduleHandler.CreateWorkSchedule)
				workScheduleRoutes.GET("", r.workScheduleHandler.ListWorkSchedules)
				workScheduleRoutes.GET("/:id", r.workScheduleHandler.GetWorkSchedule)
				workScheduleRoutes.GET("/:id/edit", r.workScheduleHandler.GetWorkScheduleForEdit)
				workScheduleRoutes.PUT("/:id", r.workScheduleHandler.UpdateWorkSchedule)
				workScheduleRoutes.PATCH("/:id", r.workScheduleHandler.DeleteWorkSchedule)
			}

			attendances := api.Group("/attendances")
			{
				attendances.POST("", r.attendanceHandler.CreateAttendance)
				attendances.GET("", r.attendanceHandler.ListAttendances)
				attendances.GET("/statistics", r.attendanceHandler.GetAttendanceStatistics)
				attendances.GET("/statistics/monthly", r.attendanceHandler.GetEmployeeMonthlyStatistics)
				attendances.GET("/today", r.attendanceHandler.GetTodayAttendancesByManager)
				attendances.GET("/:id", r.attendanceHandler.GetAttendanceByID)
				attendances.PUT("/:id", r.attendanceHandler.UpdateAttendance)
				attendances.DELETE("/:id", r.attendanceHandler.DeleteAttendance)
				attendances.POST("/clock-in", r.attendanceHandler.ClockIn)
				attendances.POST("/clock-out", r.attendanceHandler.ClockOut)
				attendances.GET("/employees/:employee_id", r.attendanceHandler.ListAttendancesByEmployee)
				attendances.POST("/test-daily-absent-check", r.attendanceHandler.TestDailyAbsentCheck)
			}

			documents := api.Group("/documents")
			{
				documents.POST("/upload", r.authMiddleware.Authenticate(), r.documentHandler.UploadDocument)
				documents.GET("", r.authMiddleware.Authenticate(), r.documentHandler.GetDocuments)
				documents.DELETE("/:id", r.authMiddleware.Authenticate(), r.documentHandler.DeleteDocument)
			}

			leaveRequests := api.Group("/leave-requests")
			{
				// Employee routes (can access their own leave requests)
				leaveRequests.POST("", r.leaveRequestHandler.CreateLeaveRequest)
				leaveRequests.GET("/my", r.leaveRequestHandler.GetMyLeaveRequests)
				leaveRequests.GET("/:id", r.leaveRequestHandler.GetLeaveRequestByID)
				leaveRequests.PUT("/:id", r.leaveRequestHandler.UpdateLeaveRequest)
				leaveRequests.DELETE("/:id", r.leaveRequestHandler.DeleteLeaveRequest)

				// Admin routes (can access all leave requests and update status)
				leaveRequests.GET("", r.leaveRequestHandler.ListLeaveRequests)
				leaveRequests.POST("/admin", r.leaveRequestHandler.CreateLeaveRequestForEmployee)
				leaveRequests.PATCH("/:id/status", r.leaveRequestHandler.UpdateLeaveRequestStatus)
			}

			subscription := api.Group("/subscription")
			{
				subscription.GET("/plans", r.subscriptionHandler.GetSubscriptionPlans)
				subscription.GET("/plans/:subscription_plan_id/seat-plans", r.subscriptionHandler.GetSeatPlans)
				subscription.GET("/checkout/:session_id", r.subscriptionHandler.GetCheckoutSession)

				protected := subscription.Group("")
				{
					protected.GET("/me", r.subscriptionHandler.GetUserSubscription)
					protected.POST("/trial/activate", r.subscriptionHandler.ActivateTrial)
					protected.POST("/checkout/trial", r.subscriptionHandler.InitiateTrialCheckout)
					protected.POST("/checkout/paid", r.subscriptionHandler.InitiatePaidCheckout)
					protected.POST("/checkout/complete-trial", r.subscriptionHandler.CompleteTrialCheckout)
				}
			}
		}

		webhooks := v1.Group("/webhooks")
		{
			webhooks.POST("/xendit", r.subscriptionHandler.ProcessWebhook)
			webhooks.POST("/tripay", r.subscriptionHandler.ProcessTripayWebhook)
			webhooks.POST("/midtrans", r.subscriptionHandler.ProcessMidtransWebhook)
		}

		// Cron job endpoints (secured with API key)
		cron := v1.Group("/cron")
		cron.Use(middleware.CronAPIKeyAuth())
		{
			cron.POST("/check-trial-expiry", r.cronHandler.CheckTrialExpiry)
			cron.POST("/send-trial-warnings", r.cronHandler.SendTrialWarnings)
			cron.POST("/process-auto-renewals", r.cronHandler.ProcessAutoRenewals)
			cron.POST("/update-usage-stats", r.cronHandler.UpdateUsageStatistics)
			cron.POST("/process-daily-absent-check", r.cronHandler.ProcessDailyAbsentCheck)
		}
	}

	return router
}
