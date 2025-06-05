package leave_request

import (
	"context"
	"fmt"
	"log"
	"math"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoleave "github.com/SukaMajuu/hris/apps/backend/domain/dto/leave_request"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"github.com/supabase-community/supabase-go"
)

const bucketNameAttachments = "leave-attachments"

type LeaveRequestUseCase struct {
	leaveRequestRepo interfaces.LeaveRequestRepository
	employeeRepo     interfaces.EmployeeRepository
	supabaseClient   *supabase.Client
}

func NewLeaveRequestUseCase(
	leaveRequestRepo interfaces.LeaveRequestRepository,
	employeeRepo interfaces.EmployeeRepository,
	supabaseClient *supabase.Client,
) *LeaveRequestUseCase {
	return &LeaveRequestUseCase{
		leaveRequestRepo: leaveRequestRepo,
		employeeRepo:     employeeRepo,
		supabaseClient:   supabaseClient,
	}
}

func toLeaveRequestResponseDTO(lr *domain.LeaveRequest) *dtoleave.LeaveRequestResponseDTO {
	employeeName := lr.Employee.FirstName
	if lr.Employee.LastName != nil {
		employeeName += " " + *lr.Employee.LastName
	}

	positionName := "Unknown Position"
	if lr.Employee.PositionName != "" {
		positionName = lr.Employee.PositionName
	}

	return &dtoleave.LeaveRequestResponseDTO{
		ID:           lr.ID,
		EmployeeID:   lr.EmployeeID,
		EmployeeName: employeeName,
		PositionName: positionName,
		LeaveType:    string(lr.LeaveType),
		StartDate:    lr.StartDate.Format("2006-01-02"),
		EndDate:      lr.EndDate.Format("2006-01-02"),
		Attachment:   lr.Attachment,
		EmployeeNote: lr.EmployeeNote,
		AdminNote:    lr.AdminNote,
		Status:       string(lr.Status),
		CreatedAt:    lr.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    lr.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func (uc *LeaveRequestUseCase) Create(ctx context.Context, leaveRequest *domain.LeaveRequest, file *multipart.FileHeader) (*dtoleave.LeaveRequestResponseDTO, error) {
	log.Printf("LeaveRequestUseCase: Create called for employee ID %d", leaveRequest.EmployeeID)

	// Validate employee exists
	employee, err := uc.employeeRepo.GetByID(ctx, leaveRequest.EmployeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to validate employee ID %d: %w", leaveRequest.EmployeeID, err)
	}
	if employee == nil {
		return nil, fmt.Errorf("employee with ID %d not found", leaveRequest.EmployeeID)
	}

	// Validate dates
	if leaveRequest.StartDate.After(leaveRequest.EndDate) {
		return nil, fmt.Errorf("start date cannot be after end date")
	}
	// Handle file upload if provided
	if file != nil && file.Size > 0 && file.Filename != "" && uc.supabaseClient != nil {
		fileName := uc.generateFileName(employee, file.Filename)
		
		// Open the file
		src, err := file.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open attachment file: %w", err)
		}
		defer src.Close()

		// Upload to Supabase Storage
		_, err = uc.supabaseClient.Storage.UploadFile(bucketNameAttachments, fileName, src)
		if err != nil {
			return nil, fmt.Errorf("failed to upload attachment: %w", err)
		}

		// Set the attachment path
		leaveRequest.Attachment = &fileName
	}

	// Set default status
	leaveRequest.Status = domain.LeaveStatusPending

	// Create the leave request
	err = uc.leaveRequestRepo.Create(ctx, leaveRequest)
	if err != nil {
		// Cleanup uploaded file if creation fails
		if leaveRequest.Attachment != nil && uc.supabaseClient != nil {
			_, _ = uc.supabaseClient.Storage.RemoveFile(bucketNameAttachments, []string{*leaveRequest.Attachment})
		}
		return nil, fmt.Errorf("failed to create leave request: %w", err)
	}

	// Get the created leave request with employee data
	createdLeaveRequest, err := uc.leaveRequestRepo.GetByID(ctx, leaveRequest.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve created leave request: %w", err)
	}

	log.Printf("LeaveRequestUseCase: Successfully created leave request with ID %d", leaveRequest.ID)
	return toLeaveRequestResponseDTO(createdLeaveRequest), nil
}

func (uc *LeaveRequestUseCase) GetByID(ctx context.Context, id uint) (*dtoleave.LeaveRequestResponseDTO, error) {
	log.Printf("LeaveRequestUseCase: GetByID called for ID: %d", id)

	leaveRequest, err := uc.leaveRequestRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get leave request by ID %d: %w", id, err)
	}

	return toLeaveRequestResponseDTO(leaveRequest), nil
}

func (uc *LeaveRequestUseCase) GetByEmployeeID(ctx context.Context, employeeID uint, paginationParams domain.PaginationParams) (*dtoleave.LeaveRequestListResponseData, error) {
	log.Printf("LeaveRequestUseCase: GetByEmployeeID called for employee ID %d", employeeID)

	leaveRequests, totalItems, err := uc.leaveRequestRepo.GetByEmployeeID(ctx, employeeID, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to get leave requests for employee ID %d: %w", employeeID, err)
	}

	responseItems := make([]*dtoleave.LeaveRequestResponseDTO, len(leaveRequests))
	for i, lr := range leaveRequests {
		responseItems[i] = toLeaveRequestResponseDTO(lr)
	}

	totalPages := 0
	if paginationParams.PageSize > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize)))
	}

	return &dtoleave.LeaveRequestListResponseData{
		Items: responseItems,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page < totalPages,
			HasPrevPage: paginationParams.Page > 1,
		},
	}, nil
}

func (uc *LeaveRequestUseCase) List(ctx context.Context, filters map[string]interface{}, paginationParams domain.PaginationParams) (*dtoleave.LeaveRequestListResponseData, error) {
	log.Printf("LeaveRequestUseCase: List called with filters: %+v, pagination: %+v", filters, paginationParams)

	// Get leave requests from repository
	leaveRequests, totalItems, err := uc.leaveRequestRepo.List(ctx, filters, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list leave requests: %w", err)
	}

	// Convert to response DTOs
	leaveRequestDTOs := make([]*dtoleave.LeaveRequestResponseDTO, len(leaveRequests))
	for i, lr := range leaveRequests {
		leaveRequestDTOs[i] = toLeaveRequestResponseDTO(lr)
	}

	// Calculate pagination
	totalPages := 0
	if paginationParams.PageSize > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(paginationParams.PageSize)))
	}
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	response := &dtoleave.LeaveRequestListResponseData{
		Items: leaveRequestDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page < totalPages,
			HasPrevPage: paginationParams.Page > 1 && paginationParams.Page <= totalPages,
		},
	}

	log.Printf("LeaveRequestUseCase: Successfully listed %d leave requests", len(leaveRequestDTOs))
	return response, nil
}

func (uc *LeaveRequestUseCase) GetByEmployeeUserID(ctx context.Context, userID uint, filters map[string]interface{}, pagination domain.PaginationParams) (*dtoleave.LeaveRequestListResponseData, error) {
	log.Printf("LeaveRequestUseCase: GetByEmployeeUserID called for userID %d", userID)
	// Get employee by user ID
	employee, err := uc.employeeRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee for user ID %d: %w", userID, err)
	}
	if employee == nil {
		return nil, domain.ErrEmployeeNotFound
	}

	// Get leave requests for this employee
	leaveRequests, total, err := uc.leaveRequestRepo.GetByEmployeeID(ctx, employee.ID, pagination)
	if err != nil {
		return nil, fmt.Errorf("failed to get leave requests for employee ID %d: %w", employee.ID, err)
	}

	// Apply additional filters if needed
	filteredRequests := leaveRequests
	filteredTotal := total
	if status, ok := filters["status"].(string); ok && status != "" {
		var filtered []*domain.LeaveRequest
		for _, lr := range leaveRequests {
			if string(lr.Status) == status {
				filtered = append(filtered, lr)
			}
		}
		filteredRequests = filtered
		filteredTotal = int64(len(filtered)) // Adjust total for filtered results
	}

	if leaveType, ok := filters["leave_type"].(string); ok && leaveType != "" {
		var filtered []*domain.LeaveRequest
		for _, lr := range filteredRequests {
			if string(lr.LeaveType) == leaveType {
				filtered = append(filtered, lr)
			}
		}
		filteredRequests = filtered
		filteredTotal = int64(len(filtered)) // Adjust total for filtered results
	}

	// Convert to response DTOs
	leaveRequestDTOs := make([]*dtoleave.LeaveRequestResponseDTO, len(filteredRequests))
	for i, lr := range filteredRequests {
		leaveRequestDTOs[i] = toLeaveRequestResponseDTO(lr)
	}

	// Calculate pagination info
	totalPages := int((filteredTotal + int64(pagination.PageSize) - 1) / int64(pagination.PageSize))
	if totalPages == 0 {
		totalPages = 1
	}

	response := &dtoleave.LeaveRequestListResponseData{
		Items: leaveRequestDTOs,
		Pagination: domain.Pagination{
			TotalItems:  filteredTotal,
			TotalPages:  totalPages,
			CurrentPage: pagination.Page,
			PageSize:    pagination.PageSize,
			HasNextPage: pagination.Page < totalPages,
			HasPrevPage: pagination.Page > 1,
		},
	}

	log.Printf("LeaveRequestUseCase: Successfully retrieved %d leave requests for user ID %d", len(leaveRequestDTOs), userID)
	return response, nil
}

func (uc *LeaveRequestUseCase) Update(ctx context.Context, id uint, updates *domain.LeaveRequest, file *multipart.FileHeader) (*dtoleave.LeaveRequestResponseDTO, error) {
	log.Printf("LeaveRequestUseCase: Update called for ID %d", id)

	// Get existing leave request
	existingLeaveRequest, err := uc.leaveRequestRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get existing leave request: %w", err)
	}

	// Only allow updates if status is still pending
	if existingLeaveRequest.Status != domain.LeaveStatusPending {
		return nil, fmt.Errorf("cannot update leave request with status: %s", string(existingLeaveRequest.Status))
	}

	// Validate employee exists if employee ID is being changed
	if updates.EmployeeID != 0 && updates.EmployeeID != existingLeaveRequest.EmployeeID {
		employee, err := uc.employeeRepo.GetByID(ctx, updates.EmployeeID)
		if err != nil || employee == nil {
			return nil, fmt.Errorf("invalid employee ID: %d", updates.EmployeeID)
		}
	}

	// Update fields
	if updates.LeaveType != "" {
		existingLeaveRequest.LeaveType = updates.LeaveType
	}
	if !updates.StartDate.IsZero() {
		existingLeaveRequest.StartDate = updates.StartDate
	}
	if !updates.EndDate.IsZero() {
		existingLeaveRequest.EndDate = updates.EndDate
	}
	if updates.EmployeeNote != nil {
		existingLeaveRequest.EmployeeNote = updates.EmployeeNote
	}

	// Validate dates
	if existingLeaveRequest.StartDate.After(existingLeaveRequest.EndDate) {
		return nil, fmt.Errorf("start date cannot be after end date")
	}	// Handle file upload if provided
	var oldAttachment *string
	if file != nil && file.Size > 0 && file.Filename != "" && uc.supabaseClient != nil {
		employee, _ := uc.employeeRepo.GetByID(ctx, existingLeaveRequest.EmployeeID)
		fileName := uc.generateFileName(employee, file.Filename)
		
		// Open the file
		src, err := file.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open attachment file: %w", err)
		}
		defer src.Close()

		// Upload to Supabase Storage
		_, err = uc.supabaseClient.Storage.UploadFile(bucketNameAttachments, fileName, src)
		if err != nil {
			return nil, fmt.Errorf("failed to upload attachment: %w", err)
		}

		// Store old attachment for cleanup
		oldAttachment = existingLeaveRequest.Attachment
		existingLeaveRequest.Attachment = &fileName
	}

	// Update the leave request
	err = uc.leaveRequestRepo.Update(ctx, existingLeaveRequest)
	if err != nil {
		// Cleanup new file if update fails
		if file != nil && existingLeaveRequest.Attachment != nil && uc.supabaseClient != nil {
			_, _ = uc.supabaseClient.Storage.RemoveFile(bucketNameAttachments, []string{*existingLeaveRequest.Attachment})
		}
		return nil, fmt.Errorf("failed to update leave request: %w", err)
	}

	// Cleanup old attachment if there was a new one uploaded
	if oldAttachment != nil && uc.supabaseClient != nil {
		_, _ = uc.supabaseClient.Storage.RemoveFile(bucketNameAttachments, []string{*oldAttachment})
	}

	// Get updated leave request with employee data
	updatedLeaveRequest, err := uc.leaveRequestRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated leave request: %w", err)
	}

	log.Printf("LeaveRequestUseCase: Successfully updated leave request with ID %d", id)
	return toLeaveRequestResponseDTO(updatedLeaveRequest), nil
}

func (uc *LeaveRequestUseCase) UpdateStatus(ctx context.Context, id uint, status domain.LeaveStatus, adminNote *string) (*dtoleave.LeaveRequestResponseDTO, error) {
	log.Printf("LeaveRequestUseCase: UpdateStatus called for ID %d, status: %s", id, string(status))

	// Validate status
	if status != domain.LeaveStatusApproved && status != domain.LeaveStatusRejected {
		return nil, fmt.Errorf("invalid status: %s", string(status))
	}

	// Update status
	err := uc.leaveRequestRepo.UpdateStatus(ctx, id, status, adminNote)
	if err != nil {
		return nil, fmt.Errorf("failed to update leave request status: %w", err)
	}

	// Get updated leave request
	updatedLeaveRequest, err := uc.leaveRequestRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated leave request: %w", err)
	}

	log.Printf("LeaveRequestUseCase: Successfully updated leave request status to %s for ID %d", string(status), id)
	return toLeaveRequestResponseDTO(updatedLeaveRequest), nil
}

func (uc *LeaveRequestUseCase) Delete(ctx context.Context, id uint) error {
	log.Printf("LeaveRequestUseCase: Delete called for ID %d", id)

	// Get leave request to check if we need to cleanup attachment
	leaveRequest, err := uc.leaveRequestRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get leave request for deletion: %w", err)
	}

	// Only allow deletion if status is still pending
	if leaveRequest.Status != domain.LeaveStatusPending {
		return fmt.Errorf("cannot delete leave request with status: %s", string(leaveRequest.Status))
	}

	// Delete the leave request
	err = uc.leaveRequestRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete leave request: %w", err)
	}

	// Cleanup attachment if exists
	if leaveRequest.Attachment != nil && uc.supabaseClient != nil {
		_, _ = uc.supabaseClient.Storage.RemoveFile(bucketNameAttachments, []string{*leaveRequest.Attachment})
	}

	log.Printf("LeaveRequestUseCase: Successfully deleted leave request with ID %d", id)
	return nil
}

func (uc *LeaveRequestUseCase) GetEmployeeByUserID(ctx context.Context, userID uint) (*domain.Employee, error) {
	log.Printf("LeaveRequestUseCase: GetEmployeeByUserID called for userID %d", userID)

	employee, err := uc.employeeRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee for user ID %d: %w", userID, err)
	}
	if employee == nil {
		return nil, domain.ErrEmployeeNotFound
	}

	return employee, nil
}

func (uc *LeaveRequestUseCase) generateFileName(employee *domain.Employee, originalFilename string) string {
	timestamp := time.Now().Format("20060102_150405")
	extension := filepath.Ext(originalFilename)
	
	employeeCode := "EMP"
	if employee.EmployeeCode != nil {
		employeeCode = *employee.EmployeeCode
	}
	
	// Clean filename: remove spaces and special characters except dots and underscores
	cleanName := strings.ReplaceAll(originalFilename, " ", "_")
	cleanName = strings.ReplaceAll(cleanName, extension, "")
	
	return fmt.Sprintf("leave_requests/%s_%s_%s%s", employeeCode, timestamp, cleanName, extension)
}
