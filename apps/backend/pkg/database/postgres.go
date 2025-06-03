package database

import (
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/pkg/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewPostgresDB(cfg *config.Config) (*gorm.DB, error) {
	if cfg.Database.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set in the configuration")
	}

	// Parse and encode the database URL properly
	dbURL := cfg.Database.DatabaseURL
	if strings.HasPrefix(dbURL, "postgresql://") {
		// Parse the URL to handle special characters
		parsedURL, err := url.Parse(dbURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse database URL: %w", err)
		}

		// Reconstruct the URL with proper encoding
		userInfo := parsedURL.User
		if userInfo != nil {
			username := userInfo.Username()
			password, _ := userInfo.Password()

			// Create new URL with encoded user info
			parsedURL.User = url.UserPassword(
				url.QueryEscape(username),
				url.QueryEscape(password),
			)
			dbURL = parsedURL.String()
		}
	}

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{
		PrepareStmt: true, // Enable prepared statements
		// PrepareStmt: false, // Enable prepared statements
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(30 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	log.Println("Successfully connected to database")
	return db, nil
}
