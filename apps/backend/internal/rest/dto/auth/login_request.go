package auth

import "github.com/go-playground/validator/v10"

type LoginRequest struct {
	Identifier string `json:"identifier" validate:"required"` // Email or Phone or Employee Code
	Password   string `json:"password" validate:"required"`
	RememberMe bool   `json:"rememberMe"` // Optional, defaults to false
}

func (r *LoginRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
