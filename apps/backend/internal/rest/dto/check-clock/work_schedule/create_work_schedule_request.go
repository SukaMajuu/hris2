package work_schedule

import (
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
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
	IsActive       *bool    `json:"is_active,omitempty"`
}

func (r *CreateWorkScheduleRequest) Validate() error {
	validate := validator.New()
	if err := validate.Struct(r); err != nil {
		return err
	}
	for i, d := range r.Details {
		if d.WorkTypeDetail == string(enums.WorkTypeWFO) && d.LocationID == nil { // Menggunakan enums
			return fmt.Errorf("locationId wajib diisi untuk detail ke-%d dengan type WFO", i+1)
		}
		// Blok if untuk WFA dihapus karena kosong setelah baris di dalamnya dikomentari
		// Jika ada logika validasi yang diperlukan untuk WFA, tambahkan di sini.
		// Validasi untuk WorkDays sudah ditangani oleh tag `validate` pada struct
	}
	return nil
}
