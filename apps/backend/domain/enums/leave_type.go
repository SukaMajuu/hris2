package enums

import (
	"database/sql/driver"
	"fmt"
)
// LeaveType represents the type of leave an employee can take.
// It implements the sql.Scanner and driver.Valuer interfaces for database operations.
type LeaveType string

const (
	SickLeave         LeaveType = "Sick Leave"          // Sick Leave
	CompasionateLeave LeaveType = "Compassionate Leave" // Compassionate Leave
	MaternityLeave    LeaveType = "Maternity Leave"     // Maternity Leave
	AnnualLeave       LeaveType = "Annual Leave"        // Annual Leave
	MarriageLeave     LeaveType = "Marriage Leave"      // Marriage Leave
)

func (lt *LeaveType) Scan(value interface{}) error {
	s, ok := value.(string)
	if !ok {
		return fmt.Errorf("failed to scan LeaveType: invalid type %T", value)
	}
	*lt = LeaveType(s)
	return nil
}

func (lt LeaveType) Value() (driver.Value, error) {
	return string(lt), nil
}
