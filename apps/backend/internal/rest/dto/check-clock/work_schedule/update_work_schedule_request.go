package work_schedule

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

type UpdateWorkScheduleRequest struct {
	Name     string                     `json:"name" validate:"required"`
	WorkType string                     `json:"workType" validate:"required"`
	Details  []UpdateWorkScheduleDetail `json:"details" validate:"required,dive"`
	ToDelete []uint                     `json:"toDelete,omitempty"` // IDs of details to delete
}

type UpdateWorkScheduleDetail struct {
	ID             *uint    `json:"id,omitempty"` // Null for new details
	WorkTypeDetail string   `json:"workTypeDetail" validate:"required"`
	WorkDays       []string `json:"workDays" validate:"required"`
	CheckInStart   *string  `json:"checkInStart,omitempty"`
	CheckInEnd     *string  `json:"checkInEnd,omitempty"`
	BreakStart     *string  `json:"breakStart,omitempty"`
	BreakEnd       *string  `json:"breakEnd,omitempty"`
	CheckOutStart  *string  `json:"checkOutStart,omitempty"`
	CheckOutEnd    *string  `json:"checkOutEnd,omitempty"`
	LocationID     *uint    `json:"locationId,omitempty"`
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
