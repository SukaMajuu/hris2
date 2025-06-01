package main

import (
	"log"

	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"github.com/SukaMajuu/hris/apps/backend/pkg/database"
)

func main() {
    cfg, err := config.Load()
    if err != nil {
        log.Fatal(err)
    }

    db, err := database.NewPostgresDB(cfg)
    if err != nil {
        log.Fatal(err)
    }

    if err := database.Migrate(db); err != nil {
        log.Fatal(err)
    }

    log.Println("Database migrations completed successfully")

    if err := database.Run(db); err != nil {
        log.Fatal("Failed to run seeders:", err)
    }

    log.Println("Database setup completed successfully")
}
