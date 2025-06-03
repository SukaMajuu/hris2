package checkclock_settings

import (
	"time"

	employeedto "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	workscheduledto "github.com/SukaMajuu/hris/apps/backend/domain/dto/work_schedule"
)

type CheckclockSettingsResponseDTO struct {
	ID             uint                                     `json:"id"`
	EmployeeID     uint                                     `json:"employee_id"`
	WorkScheduleID uint                                     `json:"work_schedule_id"`
	Employee       *employeedto.EmployeeResponseDTO         `json:"employee,omitempty"`
	WorkSchedule   *workscheduledto.WorkScheduleResponseDTO `json:"work_schedule,omitempty"`
	CreatedAt      time.Time                                `json:"created_at"`
	UpdatedAt      time.Time                                `json:"updated_at"`
}

type CheckclockSettingsListResponseDTO struct {
	Data []CheckclockSettingsResponseDTO `json:"data"`
	Meta PaginationMeta                  `json:"meta"`
}

type PaginationMeta struct {
	Total       int64 `json:"total"`
	Page        int   `json:"page"`
	PageSize    int   `json:"page_size"`
	TotalPages  int   `json:"total_pages"`
	HasNext     bool  `json:"has_next"`
	HasPrevious bool  `json:"has_previous"`
}
