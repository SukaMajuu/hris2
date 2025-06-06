package handler

import (
	"encoding/csv"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	domainEmployeeDTO "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	employeeDTO "github.com/SukaMajuu/hris/apps/backend/internal/rest/dto/employee"
	employeeUseCase "github.com/SukaMajuu/hris/apps/backend/internal/usecase/employee"
	"github.com/SukaMajuu/hris/apps/backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
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

	filters["manager_id"] = currentEmployee.ID

	log.Printf("EmployeeHandler: Listing employees for manager ID %d with DTO: %+v, Parsed Filters: %+v, Pagination: %+v", currentEmployee.ID, queryDTO, filters, paginationParams)

	employeeData, err := h.employeeUseCase.List(c.Request.Context(), filters, paginationParams)
	if err != nil {
		log.Printf("EmployeeHandler: Error listing employees from use case: %v", err)
		response.InternalServerError(c, fmt.Errorf("failed to retrieve employees list"))
		return
	}

	response.Success(c, http.StatusOK, "Employees retrieved successfully", employeeData)
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

	respDTO := h.mapDomainToResponseDTO(createdEmployee)
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

func (h *EmployeeHandler) mapUpdateDTOToDomain(employeeID uint, reqDTO *employeeDTO.UpdateEmployeeRequestDTO) (*domain.Employee, error) {
	employeeUpdatePayload := &domain.Employee{
		ID: employeeID,
	}

	if reqDTO.Email != nil || reqDTO.Phone != nil {
		employeeUpdatePayload.User = domain.User{}
		if reqDTO.Email != nil {
			employeeUpdatePayload.User.Email = *reqDTO.Email
		}
		if reqDTO.Phone != nil {
			employeeUpdatePayload.User.Phone = *reqDTO.Phone
		}
	}

	if reqDTO.FirstName != nil {
		employeeUpdatePayload.FirstName = *reqDTO.FirstName
	}
	if reqDTO.LastName != nil {
		employeeUpdatePayload.LastName = reqDTO.LastName
	}
	if reqDTO.PositionName != nil {
		employeeUpdatePayload.PositionName = *reqDTO.PositionName
	}
	if reqDTO.EmploymentStatus != nil {
		employeeUpdatePayload.EmploymentStatus = *reqDTO.EmploymentStatus
	}
	if reqDTO.EmployeeCode != nil {
		employeeUpdatePayload.EmployeeCode = reqDTO.EmployeeCode
	}
	if reqDTO.Branch != nil {
		employeeUpdatePayload.Branch = reqDTO.Branch
	}
	if reqDTO.Gender != nil {
		employeeUpdatePayload.Gender = reqDTO.Gender
	}
	if reqDTO.NIK != nil {
		employeeUpdatePayload.NIK = reqDTO.NIK
	}
	if reqDTO.PlaceOfBirth != nil {
		employeeUpdatePayload.PlaceOfBirth = reqDTO.PlaceOfBirth
	}
	if reqDTO.DateOfBirth != nil && *reqDTO.DateOfBirth != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.DateOfBirth)
		if err != nil {
			log.Printf("EmployeeHandler: Error parsing DateOfBirth '%s': %v", *reqDTO.DateOfBirth, err)
			return nil, fmt.Errorf("invalid DateOfBirth format. Please use YYYY-MM-DD. Value: %s", *reqDTO.DateOfBirth)
		}
		employeeUpdatePayload.DateOfBirth = &parsedDate
	}
	if reqDTO.LastEducation != nil {
		employeeUpdatePayload.LastEducation = reqDTO.LastEducation
	}
	if reqDTO.Grade != nil {
		employeeUpdatePayload.Grade = reqDTO.Grade
	}
	if reqDTO.ContractType != nil {
		employeeUpdatePayload.ContractType = reqDTO.ContractType
	}
	if reqDTO.ResignationDate != nil && *reqDTO.ResignationDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.ResignationDate)
		if err != nil {
			return nil, fmt.Errorf("invalid ResignationDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.ResignationDate)
		}
		employeeUpdatePayload.ResignationDate = &parsedDate
	}
	if reqDTO.HireDate != nil && *reqDTO.HireDate != "" {
		parsedDate, err := time.Parse("2006-01-02", *reqDTO.HireDate)
		if err != nil {
			return nil, fmt.Errorf("invalid HireDate format. Please use YYYY-MM-DD. Value: %s", *reqDTO.HireDate)
		}
		employeeUpdatePayload.HireDate = &parsedDate
	}
	if reqDTO.BankName != nil {
		employeeUpdatePayload.BankName = reqDTO.BankName
	}
	if reqDTO.BankAccountNumber != nil {
		employeeUpdatePayload.BankAccountNumber = reqDTO.BankAccountNumber
	}
	if reqDTO.BankAccountHolderName != nil {
		employeeUpdatePayload.BankAccountHolderName = reqDTO.BankAccountHolderName
	}
	if reqDTO.TaxStatus != nil {
		employeeUpdatePayload.TaxStatus = reqDTO.TaxStatus
	}
	if reqDTO.ProfilePhotoURL != nil {
		employeeUpdatePayload.ProfilePhotoURL = reqDTO.ProfilePhotoURL
	}
	return employeeUpdatePayload, nil
}

func (h *EmployeeHandler) mapDomainToResponseDTO(employee *domain.Employee) *domainEmployeeDTO.EmployeeResponseDTO {
	var genderDTO *string
	if employee.Gender != nil {
		genderStr := string(*employee.Gender)
		genderDTO = &genderStr
	}
	var phoneDTO *string
	if employee.User.Phone != "" {
		phoneDTO = &employee.User.Phone
	}

	respDTO := &domainEmployeeDTO.EmployeeResponseDTO{
		ID:                    employee.ID,
		Email:                 &employee.User.Email,
		Phone:                 phoneDTO,
		FirstName:             employee.FirstName,
		LastName:              employee.LastName,
		EmployeeCode:          employee.EmployeeCode,
		PositionName:          employee.PositionName,
		Branch:                employee.Branch,
		Gender:                genderDTO,
		NIK:                   employee.NIK,
		PlaceOfBirth:          employee.PlaceOfBirth,
		Grade:                 employee.Grade,
		EmploymentStatus:      employee.EmploymentStatus,
		BankName:              employee.BankName,
		BankAccountNumber:     employee.BankAccountNumber,
		BankAccountHolderName: employee.BankAccountHolderName,
		ProfilePhotoURL:       employee.ProfilePhotoURL,
		CreatedAt:             employee.CreatedAt.Format(time.RFC3339),
		UpdatedAt:             employee.UpdatedAt.Format(time.RFC3339),
	}

	if employee.LastEducation != nil {
		lastEducationStr := string(*employee.LastEducation)
		respDTO.LastEducation = &lastEducationStr
	}
	if employee.ContractType != nil {
		contractTypeStr := string(*employee.ContractType)
		respDTO.ContractType = &contractTypeStr
	}
	if employee.TaxStatus != nil {
		taxStatusStr := string(*employee.TaxStatus)
		respDTO.TaxStatus = &taxStatusStr
	}
	if employee.DateOfBirth != nil {
		dateOfBirthStr := employee.DateOfBirth.Format("2006-01-02")
		respDTO.DateOfBirth = &dateOfBirthStr
	}
	if employee.HireDate != nil {
		hireDateStr := employee.HireDate.Format("2006-01-02")
		respDTO.HireDate = &hireDateStr
	}
	if employee.ResignationDate != nil {
		resignationDateStr := employee.ResignationDate.Format("2006-01-02")
		respDTO.ResignationDate = &resignationDateStr
	}
	if employee.User.Email == "" {
		respDTO.Email = nil
	}
	return respDTO
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

	employeeUpdatePayload, err := h.mapUpdateDTOToDomain(uint(id), &reqDTO)
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

	respDTO := h.mapDomainToResponseDTO(updatedEmployee)

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

	respDTO := h.mapDomainToResponseDTO(updatedEmployee)
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

	var allowedTypes = []string{
		"text/csv",
		"application/csv",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	}

	isAllowed := false
	for _, allowedType := range allowedTypes {
		if mimeType == allowedType {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
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

	if len(importErrors) > 0 {
		response.Success(c, http.StatusPartialContent, fmt.Sprintf("Import completed with %d successes and %d errors", len(successfulIDs), len(importErrors)), result)
	} else {
		response.Success(c, http.StatusCreated, fmt.Sprintf("Successfully imported %d employees", len(successfulIDs)), result)
	}
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

		employee, rowErrors := h.parseEmployeeFromRecord(headers, record, rowNum)
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

	f, err := excelize.OpenReader(strings.NewReader(string(content)))
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

		employee, rowErrors := h.parseEmployeeFromRecord(headers, row, rowNum)
		if len(rowErrors) > 0 {
			parseErrors = append(parseErrors, rowErrors...)
			continue
		}

		employees = append(employees, employee)
	}

	return employees, parseErrors, nil
}

func (h *EmployeeHandler) parseEmployeeFromRecord(headers, record []string, rowNum int) (*domain.Employee, []employeeDTO.BulkImportError) {
	var errors []employeeDTO.BulkImportError

	fieldMap := make(map[string]string)
	for i, header := range headers {
		normalizedHeader := strings.ToLower(strings.TrimSpace(header))
		normalizedHeader = strings.ReplaceAll(normalizedHeader, " ", "_")
		if i < len(record) {
			fieldMap[normalizedHeader] = strings.TrimSpace(record[i])
		}
	}

	requiredFields := []string{"email", "first_name", "position_name"}
	for _, field := range requiredFields {
		if fieldMap[field] == "" {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   field,
				Message: fmt.Sprintf("Row %d: %s is required", rowNum, field),
				Value:   fieldMap[field],
			})
		}
	}

	if len(errors) > 0 {
		return nil, errors
	}

	user := domain.User{
		Email:    fieldMap["email"],
		Password: "password",
	}

	if fieldMap["phone"] != "" {
		user.Phone = fieldMap["phone"]
	}

	employee := &domain.Employee{
		User:         user,
		FirstName:    fieldMap["first_name"],
		PositionName: fieldMap["position_name"],
	}

	if fieldMap["last_name"] != "" {
		lastName := fieldMap["last_name"]
		employee.LastName = &lastName
	}
	if fieldMap["employee_code"] != "" {
		employeeCode := fieldMap["employee_code"]
		employee.EmployeeCode = &employeeCode
	}
	if fieldMap["branch"] != "" {
		branch := fieldMap["branch"]
		employee.Branch = &branch
	}
	if fieldMap["gender"] != "" {
		if fieldMap["gender"] == "Male" || fieldMap["gender"] == "Female" {
			gender := enums.Gender(fieldMap["gender"])
			employee.Gender = &gender
		} else {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   "gender",
				Message: fmt.Sprintf("Row %d: gender must be 'Male' or 'Female'", rowNum),
				Value:   fieldMap["gender"],
			})
		}
	}
	if fieldMap["nik"] != "" {
		nik := fieldMap["nik"]
		employee.NIK = &nik
	}
	if fieldMap["place_of_birth"] != "" {
		placeOfBirth := fieldMap["place_of_birth"]
		employee.PlaceOfBirth = &placeOfBirth
	}
	if fieldMap["grade"] != "" {
		grade := fieldMap["grade"]
		employee.Grade = &grade
	}

	if fieldMap["date_of_birth"] != "" {
		if date, err := time.Parse("2006-01-02", fieldMap["date_of_birth"]); err == nil {
			employee.DateOfBirth = &date
		} else {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   "date_of_birth",
				Message: fmt.Sprintf("Row %d: date_of_birth must be in YYYY-MM-DD format", rowNum),
				Value:   fieldMap["date_of_birth"],
			})
		}
	}

	if fieldMap["hire_date"] != "" {
		if date, err := time.Parse("2006-01-02", fieldMap["hire_date"]); err == nil {
			employee.HireDate = &date
		} else {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   "hire_date",
				Message: fmt.Sprintf("Row %d: hire_date must be in YYYY-MM-DD format", rowNum),
				Value:   fieldMap["hire_date"],
			})
		}
	}

	if fieldMap["last_education"] != "" {
		validEducation := []string{"SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "S1/D4", "S2", "S3", "Other"}
		found := false
		for _, valid := range validEducation {
			if fieldMap["last_education"] == valid {
				education := enums.EducationLevel(fieldMap["last_education"])
				employee.LastEducation = &education
				found = true
				break
			}
		}
		if !found {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   "last_education",
				Message: fmt.Sprintf("Row %d: invalid education level", rowNum),
				Value:   fieldMap["last_education"],
			})
		}
	}

	if fieldMap["contract_type"] != "" {
		validContracts := []string{"permanent", "contract", "freelance"}
		found := false
		for _, valid := range validContracts {
			if fieldMap["contract_type"] == valid {
				contract := enums.ContractType(fieldMap["contract_type"])
				employee.ContractType = &contract
				found = true
				break
			}
		}
		if !found {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   "contract_type",
				Message: fmt.Sprintf("Row %d: invalid contract type", rowNum),
				Value:   fieldMap["contract_type"],
			})
		}
	}

	if fieldMap["tax_status"] != "" {
		validTaxStatus := []string{"TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3", "K/I/0", "K/I/1", "K/I/2", "K/I/3"}
		found := false
		for _, valid := range validTaxStatus {
			if fieldMap["tax_status"] == valid {
				tax := enums.TaxStatus(fieldMap["tax_status"])
				employee.TaxStatus = &tax
				found = true
				break
			}
		}
		if !found {
			errors = append(errors, employeeDTO.BulkImportError{
				Field:   "tax_status",
				Message: fmt.Sprintf("Row %d: invalid tax status", rowNum),
				Value:   fieldMap["tax_status"],
			})
		}
	}

	if fieldMap["bank_name"] != "" {
		bankName := fieldMap["bank_name"]
		employee.BankName = &bankName
	}
	if fieldMap["bank_account_number"] != "" {
		bankAccountNumber := fieldMap["bank_account_number"]
		employee.BankAccountNumber = &bankAccountNumber
	}
	if fieldMap["bank_account_holder_name"] != "" {
		bankAccountHolderName := fieldMap["bank_account_holder_name"]
		employee.BankAccountHolderName = &bankAccountHolderName
	}

	if len(errors) > 0 {
		return nil, errors
	}

	return employee, nil
}
