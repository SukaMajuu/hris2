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

		-- Work Type Enum (New)
		DROP TYPE IF EXISTS work_type CASCADE;
		CREATE TYPE work_type AS ENUM ('WFO', 'WFA','Hybrid');

		-- Work Type Detail Enum (New)
		DROP TYPE IF EXISTS worktype_detail CASCADE;
		CREATE TYPE worktype_detail AS ENUM ('WFO', 'WFA');

		-- leave_type Enum (New)
		DROP TYPE IF EXISTS leave_type CASCADE;
		CREATE TYPE leave_type AS ENUM ('sick_leave', 'annual_leave', 'maternity_leave', 'compassionate_leave', 'marriage Leave');

		-- attendance_status (new)
		DROP TYPE IF EXISTS attendance_status CASCADE;
		CREATE TYPE attendance_status AS ENUM ('on_time', 'late', 'early_eave', 'absent', 'leave');

		-- leave_status (new)
		DROP TYPE IF EXISTS leave_status CASCADE;
		CREATE TYPE leave_status AS ENUM ('Waiting Approval', 'Approved', 'Rejected');

		-- Subscription Plan Type Enum (New)
		DROP TYPE IF EXISTS subscription_plan_type CASCADE;
		CREATE TYPE subscription_plan_type AS ENUM ('standard', 'premium', 'ultra');

		-- Subscription Status Enum (New)
		DROP TYPE IF EXISTS subscription_status CASCADE;
		CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'inactive', 'suspended', 'expired', 'cancelled');

		-- Payment Status Enum (New)
		DROP TYPE IF EXISTS payment_status CASCADE;
		CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled', 'expired', 'refunded');

		-- Checkout Status Enum (New)
		DROP TYPE IF EXISTS checkout_status CASCADE;
		CREATE TYPE checkout_status AS ENUM ('initiated', 'pending', 'completed', 'failed', 'cancelled', 'expired');

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
		&models.RefreshToken{},
		&models.Location{},
		&models.WorkSchedule{},
		&models.WorkScheduleDetail{},
		&models.CheckclockSettings{},
		&models.Attendance{},
		&models.LeaveRequest{},
		&models.SubscriptionFeature{},
		&models.SubscriptionPlan{},
		&models.SubscriptionPlanFeature{},
		&models.SeatPlan{},
		&models.Subscription{},
		&models.SubscriptionUsage{},
		&models.TrialActivity{},
		&models.CustomerBillingInfo{},
		&models.CheckoutSession{},
		&models.PaymentTransaction{},
		&models.Document{},
	); err != nil {
		return err
	}

	log.Println("Database auto-migration completed successfully")
	return nil
}
