package work_schedule

import (
	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtolocation "github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
)

type WorkScheduleResponseDTO struct {
	ID       uint                            `json:"id"`
	Name     string                          `json:"name"`
	WorkType string                          `json:"work_type"`
	Details  []WorkScheduleDetailResponseDTO `json:"details"`
}
type WorkScheduleDetailResponseDTO struct {
	ID             uint                             `json:"id"`
	WorkTypeDetail string                           `json:"worktype_detail"`
	WorkDays       []string                         `json:"work_days"`
	CheckInStart   *string                          `json:"checkin_start"`
	CheckInEnd     *string                          `json:"checkin_end"`
	BreakStart     *string                          `json:"break_start"`
	BreakEnd       *string                          `json:"break_end"`
	CheckOutStart  *string                          `json:"checkout_start"`
	CheckOutEnd    *string                          `json:"checkout_end"`
	LocationID     *uint                            `json:"location_id"`
	Location       *dtolocation.LocationResponseDTO `json:"location"`
	IsActive       bool                             `json:"is_active"`
}

type WorkScheduleListResponseData struct {
	Items      []*WorkScheduleResponseDTO `json:"items"`
	Pagination domain.Pagination          `json:"pagination"`
}
