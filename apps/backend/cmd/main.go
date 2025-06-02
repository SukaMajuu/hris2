package main

import (
	"log"

	"github.com/SukaMajuu/hris/apps/backend/internal/repository/auth"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/checkclock_settings"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/document"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/location"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/xendit"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	checkclockSettingsUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/checkclock_settings"
	documentUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	locationUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	subscriptionUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/subscription"
	workScheduleUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/work_schedule"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/database"
	"github.com/SukaMajuu/hris/apps/backend/pkg/jwt"
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
	locationRepo := location.NewLocationRepository(db)
	workScheduleRepo := work_schedule.NewWorkScheduleRepository(db)
	checkclockSettingsRepo := checkclock_settings.NewCheckclockSettingsRepository(db)
	xenditRepo := xendit.NewXenditRepository(db)
	xenditClient := xenditService.NewXenditClient(&cfg.Xendit)
	documentRepo := document.NewPostgresRepository(db)

	jwtService := jwt.NewJWTService(cfg)

	authUseCase := authUseCase.NewAuthUseCase(
		authRepo,
		employeeRepo,
		jwtService,
		cfg,
	)

	employeeUseCase := employeeUseCase.NewEmployeeUseCase(
		employeeRepo,
		authRepo,
	)

	locationUseCase := locationUseCase.NewLocationUseCase(locationRepo)

	workScheduleUseCase := workScheduleUseCase.NewWorkScheduleUseCase(
		workScheduleRepo,
		locationRepo,
	)

	checkclockSettingsUseCase := checkclockSettingsUseCase.NewCheckclockSettingsUseCase(
		checkclockSettingsRepo,
		employeeRepo,
		workScheduleRepo,
	)

	subscriptionUseCase := subscriptionUseCase.NewSubscriptionUseCase(
		xenditRepo,
		xenditClient,
		employeeRepo,
		authRepo,
	)

	documentUseCase := documentUseCase.NewDocumentUseCase(
		documentRepo,
		employeeRepo,
		supabaseClient,
	)

	router := rest.NewRouter(authUseCase, employeeUseCase, locationUseCase, workScheduleUseCase, checkclockSettingsUseCase, subscriptionUseCase, documentUseCase)

	ginRouter := router.Setup()

	ginRouter.StaticFile("/swagger.yaml", "../../docs/api/swagger.yaml")

	url := ginSwagger.URL("/swagger.yaml")
	ginRouter.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	if err := ginRouter.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
