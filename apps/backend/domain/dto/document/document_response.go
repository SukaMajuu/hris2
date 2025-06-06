package document

import (
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
)

type DocumentResponseDTO struct {
	ID         uint   `json:"id"`
	EmployeeID uint   `json:"employee_id"`
	Name       string `json:"name"`
	URL        string `json:"url"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

// FromDomain converts domain.Document to DocumentResponseDTO instance method
func (d *DocumentResponseDTO) FromDomain(doc *domain.Document) *DocumentResponseDTO {
	if doc == nil {
		return nil
	}

	d.ID = doc.ID
	d.EmployeeID = doc.EmployeeID
	d.Name = doc.Name
	d.URL = doc.URL
	d.CreatedAt = doc.CreatedAt.Format(time.RFC3339)
	d.UpdatedAt = doc.UpdatedAt.Format(time.RFC3339)

	return d
}

// ToDocumentResponseDTO converts domain.Document to DocumentResponseDTO (convenience function)
func ToDocumentResponseDTO(doc *domain.Document) *DocumentResponseDTO {
	if doc == nil {
		return nil
	}

	return &DocumentResponseDTO{
		ID:         doc.ID,
		EmployeeID: doc.EmployeeID,
		Name:       doc.Name,
		URL:        doc.URL,
		CreatedAt:  doc.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  doc.UpdatedAt.Format(time.RFC3339),
	}
}

// ToDocumentResponseDTOList converts slice of domain.Document to slice of DocumentResponseDTO
func ToDocumentResponseDTOList(docs []*domain.Document) []DocumentResponseDTO {
	if docs == nil {
		return nil
	}

	respDTOs := make([]DocumentResponseDTO, len(docs))
	for i, doc := range docs {
		respDTOs[i] = *ToDocumentResponseDTO(doc)
	}

	return respDTOs
}
