package employee

import "github.com/SukaMajuu/hris/apps/backend/domain/enums"

type ListEmployeesRequestQuery struct {
	Page     int     `form:"page" binding:"omitempty,min=1"`
	PageSize int     `form:"page_size" binding:"omitempty,min=1,max=100"`
	Status   *string `form:"status" binding:"omitempty,oneof=active inactive"`
}

type CreateEmployeeRequestDTO struct {
	UserID           uint          `json:"user_id" binding:"required"`
	FirstName        string        `json:"first_name" binding:"required"`
	LastName         *string       `json:"last_name"`
	PositionID       uint          `json:"position_id" binding:"required"`
	EmploymentStatus *bool         `json:"employment_status"`
	EmployeeCode     *string       `json:"employee_code" binding:"omitempty,alphanum,max=50"`
	BranchID         *uint         `json:"branch_id"`
	Gender           *enums.Gender `json:"gender" binding:"omitempty"`
	NIK              *string       `json:"nik" binding:"omitempty,numeric"`
}
