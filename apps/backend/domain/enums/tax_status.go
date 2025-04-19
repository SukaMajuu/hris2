package enums

import (
	"database/sql/driver"
	"fmt"
)

type TaxStatus string

const (
	TK0 TaxStatus = "TK/0" // Tidak Kawin, 0 Tanggungan
	TK1 TaxStatus = "TK/1" // Tidak Kawin, 1 Tanggungan
	TK2 TaxStatus = "TK/2" // Tidak Kawin, 2 Tanggungan
	TK3 TaxStatus = "TK/3" // Tidak Kawin, 3 Tanggungan

	K0  TaxStatus = "K/0"  // Kawin, 0 Tanggungan
	K1  TaxStatus = "K/1"  // Kawin, 1 Tanggungan
	K2  TaxStatus = "K/2"  // Kawin, 2 Tanggungan
	K3  TaxStatus = "K/3"  // Kawin, 3 Tanggungan

	KI0 TaxStatus = "K/I/0" // Kawin, Istri Bekerja (Penghasilan Digabung), 0 Tanggungan
	KI1 TaxStatus = "K/I/1" // Kawin, Istri Bekerja (Penghasilan Digabung), 1 Tanggungan
	KI2 TaxStatus = "K/I/2" // Kawin, Istri Bekerja (Penghasilan Digabung), 2 Tanggungan
	KI3 TaxStatus = "K/I/3" // Kawin, Istri Bekerja (Penghasilan Digabung), 3 Tanggungan
)

func (ts *TaxStatus) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan TaxStatus: invalid type %T", value)
	}
	*ts = TaxStatus(s)
	// Optional: Add validation here to ensure scanned value is one of the known constants
	return nil
}

func (ts TaxStatus) Value() (driver.Value, error) {
	return string(ts), nil
}
