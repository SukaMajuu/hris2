package handler

import (
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

	err := h.locationUseCase.Create(c.Request.Context(), &domain.Location{
		Name:      req.Name,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		RadiusM:   req.RadiusM,
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.Created(c, "Location created successfully", req)
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
	id := c.Param("id")

	location, err := h.locationUseCase.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, domain.ErrLocationNotFound.Error(), err)
		return
	}

	response.OK(c, "Successfully retrieved location", location)
}

func (h *LocationHandler) UpdateLocation(c *gin.Context) {
	id := c.Param("id")
	var req locationDTO.UpdateLocationRequest
	if bindAndValidate(c, &req) {
		return
	}

	err := h.locationUseCase.Update(c.Request.Context(), id, &domain.Location{
		Name:      req.Name,
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		RadiusM:   req.RadiusM,
	})

	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully updated location", req)
}

func (h *LocationHandler) DeleteLocation(c *gin.Context) {
	id := c.Param("id")

	err := h.locationUseCase.Delete(c.Request.Context(), id)
	if err != nil {
		response.InternalServerError(c, err)
		return
	}

	response.OK(c, "Successfully deleted location", nil)
}
