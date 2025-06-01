package enums

import (
	"database/sql/driver"
	"fmt"
)

type SubscriptionStatus string

const (
	StatusTrial     SubscriptionStatus = "trial"
	StatusActive    SubscriptionStatus = "active"
	StatusInactive  SubscriptionStatus = "inactive"
	StatusSuspended SubscriptionStatus = "suspended"
	StatusExpired   SubscriptionStatus = "expired"
	StatusCancelled SubscriptionStatus = "cancelled"
)

func (ss *SubscriptionStatus) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan SubscriptionStatus: invalid type %T", value)
	}
	*ss = SubscriptionStatus(s)
	return nil
}

func (ss SubscriptionStatus) Value() (driver.Value, error) {
	return string(ss), nil
}
