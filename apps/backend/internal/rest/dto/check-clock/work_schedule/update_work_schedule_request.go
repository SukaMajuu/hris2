package work_schedule

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type UpdateWorkScheduleRequest struct {
	Name     string                     `json:"name" validate:"required"`
	WorkType string                     `json:"work_type" validate:"required"` // This field is required
	Details  []UpdateWorkScheduleDetail `json:"details" validate:"required,dive"`
	ToDelete []uint                     `json:"toDelete,omitempty"` // IDs of details to delete
}

type UpdateWorkScheduleDetail struct {
	ID             *uint    `json:"id,omitempty"` // Null for new details
	WorkDays       []string `json:"work_days" validate:"required,min=1,dive,oneof=Monday Tuesday Wednesday Thursday Friday Saturday Sunday"`
	WorkTypeDetail string   `json:"worktype_detail" validate:"required,oneof=WFO WFA"` // This field is required
	CheckInStart   *string  `json:"checkin_start,omitempty"`
	CheckInEnd     *string  `json:"checkin_end,omitempty"`
	BreakStart     *string  `json:"break_start,omitempty"`
	BreakEnd       *string  `json:"break_end,omitempty"`
	CheckOutStart  *string  `json:"checkout_start,omitempty"`
	CheckOutEnd    *string  `json:"checkout_end,omitempty"`
	LocationID     *uint    `json:"location_id,omitempty"`
	IsActive       *bool    `json:"is_active,omitempty"`
}

func (r *UpdateWorkScheduleRequest) Validate() error {
	validate := validator.New()
	if err := validate.Struct(r); err != nil {
		return err
	}

	for i, detail := range r.Details {
		if detail.WorkTypeDetail == "WFO" && detail.LocationID == nil {
			return fmt.Errorf("locationId wajib diisi untuk detail ke-%d dengan type WFO", i+1)
		}
		if detail.WorkTypeDetail == "WFA" && detail.LocationID != nil {
			return fmt.Errorf("locationId tidak boleh diisi untuk detail ke-%d dengan type WFA", i+1)
		}
	}
	return nil
}
