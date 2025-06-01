package document

import "mime/multipart"

type UploadDocumentRequestDTO struct {
	File *multipart.FileHeader `form:"file" binding:"required"`
}

type ListDocumentsRequestQuery struct {
	Page       int   `form:"page,default=1" binding:"omitempty,min=1"`
	PageSize   int   `form:"page_size,default=10" binding:"omitempty,min=1,max=100"`
	EmployeeID *uint `form:"employee_id" binding:"omitempty"`
}
