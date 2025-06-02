package handler

import (
	"strconv"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	positionResponseDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/position"
	positionRequestDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/position"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/position"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type PositionHandler struct {
	positionUseCase *position.PositionUseCase
}

func NewPositionHandler(u *position.PositionUseCase) *PositionHandler {
	return &PositionHandler{
		positionUseCase: u,
	}
}

func (h *PositionHandler) CreatePosition(c *gin.Context) {
	var req positionRequestDTO.CreatePositionRequest
	if bindAndValidate(c, &req) {
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.BadRequest(c, "User ID not found in context", nil)
		return
	}

	createdPosition, err := h.positionUseCase.Create(c.Request.Context(), &domain.Position{
		Name: req.Name,
		HrID: userID.(uint),
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	resp := positionResponseDTO.PositionResponse{
		ID:        createdPosition.ID,
		Name:      createdPosition.Name,
		HrID:      createdPosition.HrID,
		CreatedAt: createdPosition.CreatedAt,
		UpdatedAt: createdPosition.UpdatedAt,
	}

	response.Created(c, "Position created successfully", resp)
}

func (h *PositionHandler) GetMyPositions(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.BadRequest(c, "User ID not found in context", nil)
		return
	}

	positions, err := h.positionUseCase.GetByHrID(c.Request.Context(), userID.(uint))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	var positionResponses []positionResponseDTO.PositionResponse
	for _, position := range positions {
		positionResponses = append(positionResponses, positionResponseDTO.PositionResponse{
			ID:        position.ID,
			Name:      position.Name,
			HrID:      position.HrID,
			CreatedAt: position.CreatedAt,
			UpdatedAt: position.UpdatedAt,
		})
	}

	response.OK(c, "Positions retrieved successfully", positionResponses)
}

func (h *PositionHandler) UpdatePosition(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	var req positionRequestDTO.UpdatePositionRequest
	if bindAndValidate(c, &req) {
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.BadRequest(c, "User ID not found in context", nil)
		return
	}

	updatedPosition, err := h.positionUseCase.Update(c.Request.Context(), uint(id), &domain.Position{
		Name: req.Name,
		HrID: userID.(uint),
	})

	if err != nil {
		if err.Error() == "position not found" {
			response.NotFound(c, "Position not found", err)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	resp := positionResponseDTO.PositionResponse{
		ID:        updatedPosition.ID,
		Name:      updatedPosition.Name,
		HrID:      updatedPosition.HrID,
		CreatedAt: updatedPosition.CreatedAt,
		UpdatedAt: updatedPosition.UpdatedAt,
	}

	response.OK(c, "Position updated successfully", resp)
}

func (h *PositionHandler) DeletePosition(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	err = h.positionUseCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		if err.Error() == "position not found" {
			response.NotFound(c, "Position not found", err)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Position deleted successfully", nil)
}
