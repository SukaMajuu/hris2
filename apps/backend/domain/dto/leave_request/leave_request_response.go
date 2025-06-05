package leave_request

import "github.com/SukaMajuu/hris/apps/backend/domain"

type LeaveRequestResponseDTO struct {
	ID             uint    `json:"id"`
	EmployeeID     uint    `json:"employee_id"`
	EmployeeName   string  `json:"employee_name"`
	PositionName   string  `json:"position_name"`
	LeaveType      string  `json:"leave_type"`
	StartDate      string  `json:"start_date"`
	EndDate        string  `json:"end_date"`
	Attachment     *string `json:"attachment,omitempty"`
	EmployeeNote   *string `json:"employee_note,omitempty"`
	AdminNote      *string `json:"admin_note,omitempty"`
	Status         string  `json:"status"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type LeaveRequestListResponseData struct {
	Items      []*LeaveRequestResponseDTO `json:"items"`
	Pagination domain.Pagination          `json:"pagination"`
}
