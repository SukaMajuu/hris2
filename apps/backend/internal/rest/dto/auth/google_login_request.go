package auth

import "github.com/go-playground/validator/v10"

type GoogleLoginRequest struct {
	Token      string `json:"token" validate:"required"`
	AgreeTerms *bool  `json:"agreeTerms"`
}

func (r *GoogleLoginRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
