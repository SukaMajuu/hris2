package handler

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	respDocumentDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/document"
	reqDocumentDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/document"
	documentUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/document"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	documentUseCase *documentUseCase.DocumentUseCase
}

func NewDocumentHandler(useCase *documentUseCase.DocumentUseCase) *DocumentHandler {
	return &DocumentHandler{
		documentUseCase: useCase,
	}
}

func (h *DocumentHandler) UploadDocument(c *gin.Context) {
	var reqDTO reqDocumentDTO.UploadDocumentRequestDTO

	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("DocumentHandler: Error binding request: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	userID, err := h.getUserIDFromContext(c)
	if err != nil {
		return
	}

	if err := reqDTO.ValidateFileType(); err != nil {
		log.Printf("DocumentHandler: File validation failed: %v", err)
		response.BadRequest(c, err.Error(), nil)
		return
	}

	log.Printf("DocumentHandler: Uploading document for user ID: %d", userID)

	document, err := h.documentUseCase.UploadDocument(c.Request.Context(), userID, reqDTO.File)
	if err != nil {
		log.Printf("DocumentHandler: Error uploading document: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to upload document"))
		return
	}

	respDTO := respDocumentDTO.ToDocumentResponseDTO(document)
	response.Success(c, http.StatusCreated, "Document uploaded successfully", respDTO)
}

func (h *DocumentHandler) GetDocuments(c *gin.Context) {
	userID, err := h.getUserIDFromContext(c)
	if err != nil {
		return
	}

	log.Printf("DocumentHandler: Getting documents for user ID: %d", userID)

	documents, err := h.documentUseCase.GetDocumentsByUserID(c.Request.Context(), userID)
	if err != nil {
		log.Printf("DocumentHandler: Error getting documents for user ID %d: %v", userID, err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve user documents"))
		return
	}

	log.Printf("DocumentHandler: Found %d documents for user ID %d", len(documents), userID)

	respDTOs := respDocumentDTO.ToDocumentResponseDTOList(documents)

	log.Printf("DocumentHandler: Returning %d documents as response", len(respDTOs))
	response.Success(c, http.StatusOK, "Your documents retrieved successfully", respDTOs)
}

func (h *DocumentHandler) DeleteDocument(c *gin.Context) {
	id, err := h.parseIDParam(c, "id")
	if err != nil {
		return
	}

	log.Printf("DocumentHandler: Deleting document with ID: %d", id)

	err = h.documentUseCase.DeleteDocument(c.Request.Context(), id)
	if err != nil {
		log.Printf("DocumentHandler: Error deleting document: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to delete document"))
		return
	}

	response.Success(c, http.StatusOK, "Document deleted successfully", nil)
}

func (h *DocumentHandler) UploadDocumentForEmployee(c *gin.Context) {
	employeeID, err := h.parseIDParam(c, "id")
	if err != nil {
		return
	}

	var reqDTO reqDocumentDTO.UploadDocumentRequestDTO

	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("DocumentHandler: Error binding request: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	if err := reqDTO.ValidateFileType(); err != nil {
		log.Printf("DocumentHandler: File validation failed: %v", err)
		response.BadRequest(c, err.Error(), nil)
		return
	}

	log.Printf("DocumentHandler: Uploading document for employee ID: %d", employeeID)

	document, err := h.documentUseCase.UploadDocumentForEmployee(c.Request.Context(), employeeID, reqDTO.File)
	if err != nil {
		log.Printf("DocumentHandler: Error uploading document for employee: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to upload document"))
		return
	}

	respDTO := respDocumentDTO.ToDocumentResponseDTO(document)
	response.Success(c, http.StatusCreated, "Document uploaded successfully", respDTO)
}

func (h *DocumentHandler) GetDocumentsByEmployee(c *gin.Context) {
	employeeID, err := h.parseIDParam(c, "id")
	if err != nil {
		return
	}

	log.Printf("DocumentHandler: Getting documents for employee ID: %d", employeeID)

	documents, err := h.documentUseCase.GetDocumentsByEmployeeID(c.Request.Context(), employeeID)
	if err != nil {
		log.Printf("DocumentHandler: Error getting documents for employee ID %d: %v", employeeID, err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employee documents"))
		return
	}

	log.Printf("DocumentHandler: Found %d documents for employee ID %d", len(documents), employeeID)

	respDTOs := respDocumentDTO.ToDocumentResponseDTOList(documents)

	log.Printf("DocumentHandler: Returning %d documents as response", len(respDTOs))
	response.Success(c, http.StatusOK, "Employee documents retrieved successfully", respDTOs)
}

// Helper functions
func (h *DocumentHandler) getUserIDFromContext(c *gin.Context) (uint, error) {
	userIDCtx, exists := c.Get("userID")
	if !exists {
		log.Printf("DocumentHandler: User ID not found in context")
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return 0, fmt.Errorf("missing userID in context")
	}
	userID, ok := userIDCtx.(uint)
	if !ok {
		log.Printf("DocumentHandler: Invalid user ID type in context")
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return 0, fmt.Errorf("invalid user ID type in context")
	}
	return userID, nil
}

func (h *DocumentHandler) parseIDParam(c *gin.Context, paramName string) (uint, error) {
	idParam := c.Param(paramName)
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		log.Printf("DocumentHandler: Invalid %s: %s", paramName, idParam)
		response.BadRequest(c, fmt.Sprintf("Invalid %s", paramName), err)
		return 0, err
	}
	return uint(id), nil
}
