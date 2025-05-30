package auth

import "github.com/go-playground/validator/v10"

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

func (r *RefreshTokenRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
