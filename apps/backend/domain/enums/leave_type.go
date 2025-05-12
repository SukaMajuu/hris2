package enums

import (
	"database/sql/driver"
	"fmt"
)
// LeaveType represents the type of leave an employee can take.
// It implements the sql.Scanner and driver.Valuer interfaces for database operations.
type LeaveType string

const (
	SickLeave         LeaveType = "sick_leave"          // Sick Leave
	CompasionateLeave LeaveType = "compassionate_leave" // Compassionate Leave
	MaternityLeave    LeaveType = "maternity_leave"     // Maternity Leave
	AnnualLeave       LeaveType = "annual_leave"        // Annual Leave
	MarriageLeave     LeaveType = "marriage_leave"      // Marriage Leave
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
