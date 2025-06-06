package handler

import (
	"bytes"
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	domainEmployeeDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	employeeDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/employee"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

// Field type constants for validation
const (
	FieldTypeEmail        = "email"
	FieldTypeNIK          = "nik"
	FieldTypeEmployeeCode = "employee_code"
	FieldTypePhone        = "phone"
)

type EmployeeHandler struct {
	employeeUseCase *employeeUseCase.EmployeeUseCase
}

func NewEmployeeHandler(useCase *employeeUseCase.EmployeeUseCase) *EmployeeHandler {
	return &EmployeeHandler{
		employeeUseCase: useCase,
	}
}

func (h *EmployeeHandler) ListEmployees(c *gin.Context) {
	var queryDTO employeeDTO.ListEmployeesRequestQuery

	if bindAndValidateQuery(c, &queryDTO) {
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	currentUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	currentEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), currentUserID)
	if err != nil {
		log.Printf("EmployeeHandler: Error getting current employee for UserID %d: %v", currentUserID, err)
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
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

	filters := h.buildFilters(&queryDTO, currentEmployee.ID)

	log.Printf("EmployeeHandler: Listing employees for manager ID %d with DTO: %+v, Parsed Filters: %+v, Pagination: %+v", currentEmployee.ID, queryDTO, filters, paginationParams)

	employeeData, err := h.employeeUseCase.List(c.Request.Context(), filters, paginationParams)
	if err != nil {
		log.Printf("EmployeeHandler: Error listing employees from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employees list"))
		return
	}

	response.Success(c, http.StatusOK, "Employees retrieved successfully", employeeData)
}

func (h *EmployeeHandler) buildFilters(queryDTO *employeeDTO.ListEmployeesRequestQuery, managerID uint) map[string]interface{} {
	filters := make(map[string]interface{})

	if queryDTO.Status != nil {
		filters["employment_status"] = *queryDTO.Status == "active"
	}
	if queryDTO.Search != nil && *queryDTO.Search != "" {
		filters["search"] = *queryDTO.Search
	}
	if queryDTO.Gender != nil && *queryDTO.Gender != "" {
		filters["gender"] = *queryDTO.Gender
	}

	filters["manager_id"] = managerID

	return filters
}

func (h *EmployeeHandler) CreateEmployee(c *gin.Context) {
	var reqDTO employeeDTO.CreateEmployeeRequestDTO

	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding form data for create: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	creatorUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	creatorEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), creatorUserID)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get creator employee information: %w", err))
		return
	}

	if reqDTO.PhotoFile != nil {
		log.Printf("EmployeeHandler: Photo file detected: %s", reqDTO.PhotoFile.Filename)
	}

	employeeDomain, err := employeeDTO.MapCreateDTOToDomain(&reqDTO)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	createdEmployee, err := h.employeeUseCase.Create(c.Request.Context(), employeeDomain, creatorEmployee.ID)
	if err != nil {
		h.handleCreateEmployeeError(c, err)
		return
	}

	if reqDTO.PhotoFile != nil {
		createdEmployee = h.handlePhotoUploadForNewEmployee(c, createdEmployee, reqDTO.PhotoFile)
	}

	respDTO := domainEmployeeDTO.ToEmployeeResponseDTO(createdEmployee)
	response.Success(c, http.StatusCreated, "Employee created successfully", respDTO)
}

func (h *EmployeeHandler) handleCreateEmployeeError(c *gin.Context, err error) {
	log.Printf("EmployeeHandler: Error creating employee from use case: %v", err)
	if errors.Is(err, domain.ErrUserAlreadyExists) || errors.Is(err, domain.ErrEmailAlreadyExists) {
		response.Error(c, http.StatusConflict, "Failed to create employee: user or email already exists.", err)
	} else {
		response.InternalServerError(c, fmt.Errorf("failed to create employee: %w", err))
	}
}

func (h *EmployeeHandler) handlePhotoUploadForNewEmployee(c *gin.Context, createdEmployee *domain.Employee, photoFile *multipart.FileHeader) *domain.Employee {
	log.Printf("EmployeeHandler: Uploading photo for newly created employee ID: %d", createdEmployee.ID)

	updatedEmployee, err := h.employeeUseCase.UploadProfilePhoto(c.Request.Context(), createdEmployee.ID, photoFile)
	if err != nil {
		log.Printf("EmployeeHandler: Error uploading photo for new employee: %v", err)
		log.Printf("EmployeeHandler: Employee created successfully but photo upload failed")
		return createdEmployee
	}

	log.Printf("EmployeeHandler: Photo uploaded successfully for new employee")
	return updatedEmployee
}

func (h *EmployeeHandler) GetEmployeeByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	employeeDTO, err := h.employeeUseCase.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
			return
		}
		log.Printf("EmployeeHandler: Error getting employee by ID %d from use case: %v", id, err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employee"))
		return
	}

	response.Success(c, http.StatusOK, "Employee retrieved successfully", employeeDTO)
}

func (h *EmployeeHandler) UpdateEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	var reqDTO employeeDTO.UpdateEmployeeRequestDTO
	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding form data for update: %v", err)
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	if reqDTO.PhotoFile != nil {
		mimeType := reqDTO.PhotoFile.Header.Get("Content-Type")
		log.Printf("EmployeeHandler: Photo file MIME type detected: %s", mimeType)

		if !isAllowedPhotoMimeType(mimeType) {
			log.Printf("EmployeeHandler: Photo MIME type not allowed: %s", mimeType)
			response.BadRequest(c, fmt.Sprintf("Photo file type not allowed. Detected: %s. Allowed types: %s", mimeType, strings.Join(allowedPhotoMimeTypes, ", ")), nil)
			return
		}
	}

	employeeUpdatePayload, err := employeeDTO.MapUpdateDTOToDomain(uint(id), &reqDTO)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	updatedEmployee, err := h.employeeUseCase.Update(c.Request.Context(), employeeUpdatePayload)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found for update", err)
			return
		}
		log.Printf("EmployeeHandler: Error updating employee from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to update employee: %w", err))
		return
	}

	if reqDTO.PhotoFile != nil {
		log.Printf("EmployeeHandler: Uploading photo for updated employee ID: %d", uint(id))

		updatedEmployeeWithPhoto, err := h.employeeUseCase.UploadProfilePhoto(c.Request.Context(), uint(id), reqDTO.PhotoFile)
		if err != nil {
			log.Printf("EmployeeHandler: Error uploading photo for updated employee: %v", err)
			log.Printf("EmployeeHandler: Employee updated successfully but photo upload failed")
		} else {
			updatedEmployee = updatedEmployeeWithPhoto
			log.Printf("EmployeeHandler: Photo uploaded successfully for updated employee")
		}
	}

	respDTO := domainEmployeeDTO.ToEmployeeResponseDTO(updatedEmployee)
	response.Success(c, http.StatusOK, "Employee updated successfully", respDTO)
}

func (h *EmployeeHandler) ResignEmployee(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	err = h.employeeUseCase.Resign(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found for resignation", err)
			return
		}
		log.Printf("EmployeeHandler: Error resigning employee from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to resign employee: %w", err))
		return
	}

	response.Success(c, http.StatusOK, "Employee resigned successfully", nil)
}

var allowedPhotoMimeTypes = []string{
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/gif",
	"image/webp",
}

func isAllowedPhotoMimeType(mimeType string) bool {
	for _, allowed := range allowedPhotoMimeTypes {
		if strings.EqualFold(mimeType, allowed) {
			return true
		}
	}
	return false
}

func (h *EmployeeHandler) UploadEmployeePhoto(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		response.BadRequest(c, "Invalid employee ID format", err)
		return
	}

	var reqDTO employeeDTO.UploadEmployeePhotoRequestDTO
	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding photo upload request: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	if reqDTO.File != nil {
		mimeType := reqDTO.File.Header.Get("Content-Type")
		log.Printf("EmployeeHandler: Photo file MIME type detected: %s", mimeType)

		if !isAllowedPhotoMimeType(mimeType) {
			log.Printf("EmployeeHandler: Photo MIME type not allowed: %s", mimeType)
			response.BadRequest(c, fmt.Sprintf("File type not allowed. Detected: %s. Allowed types: %s", mimeType, strings.Join(allowedPhotoMimeTypes, ", ")), nil)
			return
		}
	}

	log.Printf("EmployeeHandler: Uploading photo for employee ID: %d", id)

	updatedEmployee, err := h.employeeUseCase.UploadProfilePhoto(c.Request.Context(), uint(id), reqDTO.File)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			response.NotFound(c, "Employee not found", err)
			return
		}
		log.Printf("EmployeeHandler: Error uploading photo: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to upload photo"))
		return
	}

	respDTO := domainEmployeeDTO.ToEmployeeResponseDTO(updatedEmployee)
	response.Success(c, http.StatusOK, "Photo uploaded successfully", respDTO)
}

func (h *EmployeeHandler) GetEmployeeStatistics(c *gin.Context) {
	log.Printf("EmployeeHandler: GetEmployeeStatistics called")

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	currentUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	currentEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), currentUserID)
	if err != nil {
		log.Printf("EmployeeHandler: Error getting current employee for UserID %d: %v", currentUserID, err)
		response.InternalServerError(c, fmt.Errorf("failed to get current employee information: %w", err))
		return
	}

	statisticsData, err := h.employeeUseCase.GetStatisticsByManager(c.Request.Context(), currentEmployee.ID)
	if err != nil {
		log.Printf("EmployeeHandler: Error getting employee statistics from use case for manager %d: %v", currentEmployee.ID, err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employee statistics"))
		return
	}

	response.Success(c, http.StatusOK, "Employee statistics retrieved successfully", statisticsData)
}

func (h *EmployeeHandler) BulkImportEmployees(c *gin.Context) {
	var reqDTO employeeDTO.BulkImportEmployeesRequestDTO
	if err := c.ShouldBind(&reqDTO); err != nil {
		log.Printf("EmployeeHandler: Error binding bulk import request: %v", err)
		response.BadRequest(c, "Invalid request format", err)
		return
	}

	if reqDTO.File == nil {
		response.BadRequest(c, "File is required", fmt.Errorf("no file provided"))
		return
	}

	mimeType := reqDTO.File.Header.Get("Content-Type")
	log.Printf("EmployeeHandler: Import file MIME type detected: %s", mimeType)

	if !h.isValidImportFileType(mimeType) {
		response.BadRequest(c, fmt.Sprintf("File type not allowed. Detected: %s. Allowed types: CSV, Excel", mimeType), nil)
		return
	}

	userIDCtx, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User ID not found in context", fmt.Errorf("missing userID in context"))
		return
	}
	creatorUserID, ok := userIDCtx.(uint)
	if !ok {
		response.InternalServerError(c, fmt.Errorf("invalid user ID type in context"))
		return
	}

	creatorEmployee, err := h.employeeUseCase.GetEmployeeByUserID(c.Request.Context(), creatorUserID)
	if err != nil {
		response.InternalServerError(c, fmt.Errorf("failed to get creator employee information: %w", err))
		return
	}

	employees, parseErrors, err := h.parseImportFile(reqDTO.File)
	if err != nil {
		log.Printf("EmployeeHandler: Error parsing import file: %v", err)
		response.BadRequest(c, fmt.Sprintf("Failed to parse file: %v", err), err)
		return
	}

	if len(parseErrors) > 0 {
		response.BadRequest(c, "File contains validation errors", fmt.Errorf("file contains %d validation errors", len(parseErrors)))
		return
	}

	if len(employees) == 0 {
		response.BadRequest(c, "No valid employee data found in file", nil)
		return
	}

	successfulIDs, importErrors := h.employeeUseCase.BulkImportWithTransaction(c.Request.Context(), employees, creatorEmployee.ID)

	result := h.buildBulkImportResult(successfulIDs, importErrors)

	if len(importErrors) > 0 {
		response.Success(c, http.StatusPartialContent, fmt.Sprintf("Import completed with %d successes and %d errors", len(successfulIDs), len(importErrors)), result)
	} else {
		response.Success(c, http.StatusCreated, fmt.Sprintf("Successfully imported %d employees", len(successfulIDs)), result)
	}
}

func (h *EmployeeHandler) ValidateUniqueField(c *gin.Context) {
	fieldType := c.Query("field")
	value := c.Query("value")

	if fieldType == "" || value == "" {
		response.BadRequest(c, "Both 'field' and 'value' query parameters are required", nil)
		return
	}

	if fieldType != FieldTypeEmail && fieldType != FieldTypeNIK && fieldType != FieldTypeEmployeeCode && fieldType != FieldTypePhone {
		response.BadRequest(c, "Field must be one of: email, nik, employee_code, phone", nil)
		return
	}

	var exists bool
	var err error

	switch fieldType {
	case FieldTypeEmail:
		_, err = h.employeeUseCase.GetUserByEmail(c.Request.Context(), value)
		exists = err == nil
	case FieldTypeNIK:
		_, err = h.employeeUseCase.GetByNIK(c.Request.Context(), value)
		exists = err == nil
	case FieldTypeEmployeeCode:
		_, err = h.employeeUseCase.GetByEmployeeCode(c.Request.Context(), value)
		exists = err == nil
	case FieldTypePhone:
		_, err = h.employeeUseCase.GetUserByPhone(c.Request.Context(), value)
		exists = err == nil
	}

	// If there was an error other than "not found", return server error
	if err != nil && !strings.Contains(err.Error(), "not found") && !strings.Contains(err.Error(), "record not found") {
		log.Printf("EmployeeHandler: Error validating unique field %s=%s: %v", fieldType, value, err)
		response.InternalServerError(c, fmt.Errorf("validation error"))
		return
	}

	result := map[string]interface{}{
		"field":  fieldType,
		"value":  value,
		"exists": exists,
	}

	if exists {
		caser := cases.Title(language.English)
		result["message"] = fmt.Sprintf("%s '%s' is already in use", caser.String(strings.ReplaceAll(fieldType, "_", " ")), value)
	}

	response.Success(c, http.StatusOK, "Field validation completed", result)
}

func (h *EmployeeHandler) isValidImportFileType(mimeType string) bool {
	allowedTypes := []string{
		"text/csv",
		"application/csv",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	}

	for _, allowedType := range allowedTypes {
		if mimeType == allowedType {
			return true
		}
	}
	return false
}

func (h *EmployeeHandler) buildBulkImportResult(successfulIDs []uint, importErrors []employeeUseCase.EmployeeImportError) employeeDTO.BulkImportResult {
	result := employeeDTO.BulkImportResult{
		SuccessCount: len(successfulIDs),
		ErrorCount:   len(importErrors),
	}

	for _, importErr := range importErrors {
		failedRow := employeeDTO.BulkImportFailedRow{
			Row: importErr.Row,
			Errors: []employeeDTO.BulkImportError{
				{
					Field:   importErr.Field,
					Message: importErr.Message,
					Value:   importErr.Value,
				},
			},
		}
		result.FailedRows = append(result.FailedRows, failedRow)
	}

	return result
}

func (h *EmployeeHandler) parseImportFile(file *multipart.FileHeader) ([]*domain.Employee, []employeeDTO.BulkImportError, error) {
	src, err := file.Open()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open file: %w", err)
	}
	defer func() {
		if closeErr := src.Close(); closeErr != nil {
			log.Printf("Warning: failed to close file: %v", closeErr)
		}
	}()

	var employees []*domain.Employee
	var parseErrors []employeeDTO.BulkImportError

	mimeType := file.Header.Get("Content-Type")

	if strings.Contains(mimeType, "csv") {
		employees, parseErrors, err = h.parseCSVFile(src)
	} else if strings.Contains(mimeType, "excel") || strings.Contains(mimeType, "spreadsheet") {
		employees, parseErrors, err = h.parseExcelFile(src)
	} else {
		return nil, nil, fmt.Errorf("unsupported file type: %s", mimeType)
	}

	if err != nil {
		return nil, nil, err
	}

	return employees, parseErrors, nil
}

func (h *EmployeeHandler) parseCSVFile(src io.Reader) ([]*domain.Employee, []employeeDTO.BulkImportError, error) {
	reader := csv.NewReader(src)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read CSV: %w", err)
	}

	if len(records) < 2 {
		return nil, nil, fmt.Errorf("CSV file must contain header and at least one data row")
	}

	headers := records[0]
	var employees []*domain.Employee
	var parseErrors []employeeDTO.BulkImportError

	for i, record := range records[1:] {
		rowNum := i + 2

		if len(record) != len(headers) {
			parseErrors = append(parseErrors, employeeDTO.BulkImportError{
				Field:   "row",
				Message: fmt.Sprintf("Row %d has %d columns, expected %d", rowNum, len(record), len(headers)),
			})
			continue
		}

		employee, rowErrors := employeeDTO.ParseEmployeeFromRecord(headers, record, rowNum)
		if len(rowErrors) > 0 {
			parseErrors = append(parseErrors, rowErrors...)
			continue
		}

		employees = append(employees, employee)
	}

	return employees, parseErrors, nil
}

func (h *EmployeeHandler) parseExcelFile(src io.Reader) ([]*domain.Employee, []employeeDTO.BulkImportError, error) {
	content, err := io.ReadAll(src)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to read Excel file: %w", err)
	}

	f, err := excelize.OpenReader(bytes.NewReader(content))
	if err != nil {
		return nil, nil, fmt.Errorf("failed to open Excel file: %w", err)
	}
	defer func() {
		if closeErr := f.Close(); closeErr != nil {
			log.Printf("Warning: failed to close Excel file: %v", closeErr)
		}
	}()

	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, nil, fmt.Errorf("excel file contains no sheets")
	}

	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to get rows from Excel: %w", err)
	}

	if len(rows) < 2 {
		return nil, nil, fmt.Errorf("excel file must contain header and at least one data row")
	}

	headers := rows[0]
	var employees []*domain.Employee
	var parseErrors []employeeDTO.BulkImportError

	for i, row := range rows[1:] {
		rowNum := i + 2

		for len(row) < len(headers) {
			row = append(row, "")
		}

		employee, rowErrors := employeeDTO.ParseEmployeeFromRecord(headers, row, rowNum)
		if len(rowErrors) > 0 {
			parseErrors = append(parseErrors, rowErrors...)
			continue
		}

		employees = append(employees, employee)
	}

	return employees, parseErrors, nil
}
