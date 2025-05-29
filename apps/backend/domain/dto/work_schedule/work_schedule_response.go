package work_schedule

type WorkScheduleResponseDTO struct {
	ID       uint                            `json:"id"`
	Name     string                          `json:"name"`
	WorkType string                          `json:"work_type"`
	Details  []WorkScheduleDetailResponseDTO `json:"details"`
}
type WorkScheduleDetailResponseDTO struct {
	ID              uint     `json:"id"`
	WorkTypeDetail  string   `json:"worktype_detail"`
	WorkDays        []string `json:"workdays"`      // Assuming Days is a string type
	CheckInStart    *string  `json:"checkin_start"` // Assuming time is represented as string
	CheckInEnd      *string  `json:"checkin_end"`
	BreakStart      *string  `json:"break_start"`
	BreakEnd        *string  `json:"break_end"`
	CheckOutStart   *string  `json:"checkout_start"`
	CheckOutEnd     *string  `json:"checkout_end"`
	LocationID      *uint    `json:"location_id"`
	LocationName    *string  `json:"location_name"` // Assuming this is a nullable field
	LocationAddress *string  `json:"location_address"`
	LocationLat     float64  `json:"latitude"`
	LocationLong    float64  `json:"longitude"`
	Radius          float64  `json:"radius_m"`
}
