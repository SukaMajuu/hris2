package database

import (
	"fmt"
	"log"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"

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
		{Code: "admin_dashboard", Name: "Admin Dashboard", Description: "Admin analytics, reports, and management overview with comprehensive business insights"},
		{Code: "employee_dashboard", Name: "Employee Dashboard", Description: "Employee self-service portal and personal overview for individual users"},
		{Code: "employee_management", Name: "Employee Management System", Description: "Complete employee database management including add, edit, delete, search, and CSV import/export (without documents)"},
		{Code: "document_employee_management", Name: "Employee Document Management", Description: "Manage employee documents including contracts, certificates, evaluations, awards, and training records"},
		{Code: "check_clock_settings", Name: "Check-Clock Settings & Configuration", Description: "Configure check-clock locations with GPS/geofencing, work schedules, and location types (WFO/WFA/Hybrid)"},
		{Code: "check_clock_system", Name: "Complete Attendance & Check-Clock System", Description: "Full attendance management: admin attendance management, employee check-in/out, leave requests, and attendance history"},
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
			Description: "Best for small business - Core HR and attendance management",
			IsActive:    true,
		},
		{
			PlanType:    enums.PlanPremium,
			Name:        "Premium",
			Description: "Best for growing business - Complete HR management with document system",
			IsActive:    true,
		},
		{
			PlanType:    enums.PlanUltra,
			Name:        "Ultra",
			Description: "For large enterprises - Advanced HR with overtime management (Coming Soon)",
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

	// Standard Plan Features - Basic HR Management with dashboards
	standardFeatures := []string{
		"admin_dashboard",
		"employee_dashboard",
		"employee_management",
	}
	for _, featureCode := range standardFeatures {
		if featureID, exists := featureMap[featureCode]; exists {
			planFeatures = append(planFeatures, domain.SubscriptionPlanFeature{
				SubscriptionPlanID:    standardPlan.ID,
				SubscriptionFeatureID: featureID,
				IsEnabled:             true,
			})
		}
	}

	// Premium Plan Features - Complete HR System with attendance and documents
	premiumFeatures := append(standardFeatures,
		"check_clock_settings",
		"check_clock_system",
		"document_employee_management",
	)
	for _, featureCode := range premiumFeatures {
		if featureID, exists := featureMap[featureCode]; exists {
			planFeatures = append(planFeatures, domain.SubscriptionPlanFeature{
				SubscriptionPlanID:    premiumPlan.ID,
				SubscriptionFeatureID: featureID,
				IsEnabled:             true,
			})
		}
	}

	// Ultra Plan Features - All current features (but plan is inactive)
	// When overtime features are added, they will be included here
	ultraFeatures := premiumFeatures
	for _, featureCode := range ultraFeatures {
		if featureID, exists := featureMap[featureCode]; exists {
			planFeatures = append(planFeatures, domain.SubscriptionPlanFeature{
				SubscriptionPlanID:    ultraPlan.ID,
				SubscriptionFeatureID: featureID,
				IsEnabled:             false,
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

	adminUser := domain.User{
		Email:    "admin@example.com",
		Password: "password123",
		Role:     enums.RoleAdmin,
	}

	if err := db.Create(&adminUser).Error; err != nil {
		return fmt.Errorf("failed to seed admin user: %w", err)
	}

	adminPosition := domain.Position{}
	db.Where("name = ?", "HR Manager").First(&adminPosition)
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
