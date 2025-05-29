package work_schedule

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type CreateWorkScheduleRequest struct {
	Name     string                     `json:"name" validate:"required"`
	WorkType string                     `json:"work_type" validate:"required"` // This field is required
	Details  []CreateWorkScheduleDetail `json:"details" validate:"required,dive"`
}

type CreateWorkScheduleDetail struct {
	WorkDays       []string `json:"work_days" validate:"required,min=1,dive,oneof=Monday Tuesday Wednesday Thursday Friday Saturday Sunday"`
	WorkTypeDetail string   `json:"worktype_detail" validate:"required,oneof=WFO WFA"` // This field is required
	CheckInStart   *string  `json:"checkin_start,omitempty"`
	CheckInEnd     *string  `json:"checkin_end,omitempty"`
	BreakStart     *string  `json:"break_start,omitempty"`
	BreakEnd       *string  `json:"break_end,omitempty"`
	CheckOutStart  *string  `json:"checkout_start,omitempty"`
	CheckOutEnd    *string  `json:"checkout_end,omitempty"`
	LocationID     *uint    `json:"location_id,omitempty"`
}

func (r *CreateWorkScheduleRequest) Validate() error {
	validate := validator.New()
	if err := validate.Struct(r); err != nil {
		return err
	}
	for i, d := range r.Details {
		if d.WorkTypeDetail == "WFO" && d.LocationID == nil {
			return fmt.Errorf("locationId wajib diisi untuk detail ke-%d dengan type WFO", i+1)
		}
		if d.WorkTypeDetail == "WFA" && d.LocationID != nil {
			// Seharusnya LocationID *bisa* nil untuk WFA, jadi validasi ini mungkin perlu dipertimbangkan ulang atau dihilangkan
			// Jika WFA tidak boleh punya LocationID sama sekali, maka ini benar.
			// return fmt.Errorf("locationId tidak boleh diisi untuk detail ke-%d dengan type WFA", i+1)
		}
		// Validasi untuk WorkDays sudah ditangani oleh tag `validate` pada struct
	}
	return nil
}
