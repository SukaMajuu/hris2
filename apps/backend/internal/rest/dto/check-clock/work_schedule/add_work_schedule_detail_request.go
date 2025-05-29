package work_schedule

import (
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain/enums" // Import enums
	"github.com/go-playground/validator/v10"
)

type AddWorkScheduleDetailRequest struct {
	WorkDay        string  `json:"day" validate:"required"`
	WorkTypeDetail string  `json:"type" validate:"required"`
	CheckInStart   *string `json:"checkInStart,omitempty"`
	CheckInEnd     *string `json:"checkInEnd,omitempty"`
	BreakStart     *string `json:"breakStart,omitempty"`
	BreakEnd       *string `json:"breakEnd,omitempty"`
	CheckOutStart  *string `json:"checkOutStart,omitempty"`
	CheckOutEnd    *string `json:"checkOutEnd,omitempty"`
	LocationID     *uint   `json:"locationId,omitempty"`
}

func (r *AddWorkScheduleDetailRequest) Validate() error {
	validate := validator.New()
	if err := validate.Struct(r); err != nil {
		return err
	}
	if r.WorkTypeDetail == string(enums.WorkTypeWFO) && r.LocationID == nil { // Gunakan konstanta enums
		return fmt.Errorf("locationId wajib diisi untuk WorkTypeDetail WFO")
	}
	if r.WorkTypeDetail == string(enums.WorkTypeWFA) && r.LocationID != nil { // Gunakan konstanta enums
		return fmt.Errorf("locationId tidak boleh diisi untuk WorkTypeDetail WFA")
	}
	return nil
}
