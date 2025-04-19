package auth

import "github.com/go-playground/validator/v10"

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required,min=8"` // Add complexity validation if needed
}

func (r *ChangePasswordRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
