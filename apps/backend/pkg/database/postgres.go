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

	// Add statement_cache_mode=disabled and set compatible query exec mode
	if strings.Contains(dbURL, "?") {
		dbURL += "&statement_cache_mode=disabled&default_query_exec_mode=exec"
	} else {
		dbURL += "?statement_cache_mode=disabled&default_query_exec_mode=exec"
	}

	log.Printf("Database connection string (without credentials): %s", strings.ReplaceAll(dbURL, cfg.Database.Password, "***"))

	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{
		PrepareStmt:                              false,
		DisableForeignKeyConstraintWhenMigrating: true,
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

	// Configure connection pool with more conservative settings
	sqlDB.SetMaxIdleConns(2)                  // Reduced from 10
	sqlDB.SetMaxOpenConns(10)                 // Reduced from 100
	sqlDB.SetConnMaxLifetime(5 * time.Minute) // Reduced from 30 minutes
	sqlDB.SetConnMaxIdleTime(1 * time.Minute) // Reduced from 5 minutes

	log.Println("Successfully connected to database")
	return db, nil
}
