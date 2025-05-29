package checkclock_settings

import "time"

type CheckclockSettingsResponseDTO struct {
	ID             uint      `json:"id"`
	EmployeeID     uint      `json:"employee_id"`
	WorkScheduleID uint      `json:"work_schedule_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
