package enums

import (
	"database/sql/driver"
	"fmt"
)

type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "pending"
	PaymentPaid      PaymentStatus = "paid"
	PaymentFailed    PaymentStatus = "failed"
	PaymentCancelled PaymentStatus = "canceled"
	PaymentExpired   PaymentStatus = "expired"
	PaymentRefunded  PaymentStatus = "refunded"
)

func (ps *PaymentStatus) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan PaymentStatus: invalid type %T", value)
	}
	*ps = PaymentStatus(s)
	return nil
}

func (ps PaymentStatus) Value() (driver.Value, error) {
	return string(ps), nil
}
