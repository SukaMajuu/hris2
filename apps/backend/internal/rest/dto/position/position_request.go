package position

type CreatePositionRequest struct {
	Name string `json:"name" binding:"required" validate:"required,min=1,max=255"`
}

type UpdatePositionRequest struct {
	Name string `json:"name" binding:"required" validate:"required,min=1,max=255"`
}
