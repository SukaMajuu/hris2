package database

import (
	"log"

	models "github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	if err := db.Exec(`DO $$ BEGIN
		CREATE TYPE user_role AS ENUM ('admin', 'hr', 'employee');
		CREATE TYPE user_status AS ENUM ('active', 'inactive');
		CREATE TYPE employment_status AS ENUM ('active', 'inactive');
		CREATE TYPE work_arrangement_type AS ENUM ('WFA', 'WFO', 'WFH');
		CREATE TYPE event_type AS ENUM ('check_in', 'check_out');
		CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
		CREATE TYPE regulation_type AS ENUM ('government', 'company');
		CREATE TYPE document_status AS ENUM ('draft', 'active');
		CREATE TYPE billing_status AS ENUM ('unpaid', 'paid');
		CREATE TYPE payment_status AS ENUM ('pending', 'completed');
	EXCEPTION WHEN duplicate_object THEN null;
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
		&models.Department{},
		&models.Position{},
		&models.WorkArrangement{},
		&models.AttendanceLog{},
		&models.DailyAttendance{},
		&models.OvertimeType{},
		&models.OvertimeRate{},
		&models.OvertimeRequest{},
		&models.EmployeeDocument{},
		&models.BillingCycle{},
		&models.Payment{},
	); err != nil {
		return err
	}

	log.Println("Database migrations completed successfully")
	return nil
}
