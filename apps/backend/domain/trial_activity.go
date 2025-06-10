package domain

import (
	"time"
)

type TrialActivity struct {
	ID             uint         `gorm:"primaryKey"`
	SubscriptionID uint         `gorm:"not null"`
	Subscription   Subscription `gorm:"foreignKey:SubscriptionID"`
	UserID         uint         `gorm:"not null"`
	User           User         `gorm:"foreignKey:UserID"`

	EmployeesAdded   int        `gorm:"type:int;default:0;not null"`
	FeaturesUsed     string     `gorm:"type:text"`
	LastActivityDate *time.Time `gorm:"type:timestamp"`

	ConvertedToPaid bool       `gorm:"type:boolean;default:false;not null"`
	ConversionDate  *time.Time `gorm:"type:timestamp"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}

func (ta *TrialActivity) TableName() string {
	return "trial_activities"
}

func (ta *TrialActivity) AddFeatureUsage(featureCode string) {
	// This would be implemented to add a feature to the FeaturesUsed JSON array
	// Implementation would depend on your JSON handling preference
}

func (ta *TrialActivity) MarkAsConverted() {
	now := time.Now().UTC()
	ta.ConvertedToPaid = true
	ta.ConversionDate = &now
}
