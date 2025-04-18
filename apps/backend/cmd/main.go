package main

import (
	"log"

	"github.com/SukaMajuu/hris/apps/backend/internal/repository/auth"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/department"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/employee"
	"github.com/SukaMajuu/hris/apps/backend/internal/repository/position"
	"github.com/SukaMajuu/hris/apps/backend/internal/rest"
	authUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/auth"
	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/database"
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

	authRepo, err := auth.NewFirebaseRepository(db, cfg.Firebase.CredentialsFile)
	if err != nil {
		log.Fatal("Failed to initialize Firebase:", err)
	}

	employeeRepo := employee.NewPostgresRepository(db)
	deptRepo := department.NewPostgresRepository(db)
	positionRepo := position.NewPostgresRepository(db)

	authUseCase := authUseCase.NewAuthUseCase(
		authRepo,
		employeeRepo,
		deptRepo,
		positionRepo,
	)

	router := rest.NewRouter(authUseCase)

	ginRouter := router.Setup()

	ginRouter.StaticFile("/swagger.yaml", "./docs/swagger.yaml")

	url := ginSwagger.URL("/swagger.yaml")
	ginRouter.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	if err := ginRouter.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
