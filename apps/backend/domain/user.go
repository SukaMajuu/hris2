package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type User struct {
	ID            uint              `gorm:"primaryKey"`
	SupabaseUID   *string           `gorm:"column:supabase_uid;type:varchar(36);unique"`
	Email         string            `gorm:"type:varchar(255);unique"`
	Password      string            `gorm:"-"`
	Phone         string            `gorm:"type:varchar(20);unique;default:null"`
	Role          enums.UserRole    `gorm:"type:user_role;not null;default:admin"`
	LastLoginAt   *time.Time        `gorm:"type:timestamp"`
	CreatedAt     time.Time         `gorm:"autoCreateTime"`
	UpdatedAt     time.Time         `gorm:"autoUpdateTime"`
}

func (a *User) TableName() string {
	return "users"
}
