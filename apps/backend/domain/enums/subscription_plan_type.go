package enums

import (
	"database/sql/driver"
	"fmt"
)

type SubscriptionPlanType string

const (
	PlanStandard SubscriptionPlanType = "standard"
	PlanPremium  SubscriptionPlanType = "premium"
	PlanUltra    SubscriptionPlanType = "ultra"
)

func (spt *SubscriptionPlanType) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan SubscriptionPlanType: invalid type %T", value)
	}
	*spt = SubscriptionPlanType(s)
	return nil
}

func (spt SubscriptionPlanType) Value() (driver.Value, error) {
	return string(spt), nil
}
