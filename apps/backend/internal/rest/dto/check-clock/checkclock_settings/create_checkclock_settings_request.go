package checkclock_settings

import "github.com/go-playground/validator/v10"

type CreateCheckclockSettingsRequest struct {
	EmployeeID     uint `json:"employee_id" validate:"required"`
	WorkScheduleID uint `json:"work_schedule_id" validate:"required"`
}

func (r *CreateCheckclockSettingsRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
