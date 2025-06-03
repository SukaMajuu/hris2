package branch

type CreateBranchRequest struct {
	Name string `json:"name" binding:"required" validate:"required,min=1,max=255"`
}

type UpdateBranchRequest struct {
	Name string `json:"name" binding:"required" validate:"required,min=1,max=255"`
}
