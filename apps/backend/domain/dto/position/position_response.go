package position

import "time"

type PositionResponse struct {
	ID        uint      `json:"id"`
	Name      string    `json:"name"`
	HrID      uint      `json:"hr_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
