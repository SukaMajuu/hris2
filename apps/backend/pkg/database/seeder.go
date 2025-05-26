package database

import (
	"fmt"
	"log"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"

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
			UserID:    adminUser.ID,
			FirstName: "Default",
			LastName:  func() *string { s := "Admin"; return &s }(),
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
	if err := seedAdminUser(db); err != nil {
		return err
	}
	// Add calls to other seeders here

	log.Println("All seeders completed successfully.")
	return nil
}
