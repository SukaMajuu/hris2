package domain

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
)

type Days string

const (
	Monday    Days = "Monday"
	Tuesday   Days = "Tuesday"
	Wednesday Days = "Wednesday"
	Thursday  Days = "Thursday"
	Friday    Days = "Friday"
	Saturday  Days = "Saturday"
	Sunday    Days = "Sunday"
)

type WorkSchedule struct {
	ID       uint                 `gorm:"primaryKey"`
	Name     string               `gorm:"type:varchar(255);not null"`
	WorkType enums.WorkType       `gorm:"type:work_type;not null"`
	Details  []WorkScheduleDetail `gorm:"foreignKey:WorkScheduleID"`

	CreatedAt time.Time `gorm:"autoCreateTime"` // Corrected casing
	UpdatedAt time.Time `gorm:"autoUpdateTime"` // Corrected casing
}

func (ws *WorkSchedule) TableName() string {
	return "work_schedules"
}

type WorkScheduleDetail struct {
	ID             uint           `gorm:"primaryKey"`
	WorkScheduleID uint           `gorm:"not null"`
	WorktypeDetail enums.WorkType `gorm:"type:work_type;not null"`    // Diubah dari worktype_detail ke work_type
	WorkDays       []Days         `gorm:"type:jsonb;serializer:json"` // Diubah dari type:work_days ke type:jsonb
	CheckinStart   *time.Time     `gorm:"type:time"`
	CheckinEnd     *time.Time     `gorm:"type:time"`
	BreakStart     *time.Time     `gorm:"type:time"`
	BreakEnd       *time.Time     `gorm:"type:time"`
	CheckoutStart  *time.Time     `gorm:"type:time"`
	CheckoutEnd    *time.Time     `gorm:"type:time"`
	LocationID     *uint          `gorm:"type:uint"` // FK ke tabel location
	Location       *Location      `gorm:"foreignKey:LocationID"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (wsd *WorkScheduleDetail) TableName() string {
	return "work_schedule_details"
}
