package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type OvertimeType struct {
    ID             uint          `gorm:"primaryKey"`
    Name           string        `gorm:"type:varchar(255);not null"`
    RegulationType enums.RegulationType `gorm:"type:regulation_type;not null"`
    Description    string        `gorm:"type:text"`
    Active         bool          `gorm:"not null;default:true"`
    CreatedAt      time.Time     `gorm:"autoCreateTime"`
    UpdatedAt      time.Time     `gorm:"autoUpdateTime"`
}
