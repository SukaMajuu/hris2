package auth

import "github.com/go-playground/validator/v10"

type ResetPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

func (r *ResetPasswordRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
