package location

type LocationResponseDTO struct {
	ID            uint    `json:"id"`
	Name          string  `json:"name"`
	AddressDetail string  `json:"address_detail"`
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	Radius        float64 `json:"radius_m"`
}
