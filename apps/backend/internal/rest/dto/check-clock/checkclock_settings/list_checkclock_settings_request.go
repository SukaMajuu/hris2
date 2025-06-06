package checkclock_settings

type ListCheckclockSettingsRequestQuery struct {
	Page           int    `form:"page" binding:"omitempty,min=1"`
	PageSize       int    `form:"page_size" binding:"omitempty,min=1,max=100"`
	Name           string `form:"name" binding:"omitempty"`
	Position       string `form:"position" binding:"omitempty"`
	WorkType       string `form:"work_type" binding:"omitempty"`
	WorkScheduleID string `form:"work_schedule_id" binding:"omitempty"`
}
