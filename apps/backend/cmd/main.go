package main

import (
	"log"

	"github.com/SukaMajuu/hris/apps/backend/internal/repository/attendance"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/auth"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/document"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/leave_request"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/location"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/xendit"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest"
	attendanceUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/attendance"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	documentUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	leaveRequestUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/leave_request"
	locationUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	workScheduleUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/database"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
	"github.com/SukaMajuu/hris/apps/backend/pkg/midtrans"
	xenditService "github.com/SukaMajuu/hris/apps/backend/pkg/xendit"
	"github.com/supabase-community/supabase-go"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	supabaseClient, err := supabase.NewClient(cfg.Supabase.URL, cfg.Supabase.ServiceKey, &supabase.ClientOptions{})
	if err != nil {
		log.Fatalf("Failed to initialize Supabase client: %v", err)
	}
	authRepo, err := auth.NewSupabaseRepository(db, cfg.Supabase.URL, cfg.Supabase.Key)
	if err != nil {
		log.Fatalf("Failed to initialize Supabase auth repository: %v", err)
	}
	employeeRepo := employee.NewPostgresRepository(db)
	attendanceRepo := attendance.NewAttendanceRepository(db)
	locationRepo := location.NewLocationRepository(db)
	workScheduleRepo := work_schedule.NewWorkScheduleRepository(db)
	leaveRequestRepo := leave_request.NewPostgresRepository(db)
	xenditRepo := xendit.NewXenditRepository(db)
	xenditClient := xenditService.NewXenditClient(&cfg.Xendit)
	midtransClient := midtrans.NewClient(&cfg.Midtrans)
	documentRepo := document.NewPostgresRepository(db)

	jwtService := jwt.NewJWTService(cfg)

	subscriptionUseCase := subscription.NewSubscriptionUseCase(
		xenditRepo,
		xenditClient,
		employeeRepo,
		authRepo,
	)

	authUseCase := authUseCase.NewAuthUseCase(
		authRepo,
		employeeRepo,
		jwtService,
		cfg,
		subscriptionUseCase,
	)
	employeeUseCase := employeeUseCase.NewEmployeeUseCase(
		employeeRepo,
		authRepo,
		xenditRepo,
		supabaseClient,
		db,
	)

	attendanceUseCase := attendanceUseCase.NewAttendanceUseCase(
		attendanceRepo,
		employeeRepo,
		workScheduleRepo,
		leaveRequestRepo,
	)

	locationUseCase := locationUseCase.NewLocationUseCase(locationRepo)

	workScheduleUseCase := workScheduleUseCase.NewWorkScheduleUseCase(
		workScheduleRepo,
		locationRepo,
	)

	midtransSubscriptionUseCase := subscription.NewMidtransSubscriptionUseCase(xenditRepo, midtransClient, employeeRepo, authRepo, cfg)
	documentUseCase := documentUseCase.NewDocumentUseCase(
		documentRepo,
		employeeRepo,
		supabaseClient,
	)
	leaveRequestUseCase := leaveRequestUseCase.NewLeaveRequestUseCase(
		leaveRequestRepo,
		employeeRepo,
		attendanceRepo,
		supabaseClient,
	)

	router := rest.NewRouter(
		authUseCase,
		employeeUseCase,
		attendanceUseCase,
		locationUseCase,
		leaveRequestUseCase,
		workScheduleUseCase,
		documentUseCase,
		subscriptionUseCase,
		midtransSubscriptionUseCase,
	)

	ginRouter := router.Setup()

	ginRouter.StaticFile("/swagger.yaml", "../../docs/api/swagger.yaml")

	url := ginSwagger.URL("/swagger.yaml")
	ginRouter.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	if err := ginRouter.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
