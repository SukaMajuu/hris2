package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type WorkArrangement struct {
    ID        uint                `gorm:"primaryKey"`
    Name      string              `gorm:"type:varchar(255);not null"`
    Type      enums.WorkArrangementType `gorm:"type:work_arrangement_type;not null"`
    IsDefault bool                `gorm:"default:false"`
    CreatedAt time.Time          `gorm:"autoCreateTime"`
    UpdatedAt time.Time          `gorm:"autoUpdateTime"`
}
