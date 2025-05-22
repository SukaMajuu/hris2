package location

import "github.com/go-playground/validator/v10"

type UpdateLocationRequest struct {
	Name          string  `json:"name" validate:"required"`
	AddressDetail string  `json:"address_detail" validate:"required"`
	Latitude      float64 `json:"latitude" validate:"required"`
	Longitude     float64 `json:"longitude" validate:"required"`
	RadiusM       int     `json:"radius_m" validate:"required"`
}

func (r *UpdateLocationRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
