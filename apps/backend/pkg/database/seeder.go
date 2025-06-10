package database

import (
	"crypto/rand"
	"fmt"
	"log"
	"math/big"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

// secureRandInt generates a secure random integer in the range [0, max)
func secureRandInt(max int) int {
	if max <= 0 {
		return 0
	}
	n, err := rand.Int(rand.Reader, big.NewInt(int64(max)))
	if err != nil {
		// Fallback to 0 if random generation fails
		return 0
	}
	return int(n.Int64())
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

	adminEmployee := domain.Employee{
		UserID:       adminUser.ID,
		FirstName:    "Default",
		LastName:     func() *string { s := "Admin"; return &s }(),
		PositionName: "HR Manager",
	}
	if err := db.Create(&adminEmployee).Error; err != nil {
		_ = db.Delete(&adminUser)
		return fmt.Errorf("failed to seed admin employee: %w", err)
	}

	// Create premium subscription for admin user
	var premiumPlan domain.SubscriptionPlan
	var premiumSeatPlan domain.SeatPlan

	// Get premium plan and its 51-100 seat tier
	if err := db.Where("plan_type = ?", enums.PlanPremium).First(&premiumPlan).Error; err != nil {
		_ = db.Delete(&adminEmployee)
		_ = db.Delete(&adminUser)
		return fmt.Errorf("failed to find premium plan: %w", err)
	}

	if err := db.Where("subscription_plan_id = ? AND size_tier_id = ?", premiumPlan.ID, "pre-tier51-100").First(&premiumSeatPlan).Error; err != nil {
		_ = db.Delete(&adminEmployee)
		_ = db.Delete(&adminUser)
		return fmt.Errorf("failed to find premium seat plan (51-100): %w", err)
	}

	// Create subscription with trial status
	adminSubscription := domain.Subscription{
		AdminUserID:          adminUser.ID,
		SubscriptionPlanID:   premiumPlan.ID,
		SeatPlanID:           premiumSeatPlan.ID,
		Status:               enums.StatusTrial,
		IsTrialUsed:          false,
		StartDate:            time.Now().UTC(),
		IsAutoRenew:          true,
		CurrentEmployeeCount: 1, // Admin employee
	}

	// Start trial
	adminSubscription.StartTrial()

	if err := db.Create(&adminSubscription).Error; err != nil {
		_ = db.Delete(&adminEmployee)
		_ = db.Delete(&adminUser)
		return fmt.Errorf("failed to seed admin subscription: %w", err)
	}

	log.Println("Successfully seeded Admin user, employee, and premium subscription (51-100 seats).")
	return nil
}

func seedLocations(db *gorm.DB) error {
	// Check if our specific locations exist
	var headOfficeCount, branchOfficeCount, remoteLocationCount int64
	db.Model(&domain.Location{}).Where("name = ?", "Head Office").Count(&headOfficeCount)
	db.Model(&domain.Location{}).Where("name = ?", "Branch Office Bandung").Count(&branchOfficeCount)
	db.Model(&domain.Location{}).Where("name = ?", "Remote Work Location").Count(&remoteLocationCount)

	if headOfficeCount > 0 && branchOfficeCount > 0 && remoteLocationCount > 0 {
		log.Println("Locations table already seeded.")
		return nil
	}

	// Get admin user to assign as creator
	var adminUser domain.User
	if err := db.Where("role = ?", enums.RoleAdmin).First(&adminUser).Error; err != nil {
		return fmt.Errorf("failed to find admin user: %w", err)
	}

	locations := []domain.Location{
		{
			Name:          "Head Office",
			AddressDetail: "Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta",
			Latitude:      -6.208763,
			Longitude:     106.845599,
			RadiusM:       100,
			CreatedBy:     adminUser.ID,
		},
		{
			Name:          "Branch Office Bandung",
			AddressDetail: "Jl. Asia Afrika No. 456, Bandung, Jawa Barat",
			Latitude:      -6.921831,
			Longitude:     107.607048,
			RadiusM:       150,
			CreatedBy:     adminUser.ID,
		},
		{
			Name:          "Remote Work Location",
			AddressDetail: "Work From Anywhere Location",
			Latitude:      0.0,
			Longitude:     0.0,
			RadiusM:       0,
			CreatedBy:     adminUser.ID,
		},
	}

	if err := db.Create(&locations).Error; err != nil {
		return fmt.Errorf("failed to seed locations: %w", err)
	}

	log.Println("Successfully seeded Locations table.")
	return nil
}

func seedWorkSchedules(db *gorm.DB) error {
	var count int64
	db.Model(&domain.WorkSchedule{}).Count(&count)
	if count > 0 {
		log.Println("Work schedules table already seeded.")
		return nil
	}

	// Get admin user to assign as creator
	var adminUser domain.User
	if err := db.Where("role = ?", enums.RoleAdmin).First(&adminUser).Error; err != nil {
		return fmt.Errorf("failed to find admin user: %w", err)
	}

	// Get locations - check if they exist first
	var headOffice, branchOffice, remoteLocation domain.Location
	if err := db.Where("name = ?", "Head Office").First(&headOffice).Error; err != nil {
		return fmt.Errorf("failed to find Head Office location: %w", err)
	}
	if err := db.Where("name = ?", "Branch Office Bandung").First(&branchOffice).Error; err != nil {
		return fmt.Errorf("failed to find Branch Office Bandung location: %w", err)
	}
	if err := db.Where("name = ?", "Remote Work Location").First(&remoteLocation).Error; err != nil {
		return fmt.Errorf("failed to find Remote Work Location: %w", err)
	}

	// Helper function to create time pointers
	timePtr := func(hour, minute int) *time.Time {
		t := time.Date(0, 1, 1, hour, minute, 0, 0, time.Local)
		return &t
	}
	workSchedules := []domain.WorkSchedule{
		{
			Name:      "Standard Office Hours",
			WorkType:  enums.WorkTypeWFO,
			CreatedBy: adminUser.ID, // Set the admin user ID who creates the work schedule
			Details: []domain.WorkScheduleDetail{
				{
					WorktypeDetail: enums.WorkTypeWFO,
					WorkDays:       []domain.Days{domain.Monday, domain.Tuesday, domain.Wednesday, domain.Thursday, domain.Friday},
					CheckinStart:   timePtr(8, 0),  // 08:00
					CheckinEnd:     timePtr(9, 0),  // 09:00
					BreakStart:     timePtr(12, 0), // 12:00
					BreakEnd:       timePtr(13, 0), // 13:00
					CheckoutStart:  timePtr(17, 0), // 17:00
					CheckoutEnd:    timePtr(18, 0), // 18:00
					LocationID:     &headOffice.ID,
				},
			},
		},
		{
			Name:      "Flexible Remote Work",
			WorkType:  enums.WorkTypeWFA,
			CreatedBy: adminUser.ID, // Set the admin user ID who creates the work schedule
			Details: []domain.WorkScheduleDetail{
				{
					WorktypeDetail: enums.WorkTypeWFA,
					WorkDays:       []domain.Days{domain.Monday, domain.Tuesday, domain.Wednesday, domain.Thursday, domain.Friday},
					CheckinStart:   timePtr(8, 0),  // 08:00
					CheckinEnd:     timePtr(10, 0), // 10:00
					BreakStart:     timePtr(12, 0), // 12:00
					BreakEnd:       timePtr(13, 0), // 13:00
					CheckoutStart:  timePtr(16, 0), // 16:00
					CheckoutEnd:    timePtr(18, 0), // 18:00
					LocationID:     &remoteLocation.ID,
				},
			},
		},
		{
			Name:      "Hybrid Work Schedule",
			WorkType:  enums.WorkTypeHybrid,
			CreatedBy: adminUser.ID, // Set the admin user ID who creates the work schedule
			Details: []domain.WorkScheduleDetail{
				{
					WorktypeDetail: enums.WorkTypeWFO,
					WorkDays:       []domain.Days{domain.Monday, domain.Wednesday, domain.Friday},
					CheckinStart:   timePtr(8, 0),  // 08:00
					CheckinEnd:     timePtr(9, 0),  // 09:00
					BreakStart:     timePtr(12, 0), // 12:00
					BreakEnd:       timePtr(13, 0), // 13:00
					CheckoutStart:  timePtr(17, 0), // 17:00
					CheckoutEnd:    timePtr(18, 0), // 18:00
					LocationID:     &headOffice.ID,
				},
				{
					WorktypeDetail: enums.WorkTypeWFA,
					WorkDays:       []domain.Days{domain.Tuesday, domain.Thursday},
					CheckinStart:   timePtr(8, 0),  // 08:00
					CheckinEnd:     timePtr(10, 0), // 10:00
					BreakStart:     timePtr(12, 0), // 12:00
					BreakEnd:       timePtr(13, 0), // 13:00
					CheckoutStart:  timePtr(16, 0), // 16:00
					CheckoutEnd:    timePtr(18, 0), // 18:00
					LocationID:     &remoteLocation.ID,
				},
			},
		},
	}

	if err := db.Create(&workSchedules).Error; err != nil {
		return fmt.Errorf("failed to seed work schedules: %w", err)
	}

	log.Println("Successfully seeded Work Schedules table.")
	return nil
}

func seedDemoEmployees(db *gorm.DB) error {
	var count int64
	db.Model(&domain.User{}).Where("email LIKE ?", "%demo%").Count(&count)
	if count > 0 {
		log.Println("Demo employees already seeded.")
		return nil
	}

	// Get work schedule for demo employees
	var standardSchedule domain.WorkSchedule
	db.Where("name = ?", "Standard Office Hours").First(&standardSchedule)

	// Demo users and employees
	demoUsers := []struct {
		User     domain.User
		Employee domain.Employee
	}{
		{
			User: domain.User{
				Email:    "john.doe@demo.com",
				Password: "password123",
				Role:     enums.RoleUser,
			},
			Employee: domain.Employee{
				FirstName:    "John",
				LastName:     func() *string { s := "Doe"; return &s }(),
				PositionName: "Software Developer",
			},
		},
		{
			User: domain.User{
				Email:    "jane.smith@demo.com",
				Password: "password123",
				Role:     enums.RoleUser,
			},
			Employee: domain.Employee{
				FirstName:    "Jane",
				LastName:     func() *string { s := "Smith"; return &s }(),
				PositionName: "Product Manager",
			},
		},
		{
			User: domain.User{
				Email:    "mike.wilson@demo.com",
				Password: "password123",
				Role:     enums.RoleUser,
			},
			Employee: domain.Employee{
				FirstName:    "Mike",
				LastName:     func() *string { s := "Wilson"; return &s }(),
				PositionName: "UI/UX Designer",
			},
		},
	}

	for _, demo := range demoUsers {
		if err := db.Create(&demo.User).Error; err != nil {
			return fmt.Errorf("failed to seed demo user %s: %w", demo.User.Email, err)
		}

		demo.Employee.UserID = demo.User.ID
		demo.Employee.WorkScheduleID = &standardSchedule.ID
		if err := db.Create(&demo.Employee).Error; err != nil {
			_ = db.Delete(&demo.User)
			return fmt.Errorf("failed to seed demo employee for %s: %w", demo.User.Email, err)
		}

		log.Printf("Successfully created demo employee: %s", demo.User.Email)
	}

	log.Println("Successfully seeded Demo Employees.")
	return nil
}

func seedAttendances(db *gorm.DB) error {
	var count int64
	db.Model(&domain.Attendance{}).Count(&count)
	if count > 0 {
		log.Println("Attendance table already seeded.")
		return nil
	}

	// Get all demo employees with their work schedules
	var employees []domain.Employee
	db.Preload("WorkSchedule").Where("first_name IN ?", []string{"John", "Jane", "Mike"}).Find(&employees)

	if len(employees) == 0 {
		log.Println("No demo employees found. Skipping attendance seeding.")
		return nil
	}

	now := time.Now().UTC()
	var attendances []domain.Attendance

	// Define all attendance statuses to showcase (without Leave)
	allStatuses := []domain.AttendanceStatus{
		domain.OnTime,
		domain.OnTime, // More on-time records
		domain.Late,
		domain.EarlyLeave,
		domain.Absent,
		domain.OnTime, // More on-time records
		domain.Late,
		domain.OnTime,
	}

	for _, employee := range employees {
		// Skip if employee doesn't have a work schedule
		if employee.WorkSchedule == nil {
			log.Printf("Employee %s doesn't have a work schedule, skipping attendance seeding", employee.FirstName)
			continue
		}

		// Generate 8 attendance records for each employee
		weekdayCount := 0
		dateOffset := 1

		for weekdayCount < 8 {
			date := now.AddDate(0, 0, -dateOffset)

			// Skip weekends
			if date.Weekday() == time.Saturday || date.Weekday() == time.Sunday {
				dateOffset++
				continue
			}

			var attendance domain.Attendance
			attendance.EmployeeID = employee.ID
			attendance.Date = date

			// Assign status based on predefined pattern
			status := allStatuses[weekdayCount]
			attendance = generateAttendanceByStatus(attendance, date, status)

			attendances = append(attendances, attendance)
			weekdayCount++
			dateOffset++
		}
	}

	if len(attendances) > 0 {
		if err := db.Create(&attendances).Error; err != nil {
			return fmt.Errorf("failed to seed attendances: %w", err)
		}
	}

	log.Printf("Successfully seeded %d attendance records.", len(attendances))
	return nil
}

func generateAttendanceByStatus(attendance domain.Attendance, date time.Time, status domain.AttendanceStatus) domain.Attendance {
	attendance.Status = status

	// Head office coordinates
	lat := -6.208763
	long := 106.845599

	switch status {
	case domain.OnTime:
		// Standard work hours: 8:00 AM - 5:00 PM
		clockIn := time.Date(date.Year(), date.Month(), date.Day(), 8, 0, 0, 0, time.UTC)
		clockOut := time.Date(date.Year(), date.Month(), date.Day(), 17, 0, 0, 0, time.UTC)
		// Add small variation (0-15 minutes)
		clockIn = clockIn.Add(time.Duration(secureRandInt(15)) * time.Minute)
		clockOut = clockOut.Add(time.Duration(secureRandInt(15)) * time.Minute)

		workHours := clockOut.Sub(clockIn).Hours() - 1.0 // Subtract 1 hour for lunch

		attendance.ClockIn = &clockIn
		attendance.ClockOut = &clockOut
		attendance.WorkHours = &workHours
		attendance.ClockInLat = &lat
		attendance.ClockInLong = &long
		attendance.ClockOutLat = &lat
		attendance.ClockOutLong = &long

	case domain.Late:
		// Late arrival: 8:30 AM - 9:30 AM
		clockIn := time.Date(date.Year(), date.Month(), date.Day(), 8, 30, 0, 0, time.UTC)
		clockIn = clockIn.Add(time.Duration(secureRandInt(60)) * time.Minute) // 30-90 min late
		clockOut := time.Date(date.Year(), date.Month(), date.Day(), 17, 30, 0, 0, time.UTC)

		workHours := clockOut.Sub(clockIn).Hours() - 1.0

		attendance.ClockIn = &clockIn
		attendance.ClockOut = &clockOut
		attendance.WorkHours = &workHours
		attendance.ClockInLat = &lat
		attendance.ClockInLong = &long
		attendance.ClockOutLat = &lat
		attendance.ClockOutLong = &long

	case domain.EarlyLeave:
		// Early leave: Clock out between 3:00 PM - 4:30 PM
		clockIn := time.Date(date.Year(), date.Month(), date.Day(), 8, 0, 0, 0, date.Location())
		clockOut := time.Date(date.Year(), date.Month(), date.Day(), 15, 0, 0, 0, date.Location())
		clockOut = clockOut.Add(time.Duration(secureRandInt(90)) * time.Minute) // Leave between 3:00-4:30 PM

		workHours := clockOut.Sub(clockIn).Hours() - 1.0

		attendance.ClockIn = &clockIn
		attendance.ClockOut = &clockOut
		attendance.WorkHours = &workHours
		attendance.ClockInLat = &lat
		attendance.ClockInLong = &long
		attendance.ClockOutLat = &lat
		attendance.ClockOutLong = &long

	case domain.Absent:
		// No clock in/out data for absent
		break
	}

	return attendance
}

func Run(db *gorm.DB) error {
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

	if err := seedLocations(db); err != nil {
		return err
	}

	if err := seedWorkSchedules(db); err != nil {
		return err
	}

	if err := seedDemoEmployees(db); err != nil {
		return err
	}

	if err := seedAttendances(db); err != nil {
		return err
	}

	log.Println("All seeders completed successfully.")
	return nil
}
