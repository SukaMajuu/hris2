package database

import (
	"fmt"
	"log"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func seedPositions(db *gorm.DB) error {
	var count int64
	db.Model(&domain.Position{}).Count(&count)
	if count > 0 {
		log.Println("Positions table already seeded.")
		return nil
	}

	positions := []domain.Position{
		{Name: "HR Manager"},
		{Name: "Software Engineer"},
		{Name: "Accountant"},
		{Name: "Employee"},
	}

	if err := db.Create(&positions).Error; err != nil {
		return fmt.Errorf("failed to seed positions: %w", err)
	}

	log.Println("Successfully seeded Positions table.")
	return nil
}

func seedSubscriptionFeatures(db *gorm.DB) error {
	var count int64
	db.Model(&domain.SubscriptionFeature{}).Count(&count)
	if count > 0 {
		log.Println("Subscription features table already seeded.")
		return nil
	}

	features := []domain.SubscriptionFeature{
		{Code: "employee_database", Name: "Employee Database View & Export", Description: "View and export employee information"},
		{Code: "clock_in_out", Name: "Clock-in/out (Manual + Approval)", Description: "Employee clock-in/out with approval workflow"},
		{Code: "attendance_status", Name: "Attendance Status (On-time/Late)", Description: "Track employee attendance status"},
		{Code: "leave_requests", Name: "Leave Requests (Sick, Permit, Annual)", Description: "Employee leave request management"},
		{Code: "employee_dashboard", Name: "Employee Dashboard", Description: "Employee self-service dashboard"},
		{Code: "admin_dashboard", Name: "Admin Dashboard & Employee Analytics", Description: "Administrative dashboard with analytics"},
		{Code: "gps_attendance", Name: "GPS-based Attendance", Description: "Location-based attendance tracking"},
		{Code: "work_schedule", Name: "Work Schedule & Shift Management", Description: "Manage work schedules and shifts"},
		{Code: "attendance_reports", Name: "Detailed Attendance Reports", Description: "Comprehensive attendance reporting"},
		{Code: "hr_documents", Name: "HR Letters/Contracts", Description: "Generate HR documents and contracts"},
	}

	if err := db.Create(&features).Error; err != nil {
		return fmt.Errorf("failed to seed subscription features: %w", err)
	}

	log.Println("Successfully seeded Subscription Features table.")
	return nil
}

func seedSubscriptionPlans(db *gorm.DB) error {
	var count int64
	db.Model(&domain.SubscriptionPlan{}).Count(&count)
	if count > 0 {
		log.Println("Subscription plans table already seeded.")
		return nil
	}

	plans := []domain.SubscriptionPlan{
		{
			PlanType:    enums.PlanStandard,
			Name:        "Standard",
			Description: "Best for small business",
			Features:    `["employee_database", "employee_dashboard"]`,
			IsActive:    true,
		},
		{
			PlanType:    enums.PlanPremium,
			Name:        "Premium",
			Description: "Best for growing business",
			Features:    `["admin_dashboard", "clock_in_out", "gps_attendance", "attendance_status", "leave_requests", "work_schedule"]`,
			IsActive:    true,
		},
		{
			PlanType:    enums.PlanUltra,
			Name:        "Ultra",
			Description: "For large enterprises",
			Features:    `["hr_documents", "attendance_reports"]`,
			IsActive:    false,
		},
	}

	if err := db.Create(&plans).Error; err != nil {
		return fmt.Errorf("failed to seed subscription plans: %w", err)
	}

	log.Println("Successfully seeded Subscription Plans table.")
	return nil
}

func seedSeatPlans(db *gorm.DB) error {
	var count int64
	db.Model(&domain.SeatPlan{}).Count(&count)
	if count > 0 {
		log.Println("Seat plans table already seeded.")
		return nil
	}

	// Get the subscription plans
	var standardPlan, premiumPlan, ultraPlan domain.SubscriptionPlan
	db.Where("plan_type = ?", enums.PlanStandard).First(&standardPlan)
	db.Where("plan_type = ?", enums.PlanPremium).First(&premiumPlan)
	db.Where("plan_type = ?", enums.PlanUltra).First(&ultraPlan)

	seatPlans := []domain.SeatPlan{
		// Standard Plan Tiers
		{SubscriptionPlanID: standardPlan.ID, SizeTierID: "std-tier1-50", MinEmployees: 1, MaxEmployees: 50, PricePerMonth: decimal.NewFromFloat(99000), PricePerYear: decimal.NewFromFloat(990000)},
		{SubscriptionPlanID: standardPlan.ID, SizeTierID: "std-tier51-100", MinEmployees: 51, MaxEmployees: 100, PricePerMonth: decimal.NewFromFloat(179000), PricePerYear: decimal.NewFromFloat(1790000)},
		{SubscriptionPlanID: standardPlan.ID, SizeTierID: "std-tier101-250", MinEmployees: 101, MaxEmployees: 250, PricePerMonth: decimal.NewFromFloat(299000), PricePerYear: decimal.NewFromFloat(2990000)},

		// Premium Plan Tiers
		{SubscriptionPlanID: premiumPlan.ID, SizeTierID: "pre-tier1-50", MinEmployees: 1, MaxEmployees: 50, PricePerMonth: decimal.NewFromFloat(199000), PricePerYear: decimal.NewFromFloat(1990000)},
		{SubscriptionPlanID: premiumPlan.ID, SizeTierID: "pre-tier51-100", MinEmployees: 51, MaxEmployees: 100, PricePerMonth: decimal.NewFromFloat(359000), PricePerYear: decimal.NewFromFloat(3590000)},
		{SubscriptionPlanID: premiumPlan.ID, SizeTierID: "pre-tier101-250", MinEmployees: 101, MaxEmployees: 250, PricePerMonth: decimal.NewFromFloat(599000), PricePerYear: decimal.NewFromFloat(5990000)},

		// Ultra Plan Tiers
		{SubscriptionPlanID: ultraPlan.ID, SizeTierID: "ult-tier1-50", MinEmployees: 1, MaxEmployees: 50, PricePerMonth: decimal.NewFromFloat(399000), PricePerYear: decimal.NewFromFloat(3990000)},
		{SubscriptionPlanID: ultraPlan.ID, SizeTierID: "ult-tier51-100", MinEmployees: 51, MaxEmployees: 100, PricePerMonth: decimal.NewFromFloat(719000), PricePerYear: decimal.NewFromFloat(7190000)},
		{SubscriptionPlanID: ultraPlan.ID, SizeTierID: "ult-tier101-250", MinEmployees: 101, MaxEmployees: 250, PricePerMonth: decimal.NewFromFloat(1199000), PricePerYear: decimal.NewFromFloat(11990000)},
	}

	if err := db.Create(&seatPlans).Error; err != nil {
		return fmt.Errorf("failed to seed seat plans: %w", err)
	}

	log.Println("Successfully seeded Seat Plans table.")
	return nil
}

func seedSubscriptionPlanFeatures(db *gorm.DB) error {
	var count int64
	db.Model(&domain.SubscriptionPlanFeature{}).Count(&count)
	if count > 0 {
		log.Println("Subscription plan features table already seeded.")
		return nil
	}

	// Get plans and features
	var standardPlan, premiumPlan, ultraPlan domain.SubscriptionPlan
	db.Where("plan_type = ?", enums.PlanStandard).First(&standardPlan)
	db.Where("plan_type = ?", enums.PlanPremium).First(&premiumPlan)
	db.Where("plan_type = ?", enums.PlanUltra).First(&ultraPlan)

	var features []domain.SubscriptionFeature
	db.Find(&features)

	// Create feature mappings
	featureMap := make(map[string]uint)
	for _, feature := range features {
		featureMap[feature.Code] = feature.ID
	}

	var planFeatures []domain.SubscriptionPlanFeature

	// Standard Plan Features
	standardFeatures := []string{"employee_database", "manual_attendance", "clock_in_out", "attendance_status", "leave_requests", "employee_dashboard"}
	for _, featureCode := range standardFeatures {
		if featureID, exists := featureMap[featureCode]; exists {
			planFeatures = append(planFeatures, domain.SubscriptionPlanFeature{
				SubscriptionPlanID:   standardPlan.ID,
				SubscriptionFeatureID: featureID,
				IsEnabled:            true,
			})
		}
	}

	// Premium Plan Features (includes Standard + Premium specific)
	premiumFeatures := append(standardFeatures, "admin_dashboard", "gps_attendance", "work_schedule", "tax_overtime", "fingerprint_integration", "attendance_reports")
	for _, featureCode := range premiumFeatures {
		if featureID, exists := featureMap[featureCode]; exists {
			planFeatures = append(planFeatures, domain.SubscriptionPlanFeature{
				SubscriptionPlanID:   premiumPlan.ID,
				SubscriptionFeatureID: featureID,
				IsEnabled:            true,
			})
		}
	}

	// Ultra Plan Features (includes all features)
	ultraFeatures := append(premiumFeatures, "face_recognition", "auto_checkout", "turnover_analytics", "custom_dashboards", "custom_overtime", "hr_documents", "subscription_management")
	for _, featureCode := range ultraFeatures {
		if featureID, exists := featureMap[featureCode]; exists {
			planFeatures = append(planFeatures, domain.SubscriptionPlanFeature{
				SubscriptionPlanID:   ultraPlan.ID,
				SubscriptionFeatureID: featureID,
				IsEnabled:            false,
			})
		}
	}

	if err := db.Create(&planFeatures).Error; err != nil {
		return fmt.Errorf("failed to seed subscription plan features: %w", err)
	}

	log.Println("Successfully seeded Subscription Plan Features table.")
	return nil
}

func seedAdminUser(db *gorm.DB) error {
	var count int64
	db.Model(&domain.User{}).Where("email = ?", "admin@example.com").Count(&count)
	if count > 0 {
		log.Println("Admin user already exists.")
		return nil
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash admin password: %w", err)
	}
	_ = hashedPassword

	adminUser := domain.User{
		Email: "admin@example.com",
		Role:  enums.RoleAdmin,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return fmt.Errorf("failed to seed admin user: %w", err)
	}

	adminPosition := domain.Position{}
	db.Where("code = ?", "SPRADM").First(&adminPosition)
	if adminPosition.ID == 0 {
		log.Println("Warning: Could not find Super Admin position for admin employee seed.")
	} else {
		adminEmployee := domain.Employee{
			UserID:     adminUser.ID,
			FirstName:  "Default",
			LastName:   func() *string { s := "Admin"; return &s }(),
			PositionID: adminPosition.ID,
		}
		if err := db.Create(&adminEmployee).Error; err != nil {
			_ = db.Delete(&adminUser)
			return fmt.Errorf("failed to seed admin employee: %w", err)
		}
	}

	log.Println("Successfully seeded Admin user and employee.")
	return nil
}

// Run runs all the seeders.
func Run(db *gorm.DB) error {
	if err := seedPositions(db); err != nil {
		return err
	}

	if err := seedSubscriptionFeatures(db); err != nil {
		return err
	}

	if err := seedSubscriptionPlans(db); err != nil {
		return err
	}

	if err := seedSeatPlans(db); err != nil {
		return err
	}

	if err := seedSubscriptionPlanFeatures(db); err != nil {
		return err
	}

	if err := seedAdminUser(db); err != nil {
		return err
	}

	log.Println("All seeders completed successfully.")
	return nil
}
