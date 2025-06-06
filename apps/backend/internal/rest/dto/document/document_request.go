package document

import (
	"fmt"
	"mime/multipart"
	"strings"
)

type UploadDocumentRequestDTO struct {
	File *multipart.FileHeader `form:"file" binding:"required"`
}

type ListDocumentsRequestQuery struct {
	Page       int   `form:"page,default=1" binding:"omitempty,min=1"`
	PageSize   int   `form:"page_size,default=10" binding:"omitempty,min=1,max=100"`
	EmployeeID *uint `form:"employee_id" binding:"omitempty"`
}

// AllowedMimeTypes defines the valid file types for document uploads
var AllowedMimeTypes = []string{
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

// IsAllowedMimeType checks if the provided MIME type is allowed for document uploads
func IsAllowedMimeType(mimeType string) bool {
	for _, allowed := range AllowedMimeTypes {
		if strings.EqualFold(mimeType, allowed) {
			return true
		}
	}
	return false
}

// ValidateFileType validates the uploaded file's MIME type
func (dto *UploadDocumentRequestDTO) ValidateFileType() error {
	if dto.File == nil {
		return fmt.Errorf("no file provided")
	}

	mimeType := dto.File.Header.Get("Content-Type")
	if !IsAllowedMimeType(mimeType) {
		return fmt.Errorf("file type not allowed. Detected: %s. Allowed types: %s",
			mimeType, strings.Join(AllowedMimeTypes, ", "))
	}

	return nil
}
