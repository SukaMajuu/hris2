package handler

import (
	"strconv"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	branchResponseDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/branches"
	branchRequestDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/branch"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/branch"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

const (
	errBranchNotFound = "branch not found"
)

type BranchHandler struct {
	branchUseCase *branch.BranchUseCase
}

func NewBranchHandler(u *branch.BranchUseCase) *BranchHandler {
	return &BranchHandler{
		branchUseCase: u,
	}
}

func (h *BranchHandler) CreateBranch(c *gin.Context) {
	var req branchRequestDTO.CreateBranchRequest
	if bindAndValidate(c, &req) {
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.BadRequest(c, "User ID not found in context", nil)
		return
	}

	createdBranch, err := h.branchUseCase.Create(c.Request.Context(), &domain.Branch{
		Name: req.Name,
		HrID: userID.(uint),
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	resp := branchResponseDTO.BranchResponse{
		ID:        createdBranch.ID,
		Name:      createdBranch.Name,
		HrID:      createdBranch.HrID,
		CreatedAt: createdBranch.CreatedAt,
		UpdatedAt: createdBranch.UpdatedAt,
	}

	response.Created(c, "Branch created successfully", resp)
}

func (h *BranchHandler) GetMyBranches(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.BadRequest(c, "User ID not found in context", nil)
		return
	}

	branches, err := h.branchUseCase.GetByHrID(c.Request.Context(), userID.(uint))
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	var branchResponses []branchResponseDTO.BranchResponse
	for _, branch := range branches {
		branchResponses = append(branchResponses, branchResponseDTO.BranchResponse{
			ID:        branch.ID,
			Name:      branch.Name,
			HrID:      branch.HrID,
			CreatedAt: branch.CreatedAt,
			UpdatedAt: branch.UpdatedAt,
		})
	}

	response.OK(c, "Branches retrieved successfully", branchResponses)
}

func (h *BranchHandler) UpdateBranch(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	var req branchRequestDTO.UpdateBranchRequest
	if bindAndValidate(c, &req) {
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.BadRequest(c, "User ID not found in context", nil)
		return
	}

	updatedBranch, err := h.branchUseCase.Update(c.Request.Context(), uint(id), &domain.Branch{
		Name: req.Name,
		HrID: userID.(uint),
	})

	if err != nil {
		if err.Error() == errBranchNotFound {
			response.NotFound(c, "Branch not found", err)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	resp := branchResponseDTO.BranchResponse{
		ID:        updatedBranch.ID,
		Name:      updatedBranch.Name,
		HrID:      updatedBranch.HrID,
		CreatedAt: updatedBranch.CreatedAt,
		UpdatedAt: updatedBranch.UpdatedAt,
	}

	response.OK(c, "Branch updated successfully", resp)
}

func (h *BranchHandler) DeleteBranch(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	err = h.branchUseCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		if err.Error() == errBranchNotFound {
			response.NotFound(c, "Branch not found", err)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Branch deleted successfully", nil)
}
