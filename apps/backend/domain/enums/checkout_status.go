package enums

import (
	"database/sql/driver"
	"fmt"
)

type CheckoutStatus string

const (
	CheckoutInitiated CheckoutStatus = "initiated"
	CheckoutPending   CheckoutStatus = "pending"
	CheckoutCompleted CheckoutStatus = "completed"
	CheckoutFailed    CheckoutStatus = "failed"
	CheckoutCancelled CheckoutStatus = "canceled"
	CheckoutExpired   CheckoutStatus = "expired"
)

func (cs *CheckoutStatus) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan CheckoutStatus: invalid type %T", value)
	}
	*cs = CheckoutStatus(s)
	return nil
}

func (cs CheckoutStatus) Value() (driver.Value, error) {
	return string(cs), nil
}
