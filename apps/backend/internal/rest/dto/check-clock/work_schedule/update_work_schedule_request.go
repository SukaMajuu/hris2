package work_schedule

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type UpdateWorkScheduleRequest struct {
	Name     *string                    `json:"name,omitempty"`
	WorkType string                     `json:"workType" validate:"required"`
	Details  []UpdateWorkScheduleDetail `json:"details,omitempty" validate:"dive"`
}

type UpdateWorkScheduleDetail struct {
	ID             uint    `json:"id" validate:"required"`
	WorkDay        *string `json:"day,omitempty"`
	WorkTypeDetail *string `json:"type,omitempty"`
	CheckInStart   *string `json:"checkInStart,omitempty"`
	CheckInEnd     *string `json:"checkInEnd,omitempty"`
	BreakStart     *string `json:"breakStart,omitempty"`
	BreakEnd       *string `json:"breakEnd,omitempty"`
	CheckOutStart  *string `json:"checkOutStart,omitempty"`
	CheckOutEnd    *string `json:"checkOutEnd,omitempty"`
	LocationID     *uint   `json:"locationId"` // Bisa null untuk menghapus, atau dikosongkan jika tidak diubah
}

func (r *UpdateWorkScheduleRequest) Validate() error {
	validate := validator.New()
	if err := validate.Struct(r); err != nil {
		return err
	}
	for i, d := range r.Details {
		if d.WorkTypeDetail != nil && *d.WorkTypeDetail == "WFO" && d.LocationID == nil {
			return fmt.Errorf("locationId wajib diisi untuk detail ke-%d dengan type WFO", i+1)
		}
		if d.WorkTypeDetail != nil && *d.WorkTypeDetail == "WFA" && d.LocationID != nil {
			return fmt.Errorf("locationId tidak boleh diisi untuk detail ke-%d dengan type WFA", i+1)
		}
	}
	return nil
}
