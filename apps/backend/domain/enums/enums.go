package enums

type UserRole string
type EmploymentStatus string
type WorkArrangementType string
type EventType string
type AttendanceStatus string
type RegulationType string
type DocumentStatus string
type BillingStatus string
type PaymentStatus string

const (
	RoleAdmin    UserRole = "admin"
	RoleHR       UserRole = "hr"
	RoleEmployee UserRole = "employee"

	EmploymentStatusActive   EmploymentStatus = "active"
	EmploymentStatusInactive EmploymentStatus = "inactive"

	WorkArrangementWFA WorkArrangementType = "WFA"
	WorkArrangementWFO WorkArrangementType = "WFO"
	WorkArrangementWFH WorkArrangementType = "WFH"

	EventTypeCheckIn  EventType = "check_in"
	EventTypeCheckOut EventType = "check_out"

	AttendanceStatusPresent AttendanceStatus = "present"
	AttendanceStatusAbsent  AttendanceStatus = "absent"
	AttendanceStatusLate    AttendanceStatus = "late"

	RegulationTypeGovernment RegulationType = "government"
	RegulationTypeCompany    RegulationType = "company"

	BillingStatusUnpaid BillingStatus = "unpaid"
	BillingStatusPaid   BillingStatus = "paid"

	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
)
