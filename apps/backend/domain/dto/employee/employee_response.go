package employee

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtolocation "github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
	"github.com/SukaMajuu/hris/apps/backend/domain/dto/work_schedule"
)

type EmployeeResponseDTO struct {
	ID                    uint                                   `json:"id"`
	Email                 *string                                `json:"email,omitempty"`
	Phone                 *string                                `json:"phone,omitempty"`
	FirstName             string                                 `json:"first_name"`
	LastName              *string                                `json:"last_name,omitempty"`
	EmployeeCode          *string                                `json:"employee_code,omitempty"`
	Branch                *string                                `json:"branch,omitempty"`
	PositionName          string                                 `json:"position_name"`
	Gender                *string                                `json:"gender,omitempty"`
	NIK                   *string                                `json:"nik,omitempty"`
	PlaceOfBirth          *string                                `json:"place_of_birth,omitempty"`
	DateOfBirth           *string                                `json:"date_of_birth,omitempty"`
	LastEducation         *string                                `json:"last_education,omitempty"`
	Grade                 *string                                `json:"grade,omitempty"`
	ContractType          *string                                `json:"contract_type,omitempty"`
	EmploymentStatus      bool                                   `json:"employment_status"`
	HireDate              *string                                `json:"hire_date,omitempty"`
	ResignationDate       *string                                `json:"resignation_date,omitempty"`
	BankName              *string                                `json:"bank_name,omitempty"`
	BankAccountNumber     *string                                `json:"bank_account_number,omitempty"`
	BankAccountHolderName *string                                `json:"bank_account_holder_name,omitempty"`
	TaxStatus             *string                                `json:"tax_status,omitempty"`
	WorkScheduleID        *uint                                  `json:"work_schedule_id,omitempty"`
	WorkSchedule          *work_schedule.WorkScheduleResponseDTO `json:"work_schedule,omitempty"`
	ProfilePhotoURL       *string                                `json:"profile_photo_url,omitempty"`
	CreatedAt             string                                 `json:"created_at"`
	UpdatedAt             string                                 `json:"updated_at"`
}

type EmployeeStatisticsResponseDTO struct {
	TotalEmployees       int64    `json:"total_employees"`
	NewEmployees         int64    `json:"new_employees"`
	ActiveEmployees      int64    `json:"active_employees"`
	ResignedEmployees    int64    `json:"resigned_employees"`
	PermanentEmployees   int64    `json:"permanent_employees"`
	ContractEmployees    int64    `json:"contract_employees"`
	FreelanceEmployees   int64    `json:"freelance_employees"`
	TotalEmployeesTrend  *float64 `json:"total_employees_trend,omitempty"`
	NewEmployeesTrend    *float64 `json:"new_employees_trend,omitempty"`
	ActiveEmployeesTrend *float64 `json:"active_employees_trend,omitempty"`
}

type EmployeeListResponseData struct {
	Items      []*EmployeeResponseDTO `json:"items"`
	Pagination domain.Pagination      `json:"pagination"`
}

// FromDomain converts a domain Employee to EmployeeResponseDTO
func (dto *EmployeeResponseDTO) FromDomain(employee *domain.Employee) *EmployeeResponseDTO {
	if employee == nil {
		return nil
	}

	var genderDTO *string
	if employee.Gender != nil {
		genderStr := string(*employee.Gender)
		genderDTO = &genderStr
	}

	var phoneDTO *string
	if employee.User.Phone != "" {
		phoneDTO = &employee.User.Phone
	}

	var emailDTO *string
	if employee.User.Email != "" {
		emailDTO = &employee.User.Email
	}

	responseDTO := &EmployeeResponseDTO{
		ID:                    employee.ID,
		Email:                 emailDTO,
		Phone:                 phoneDTO,
		FirstName:             employee.FirstName,
		LastName:              employee.LastName,
		EmployeeCode:          employee.EmployeeCode,
		PositionName:          employee.PositionName,
		Branch:                employee.Branch,
		Gender:                genderDTO,
		NIK:                   employee.NIK,
		PlaceOfBirth:          employee.PlaceOfBirth,
		Grade:                 employee.Grade,
		EmploymentStatus:      employee.EmploymentStatus,
		BankName:              employee.BankName,
		BankAccountNumber:     employee.BankAccountNumber,
		BankAccountHolderName: employee.BankAccountHolderName,
		ProfilePhotoURL:       employee.ProfilePhotoURL,
		CreatedAt:             employee.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             employee.UpdatedAt.Format(time.RFC3339),
	}

	if employee.LastEducation != nil {
		lastEducationStr := string(*employee.LastEducation)
		responseDTO.LastEducation = &lastEducationStr
	}
	if employee.ContractType != nil {
		contractTypeStr := string(*employee.ContractType)
		responseDTO.ContractType = &contractTypeStr
	}
	if employee.TaxStatus != nil {
		taxStatusStr := string(*employee.TaxStatus)
		responseDTO.TaxStatus = &taxStatusStr
	}
	if employee.DateOfBirth != nil {
		dateOfBirthStr := employee.DateOfBirth.Format("2006-01-02")
		responseDTO.DateOfBirth = &dateOfBirthStr
	}
	if employee.HireDate != nil {
		hireDateStr := employee.HireDate.Format("2006-01-02")
		responseDTO.HireDate = &hireDateStr
	}
	if employee.ResignationDate != nil {
		resignationDateStr := employee.ResignationDate.Format("2006-01-02")
		responseDTO.ResignationDate = &resignationDateStr
	}
	if employee.WorkScheduleID != nil {
		responseDTO.WorkScheduleID = employee.WorkScheduleID
	}
	if employee.WorkSchedule != nil {
		// Map work schedule details
		var details []work_schedule.WorkScheduleDetailResponseDTO
		for _, detail := range employee.WorkSchedule.Details {
			// Convert WorkDays from []domain.Days to []string
			workDays := make([]string, len(detail.WorkDays))
			for i, day := range detail.WorkDays {
				workDays[i] = string(day)
			}

			// Helper function to format *time.Time to *string "HH:MM:SS"
			formatTimePtr := func(t *time.Time) *string {
				if t == nil {
					return nil
				}
				s := t.Format("15:04:05")
				return &s
			}

			detailDTO := work_schedule.WorkScheduleDetailResponseDTO{
				ID:             detail.ID,
				WorkTypeDetail: string(detail.WorktypeDetail),
				WorkDays:       workDays,
				CheckInStart:   formatTimePtr(detail.CheckinStart),
				CheckInEnd:     formatTimePtr(detail.CheckinEnd),
				BreakStart:     formatTimePtr(detail.BreakStart),
				BreakEnd:       formatTimePtr(detail.BreakEnd),
				CheckOutStart:  formatTimePtr(detail.CheckoutStart),
				CheckOutEnd:    formatTimePtr(detail.CheckoutEnd),
				LocationID:     detail.LocationID,
			}

			// Add location if it exists
			if detail.Location != nil {
				detailDTO.Location = &dtolocation.LocationResponseDTO{
					ID:            detail.Location.ID,
					Name:          detail.Location.Name,
					AddressDetail: detail.Location.AddressDetail,
					Latitude:      detail.Location.Latitude,
					Longitude:     detail.Location.Longitude,
					Radius:        float64(detail.Location.RadiusM),
				}
			}

			details = append(details, detailDTO)
		}

		responseDTO.WorkSchedule = &work_schedule.WorkScheduleResponseDTO{
			ID:       employee.WorkSchedule.ID,
			Name:     employee.WorkSchedule.Name,
			WorkType: string(employee.WorkSchedule.WorkType),
			Details:  details,
		}
	}
	return responseDTO
}

// ToEmployeeResponseDTO is a convenience function to convert domain Employee to response DTO
func ToEmployeeResponseDTO(employee *domain.Employee) *EmployeeResponseDTO {
	return (&EmployeeResponseDTO{}).FromDomain(employee)
}

// ToEmployeeResponseDTOList converts a slice of domain Employees to response DTOs
func ToEmployeeResponseDTOList(employees []*domain.Employee) []*EmployeeResponseDTO {
	if employees == nil {
		return nil
	}

	dtos := make([]*EmployeeResponseDTO, len(employees))
	for i, emp := range employees {
		dtos[i] = ToEmployeeResponseDTO(emp)
	}
	return dtos
}
