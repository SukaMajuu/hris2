package enums

import (
	"database/sql/driver"
	"fmt"
)

type WorkType string

const (
	WorkTypeWFO    WorkType = "WFO"    // Work From Office
	WorkTypeWFH    WorkType = "WFH"    // Work From Home
	WorkTypeWFA	   WorkType = "WFA"    // Work From Anywhere
	WorkTypeHybrid WorkType = "Hybrid" // Hybrid Work
)

func (wt *WorkType) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan WorkType: invalid type %T", value)
	}
	*wt = WorkType(s)
	return nil
}

func (wt WorkType) Value() (driver.Value, error) {
	return string(wt), nil
}