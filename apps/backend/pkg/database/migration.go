package database

import (
	"log"

	models "github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	if err := db.Exec(`DO $$ BEGIN
		-- User Role Enum (Updated)
		DROP TYPE IF EXISTS user_role CASCADE;
		CREATE TYPE user_role AS ENUM ('admin', 'user');

		-- Gender Enum (New)
		DROP TYPE IF EXISTS gender CASCADE;
		CREATE TYPE gender AS ENUM ('Male', 'Female');

		-- Education Level Enum (New)
		DROP TYPE IF EXISTS education_level CASCADE;
		CREATE TYPE education_level AS ENUM (
			'SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1/D4', 'S2', 'S3', 'Other'
		);

		-- Contract Type Enum (New)
		DROP TYPE IF EXISTS contract_type CASCADE;
		CREATE TYPE contract_type AS ENUM ('permanent', 'contract', 'freelance');

		-- Tax Status Enum (New)
		DROP TYPE IF EXISTS tax_status CASCADE;
		CREATE TYPE tax_status AS ENUM (
			'TK/0', 'TK/1', 'TK/2', 'TK/3',
			'K/0', 'K/1', 'K/2', 'K/3',
			'K/I/0', 'K/I/1', 'K/I/2', 'K/I/3'
		);

	EXCEPTION WHEN undefined_object THEN null; -- Changed exception handler for DROP TYPE
	END $$;`).Error; err != nil {
		return err
	}

	if db.Migrator().HasColumn(&models.User{}, "password") {
		if err := db.Migrator().DropColumn(&models.User{}, "password"); err != nil {
			log.Printf("Warning: Failed to drop password column: %v", err)
		} else {
			log.Println("Successfully dropped password column")
		}
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Employee{},
		&models.Position{},
		&models.Branch{},
		&models.RefreshToken{},
	); err != nil {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}
