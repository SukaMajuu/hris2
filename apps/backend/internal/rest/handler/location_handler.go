package handler

import (
	"errors"
	"strconv" // Added for Atoi conversion

	"github.com/SukaMajuu/hris/apps/backend/domain"
	locationDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/check-clock/location"
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
	var req locationDTO.CreateLocationRequest
	if bindAndValidate(c, &req) {
		return
	}

	createdLocation, err := h.locationUseCase.Create(c.Request.Context(), &domain.Location{
		Name:          req.Name,
		AddressDetail: req.AddressDetail,
		Latitude:      req.Latitude,
		Longitude:     req.Longitude,
		RadiusM:       req.RadiusM,
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, "Location created successfully", createdLocation)
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

func (h *LocationHandler) GetLocationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	location, err := h.locationUseCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrLocationNotFound) {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully retrieved location", location)
}

func (h *LocationHandler) UpdateLocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	var req locationDTO.UpdateLocationRequest
	if bindAndValidate(c, &req) {
		return
	}

	updatedLocation, err := h.locationUseCase.Update(c.Request.Context(), uint(id), &domain.Location{
		Name:          req.Name,
		AddressDetail: req.AddressDetail,
		Latitude:      req.Latitude,
		Longitude:     req.Longitude,
		RadiusM:       req.RadiusM,
	})

	if err != nil {
		if errors.Is(err, domain.ErrLocationNotFound) {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully updated location", updatedLocation)
}

func (h *LocationHandler) DeleteLocation(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid ID format", err)
		return
	}

	err = h.locationUseCase.Delete(c.Request.Context(), uint(id))
	if err != nil {
		// Use errors.Is instead of string matching for better error handling
		if errors.Is(err, domain.ErrLocationNotFound) {
			response.NotFound(c, err.Error(), nil)
			return
		}
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully deleted location", nil)
}
