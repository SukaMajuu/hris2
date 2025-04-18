package auth

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type RegisterRequest struct {
	// User fields
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Phone    string `json:"phone" validate:"required,e164"`
	Role     string `json:"role" validate:"required,oneof=admin hr employee"`

	// Employee fields
	EmployeeCode    string    `json:"employee_code" validate:"required"`
	FirstName       string    `json:"first_name" validate:"required"`
	LastName        string    `json:"last_name" validate:"required"`
	DepartmentID    uint      `json:"department_id" validate:"required"`
	PositionID      uint      `json:"position_id" validate:"required"`
	EmploymentStatus string   `json:"employment_status" validate:"required,oneof=active inactive"`
	HireDate        time.Time `json:"hire_date" validate:"required"`
}

func (r *RegisterRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}
