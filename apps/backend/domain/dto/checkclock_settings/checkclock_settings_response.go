package checkclock_settings

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
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

type CheckclockSettingsListResponseData struct {
	Items      []*CheckclockSettingsResponseDTO `json:"items"`
	Pagination domain.Pagination                `json:"pagination"`
}

// ToCheckclockSettingsResponseDTO converts a domain CheckclockSettings to a response DTO
func ToCheckclockSettingsResponseDTO(settings *domain.CheckclockSettings) *CheckclockSettingsResponseDTO {
	if settings == nil {
		return nil
	}

	dto := &CheckclockSettingsResponseDTO{
		ID:             settings.ID,
		EmployeeID:     settings.EmployeeID,
		WorkScheduleID: settings.WorkScheduleID,
		CreatedAt:      settings.CreatedAt,
		UpdatedAt:      settings.UpdatedAt,
	}

	if settings.Employee.ID != 0 {
		dto.Employee = &employeedto.EmployeeResponseDTO{
			ID:           settings.Employee.ID,
			FirstName:    settings.Employee.FirstName,
			LastName:     settings.Employee.LastName,
			PositionName: settings.Employee.Position.Name,
		}

		// Set email from User relationship if exists
		if settings.Employee.User.Email != "" {
			dto.Employee.Email = &settings.Employee.User.Email
		}
	}

	if settings.WorkSchedule.ID != 0 {
		dto.WorkSchedule = &workscheduledto.WorkScheduleResponseDTO{
			ID:   settings.WorkSchedule.ID,
			Name: settings.WorkSchedule.Name,
		}
	}

	return dto
}
