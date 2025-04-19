package enums

import (
	"database/sql/driver"
	"fmt"
)

type Gender string

const (
	Male   Gender = "Male"
	Female Gender = "Female"
)

// Implement Scanner and Valuer interfaces for GORM compatibility
func (g *Gender) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan Gender: invalid type %T", value)
	}
	*g = Gender(s)
	return nil
}

func (g Gender) Value() (driver.Value, error) {
	return string(g), nil
}
