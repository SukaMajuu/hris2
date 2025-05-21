package handler

import (
	"net/http"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/internal/usecase/location"
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

func (h *LocationHandler) GetAllLocations(c *gin.Context) {
	locations, err := h.locationUseCase.GetAllLocations(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": locations,
	})
}
