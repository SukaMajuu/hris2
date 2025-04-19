package enums

import (
	"database/sql/driver"
	"fmt"
)

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

// Implement Scanner and Valuer interfaces for GORM compatibility
func (ur *UserRole) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan UserRole: invalid type %T", value)
	}
	*ur = UserRole(s)
	// Optional: Add validation to ensure it's one of the known roles
	return nil
}

func (ur UserRole) Value() (driver.Value, error) {
	return string(ur), nil
}
