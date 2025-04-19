// apps/backend/internal/rest/dto/auth/admin_register_request.go
package auth

import (
	"github.com/go-playground/validator/v10"
)

type AdminRegisterRequest struct {
	// User fields
	Email           string `json:"email" validate:"required,email"`
	Password        string `json:"password" validate:"required,min=8"`

	// Initial Employee fields for the Admin (HR)
	FirstName       string `json:"first_name" validate:"required"`
	LastName        string `json:"last_name" validate:"required"`

	AgreeTerms      bool   `json:"agree_terms" validate:"required,eq=true"`
}

func (r *AdminRegisterRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
