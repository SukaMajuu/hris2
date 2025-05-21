package handler

import (
	"net/http"
	// "strconv" // No longer needed

	"github.com/SukaMajuu/hris/apps/backend/domain"
	locationDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/location" // Import location DTO
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type LocationHandler struct {
	locationUseCase *location.LocationUseCase
}

func NewLocationHandler(u *location.LocationUseCase) *LocationHandler {
	return &LocationHandler{
		locationUseCase: u,
	}
}

func (h *LocationHandler) CreateLocation(c *gin.Context) {
	var req domain.Location
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	err := h.locationUseCase.CreateLocation(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Location created successfully",
		"data":    req,
	})
}

func (h *LocationHandler) ListLocations(c *gin.Context) {
	var queryDTO locationDTO.ListLocationsRequestQuery

	if bindAndValidateQuery(c, &queryDTO) {
		return
	}

	paginationParams := domain.PaginationParams{
		Page:     queryDTO.Page,
		PageSize: queryDTO.PageSize,
	}

	if paginationParams.Page == 0 {
		paginationParams.Page = 1
	}
	if paginationParams.PageSize == 0 {
		paginationParams.PageSize = 10
	}

	locationsData, err := h.locationUseCase.List(c.Request.Context(), paginationParams)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully retrieved locations", locationsData)
}
