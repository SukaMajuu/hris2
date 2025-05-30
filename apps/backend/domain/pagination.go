package domain

import (
	"github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/domain/dto/location"
	"github.com/SukaMajuu/hris/apps/backend/domain/dto/work_schedule"
)

type Pagination struct {
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
	CurrentPage int   `json:"current_page"`
	PageSize    int   `json:"page_size"`
	HasNextPage bool  `json:"has_next_page"`
	HasPrevPage bool  `json:"has_prev_page"`
}

type PaginationParams struct {
	Page     int `json:"page"`
	PageSize int `json:"page_size"`
}

type EmployeeListResponseData struct {
	Items      []*employee.EmployeeResponseDTO `json:"items"`
	Pagination Pagination                      `json:"pagination"`
}

type LocationListResponseData struct {
	Items      []*location.LocationResponseDTO `json:"items"`
	Pagination Pagination                      `json:"pagination"`
}

type WorkScheduleListResponseData struct {
	Items      []*work_schedule.WorkScheduleResponseDTO `json:"items"`
	Pagination Pagination                               `json:"pagination"`
}
