package handler

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	respDocumentDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/document"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	reqDocumentDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/document"
	documentUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	documentUseCase *documentUseCase.DocumentUseCase
	employeeRepo    interfaces.EmployeeRepository
}

func NewDocumentHandler(useCase *documentUseCase.DocumentUseCase, employeeRepo interfaces.EmployeeRepository) *DocumentHandler {
	return &DocumentHandler{
		documentUseCase: useCase,
		employeeRepo:    employeeRepo,
	}
}

var allowedMimeTypes = []string{
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

func isAllowedMimeType(mimeType string) bool {
	for _, allowed := range allowedMimeTypes {
		if strings.EqualFold(mimeType, allowed) {
			return true
		}
	}
	return false
}

func (h *DocumentHandler) UploadDocument(c *gin.Context) {
	var reqDTO reqDocumentDTO.UploadDocumentRequestDTO

	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("DocumentHandler: Error binding request: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		log.Printf("DocumentHandler: User ID not found in context")
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		log.Printf("DocumentHandler: Invalid user ID type in context")
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	if reqDTO.File != nil {
		mimeType := reqDTO.File.Header.Get("Content-Type")
		log.Printf("DocumentHandler: File MIME type detected: %s", mimeType)

		if !isAllowedMimeType(mimeType) {
			log.Printf("DocumentHandler: MIME type not allowed: %s", mimeType)
			response.BadRequest(c, fmt.Sprintf("File type not allowed. Detected: %s. Allowed types: %s", mimeType, strings.Join(allowedMimeTypes, ", ")), nil)
			return
		}
	}

	log.Printf("DocumentHandler: Uploading document for user ID: %d", userID)

	document, err := h.documentUseCase.UploadDocument(c.Request.Context(), userID, reqDTO.File)
	if err != nil {
		log.Printf("DocumentHandler: Error uploading document: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to upload document"))
		return
	}

	respDTO := respDocumentDTO.DocumentResponseDTO{
		ID:         document.ID,
		EmployeeID: document.EmployeeID,
		Name:       document.Name,
		URL:        document.URL,
		CreatedAt:  document.CreatedAt.Format(time.RFC3339),
		UpdatedAt:  document.UpdatedAt.Format(time.RFC3339),
	}

	response.Success(c, http.StatusCreated, "Document uploaded successfully", respDTO)
}

func (h *DocumentHandler) GetDocuments(c *gin.Context) {
	userIDCtx, exists := c.Get("userID")
	if !exists {
		log.Printf("DocumentHandler: User ID not found in context")
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		log.Printf("DocumentHandler: Invalid user ID type in context")
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	log.Printf("DocumentHandler: Getting employee for user ID: %d", userID)

	employee, err := h.employeeRepo.GetByUserID(c.Request.Context(), userID)
	if err != nil {
		log.Printf("DocumentHandler: Employee not found for user ID %d: %v", userID, err)
		response.BadRequest(c, "Employee not found for current user", err)
		return
	}
	log.Printf("DocumentHandler: Employee found: %s %s (ID: %d)", employee.FirstName,
		func() string {
			if employee.LastName != nil {
				return *employee.LastName
			} else {
				return ""
			}
		}(),
		employee.ID)

	log.Printf("DocumentHandler: Getting documents for current user's employee ID: %d", employee.ID)

	documents, err := h.documentUseCase.GetDocumentsByEmployeeID(c.Request.Context(), employee.ID)
	if err != nil {
		log.Printf("DocumentHandler: Error getting documents for current user: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve user documents"))
		return
	}

	log.Printf("DocumentHandler: Found %d documents for current user (employee ID %d)", len(documents), employee.ID)

	var respDTOs []respDocumentDTO.DocumentResponseDTO
	for i, doc := range documents {
		log.Printf("DocumentHandler: Processing document %d: ID=%d, Name=%s", i+1, doc.ID, doc.Name)
		respDTOs = append(respDTOs, respDocumentDTO.DocumentResponseDTO{
			ID:         doc.ID,
			EmployeeID: doc.EmployeeID,
			Name:       doc.Name,
			URL:        doc.URL,
			CreatedAt:  doc.CreatedAt.Format(time.RFC3339),
			UpdatedAt:  doc.UpdatedAt.Format(time.RFC3339),
		})
	}

	log.Printf("DocumentHandler: Returning %d documents as response", len(respDTOs))
	response.Success(c, http.StatusOK, "Your documents retrieved successfully", respDTOs)
}

func (h *DocumentHandler) DeleteDocument(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		log.Printf("DocumentHandler: Invalid document ID: %s", idParam)
		response.BadRequest(c, "Invalid document ID", err)
		return
	}

	log.Printf("DocumentHandler: Deleting document with ID: %d", id)

	err = h.documentUseCase.DeleteDocument(c.Request.Context(), uint(id))
	if err != nil {
		log.Printf("DocumentHandler: Error deleting document: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to delete document"))
		return
	}

	response.Success(c, http.StatusOK, "Document deleted successfully", nil)
}
