package employee

type EmployeeResponseDTO struct {
	ID               uint    `json:"id"`
	FirstName        string  `json:"first_name"`
	LastName         *string `json:"last_name"`
	Gender           *string `json:"gender"`
	Phone            *string `json:"phone"`
	BranchID         *uint   `json:"branch_id"`
	PositionID       uint    `json:"position_id"`
	Grade            *string `json:"grade"`
	EmploymentStatus bool    `json:"employment_status"`
}
