package employee

type ListEmployeesRequestQuery struct {
	Page     int     `form:"page" binding:"omitempty,min=1"`
	PageSize int     `form:"page_size" binding:"omitempty,min=1,max=100"`
	Status   *string `form:"status" binding:"omitempty,oneof=active inactive"`
}
