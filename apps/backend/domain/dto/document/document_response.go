package document

type DocumentResponseDTO struct {
	ID         uint   `json:"id"`
	EmployeeID uint   `json:"employee_id"`
	Name       string `json:"name"`
	URL        string `json:"url"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}
