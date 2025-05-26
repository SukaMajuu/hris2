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

func (ur *UserRole) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan UserRole: invalid type %T", value)
	}
	*ur = UserRole(s)
	return nil
}

func (ur UserRole) Value() (driver.Value, error) {
	return string(ur), nil
}
