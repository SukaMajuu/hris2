package domain

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type RefreshToken struct {
	ID        uint      `gorm:"primaryKey"`
	UserID    uint      `gorm:"not null;index"`
	User      User      `gorm:"foreignKey:UserID"`
	TokenHash string    `gorm:"type:varchar(255);unique;not null"`
	ExpiresAt time.Time `gorm:"not null"`
	Revoked   bool      `gorm:"not null;default:false"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
}

func (rt *RefreshToken) TableName() string {
	return "refresh_tokens"
}

func (rt *RefreshToken) BeforeCreate(tx *gorm.DB) (err error) {
	if rt.TokenHash == "" {
		return fmt.Errorf("token hash is required")
	}
	return
}
