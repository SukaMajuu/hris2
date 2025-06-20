package employee

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"log"
	"math/big"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoemployee "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/domain/enums"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	storage "github.com/supabase-community/storage-go"
	supa "github.com/supabase-community/supabase-go"
	"gorm.io/gorm"
)

const (
	defaultPassword = "password"
	unknownValue    = "unknown"
	bucketNamePhoto = "photo"
	nilValue        = "nil"
)

const (
	mimeTypeJPEG = "image/jpeg"
	mimeTypePNG  = "image/png"
)

type EmployeeUseCase struct {
	employeeRepo   interfaces.EmployeeRepository
	authRepo       interfaces.AuthRepository
	paymentRepo    interfaces.PaymentRepository
	supabaseClient *supa.Client
	db             *gorm.DB
}

func NewEmployeeUseCase(
	employeeRepo interfaces.EmployeeRepository,
	authRepo interfaces.AuthRepository,
	paymentRepo interfaces.PaymentRepository,
	supabaseClient *supa.Client,
	db *gorm.DB,
) *EmployeeUseCase {
	return &EmployeeUseCase{
		employeeRepo:   employeeRepo,
		authRepo:       authRepo,
		paymentRepo:    paymentRepo,
		supabaseClient: supabaseClient,
		db:             db,
	}
}

func (uc *EmployeeUseCase) List(ctx context.Context, filters map[string]interface{}, paginationParams domain.PaginationParams) (*dtoemployee.EmployeeListResponseData, error) {
	domainEmployees, totalItems, err := uc.employeeRepo.List(ctx, filters, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list employees from repository: %w", err)
	}

	employeeDTOs := dtoemployee.ToEmployeeResponseDTOList(domainEmployees)

	totalPages := uc.calculateTotalPages(totalItems, paginationParams.PageSize)

	response := &dtoemployee.EmployeeListResponseData{
		Items: employeeDTOs,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  totalPages,
			CurrentPage: paginationParams.Page,
			PageSize:    paginationParams.PageSize,
			HasNextPage: paginationParams.Page < totalPages,
			HasPrevPage: paginationParams.Page > 1 && paginationParams.Page <= totalPages,
		},
	}

	return response, nil
}

func (uc *EmployeeUseCase) calculateTotalPages(totalItems int64, pageSize int) int {
	if pageSize <= 0 {
		return 0
	}
	totalPages := int((totalItems + int64(pageSize) - 1) / int64(pageSize))
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}
	return totalPages
}

func (uc *EmployeeUseCase) Create(ctx context.Context, employee *domain.Employee, creatorEmployeeID uint) (*domain.Employee, error) {
	if employee.User.Email != "" {
		log.Printf("EmployeeUseCase: Create called for employee. FirstName: %s, UserEmail: %s, CreatorEmployeeID: %d", employee.FirstName, employee.User.Email, creatorEmployeeID)
	} else {
		log.Printf("EmployeeUseCase: Create called for employee. FirstName: %s, UserEmail: (not provided), CreatorEmployeeID: %d", employee.FirstName, creatorEmployeeID)
	}

	if err := uc.checkEmployeeLimit(ctx, creatorEmployeeID); err != nil {
		log.Printf("EmployeeUseCase: Employee limit check failed: %v", err)
		return nil, err
	}

	employee.ManagerID = &creatorEmployeeID

	if employee.User.Password == "" {
		employee.User.Password = defaultPassword
	}

	err := uc.authRepo.RegisterEmployeeUser(ctx, &employee.User, employee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error from authRepo.RegisterEmployeeUser: %v", err)
		return nil, fmt.Errorf("failed to create employee and user: %w", err)
	}

	if err := uc.updateSubscriptionEmployeeCount(ctx, creatorEmployeeID); err != nil {
		log.Printf("EmployeeUseCase: Warning - failed to update subscription employee count: %v", err)

	}

	log.Printf("EmployeeUseCase: Successfully created employee with ID %d and User ID %d, Manager ID %d", employee.ID, employee.User.ID, *employee.ManagerID)
	return employee, nil
}

func (uc *EmployeeUseCase) checkEmployeeLimit(ctx context.Context, creatorEmployeeID uint) error {

	creatorEmployee, err := uc.employeeRepo.GetByID(ctx, creatorEmployeeID)
	if err != nil {
		return fmt.Errorf("failed to get creator employee: %w", err)
	}

	adminUserID, err := uc.findAdminUserID(ctx, creatorEmployee)
	if err != nil {
		return fmt.Errorf("failed to find admin user: %w", err)
	}

	currentCount, err := uc.getCurrentEmployeeCount(ctx, adminUserID)
	if err != nil {
		return fmt.Errorf("failed to get current employee count: %w", err)
	}

	subscription, err := uc.paymentRepo.GetSubscriptionByAdminUserID(ctx, adminUserID)
	if err != nil {

		log.Printf("EmployeeUseCase: Subscription not found for admin %d, using default limits. Error: %v", adminUserID, err)

		maxEmployees := 100

		if currentCount >= maxEmployees {
			return fmt.Errorf("employee limit reached: maximum %d employees allowed, currently have %d employees", maxEmployees, currentCount)
		}

		log.Printf("EmployeeUseCase: Employee limit check passed (fallback) - Current: %d, Max: %d", currentCount, maxEmployees)
		return nil
	}

	maxEmployees := subscription.SeatPlan.MaxEmployees

	if currentCount >= maxEmployees {
		return fmt.Errorf("employee limit reached: your %s plan (%d-%d employees tier) allows maximum %d employees, currently have %d employees",
			subscription.SubscriptionPlan.Name,
			subscription.SeatPlan.MinEmployees,
			subscription.SeatPlan.MaxEmployees,
			maxEmployees,
			currentCount)
	}

	log.Printf("EmployeeUseCase: Employee limit check passed - Current: %d, Max: %d, Plan: %s (%d-%d tier)",
		currentCount, maxEmployees, subscription.SubscriptionPlan.Name,
		subscription.SeatPlan.MinEmployees, subscription.SeatPlan.MaxEmployees)

	return nil
}

func (uc *EmployeeUseCase) getCurrentEmployeeCount(ctx context.Context, adminUserID uint) (int, error) {

	adminUser, err := uc.authRepo.GetUserByID(ctx, adminUserID)
	if err != nil {
		return 0, fmt.Errorf("failed to get admin user: %w", err)
	}

	if adminUser.Role != enums.RoleAdmin {
		return 0, fmt.Errorf("user is not an admin")
	}

	adminEmployee, err := uc.employeeRepo.GetByUserID(ctx, adminUserID)
	if err != nil {
		return 0, fmt.Errorf("failed to get admin employee: %w", err)
	}

	totalCount, err := uc.countAllEmployeesRecursively(ctx, adminEmployee.ID)
	if err != nil {
		return 0, fmt.Errorf("failed to count all employees recursively: %w", err)
	}

	totalCount++

	log.Printf("EmployeeUseCase: Total employee count for admin %d (including admin): %d", adminUserID, totalCount)
	return totalCount, nil
}

func (uc *EmployeeUseCase) countAllEmployeesRecursively(ctx context.Context, managerID uint) (int, error) {

	filters := map[string]interface{}{
		"manager_id":        managerID,
		"employment_status": true,
	}

	_, directCount, err := uc.employeeRepo.List(ctx, filters, domain.PaginationParams{
		Page:     1,
		PageSize: 1,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to count direct employees for manager %d: %w", managerID, err)
	}

	totalCount := int(directCount)

	if directCount > 0 {
		subordinates, _, err := uc.employeeRepo.List(ctx, filters, domain.PaginationParams{
			Page:     1,
			PageSize: int(directCount),
		})
		if err != nil {
			return 0, fmt.Errorf("failed to get direct employees for manager %d: %w", managerID, err)
		}

		for _, subordinate := range subordinates {
			subCount, err := uc.countAllEmployeesRecursively(ctx, subordinate.ID)
			if err != nil {
				return 0, fmt.Errorf("failed to count employees under subordinate %d: %w", subordinate.ID, err)
			}
			totalCount += subCount
		}
	}

	return totalCount, nil
}

func (uc *EmployeeUseCase) updateSubscriptionEmployeeCount(ctx context.Context, creatorEmployeeID uint) error {

	creatorEmployee, err := uc.employeeRepo.GetByID(ctx, creatorEmployeeID)
	if err != nil {
		return fmt.Errorf("failed to get creator employee: %w", err)
	}

	adminUserID, err := uc.findAdminUserID(ctx, creatorEmployee)
	if err != nil {
		return fmt.Errorf("failed to find admin user: %w", err)
	}

	subscription, err := uc.paymentRepo.GetSubscriptionByAdminUserID(ctx, adminUserID)
	if err != nil {

		log.Printf("EmployeeUseCase: Subscription not found for admin %d, skipping count update. Error: %v", adminUserID, err)
		return nil
	}

	currentCount, err := uc.getCurrentEmployeeCount(ctx, adminUserID)
	if err != nil {
		return fmt.Errorf("failed to get current employee count: %w", err)
	}

	subscription.CurrentEmployeeCount = currentCount
	if err := uc.paymentRepo.UpdateSubscription(ctx, subscription); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	log.Printf("EmployeeUseCase: Updated subscription employee count to %d", currentCount)
	return nil
}

func (uc *EmployeeUseCase) findAdminUserID(ctx context.Context, employee *domain.Employee) (uint, error) {
	if employee.User.ID == 0 {
		emp, err := uc.employeeRepo.GetByID(ctx, employee.ID)
		if err != nil {
			return 0, fmt.Errorf("failed to get employee with user info: %w", err)
		}
		employee = emp
	}

	if employee.User.Role == enums.RoleAdmin {
		return employee.User.ID, nil
	}

	if employee.ManagerID == nil {
		return 0, fmt.Errorf("employee has no manager and is not admin")
	}

	manager, err := uc.employeeRepo.GetByID(ctx, *employee.ManagerID)
	if err != nil {
		return 0, fmt.Errorf("failed to get manager employee: %w", err)
	}

	return uc.findAdminUserID(ctx, manager)
}

func (uc *EmployeeUseCase) GetByID(ctx context.Context, id uint) (*dtoemployee.EmployeeResponseDTO, error) {
	log.Printf("EmployeeUseCase: GetByID called for ID: %d", id)
	employee, err := uc.employeeRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("EmployeeUseCase: No employee found with ID %d", id)
			return nil, domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by ID %d from repository: %v", id, err)
		return nil, fmt.Errorf("failed to get employee by ID %d: %w", id, err)
	}

	employeeDTO := dtoemployee.ToEmployeeResponseDTO(employee)

	log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d", id)
	return employeeDTO, nil
}

func (uc *EmployeeUseCase) GetEmployeeByUserID(ctx context.Context, userID uint) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: GetEmployeeByUserID called for UserID: %d", userID)
	employee, err := uc.employeeRepo.GetByUserID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("EmployeeUseCase: No employee found for UserID %d", userID)
			return nil, domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by UserID %d from repository: %v", userID, err)
		return nil, fmt.Errorf("failed to get employee by UserID %d: %w", userID, err)
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d for UserID %d", employee.ID, userID)
	return employee, nil
}

func (uc *EmployeeUseCase) GetByNIK(ctx context.Context, nik string) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: GetByNIK called for NIK: %s", nik)
	employee, err := uc.employeeRepo.GetByNIK(ctx, nik)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("EmployeeUseCase: No employee found with NIK %s", nik)
			return nil, domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by NIK %s from repository: %v", nik, err)
		return nil, fmt.Errorf("failed to get employee by NIK %s: %w", nik, err)
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d for NIK %s", employee.ID, nik)
	return employee, nil
}

func (uc *EmployeeUseCase) GetByEmployeeCode(ctx context.Context, employeeCode string) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: GetByEmployeeCode called for EmployeeCode: %s", employeeCode)
	employee, err := uc.employeeRepo.GetByEmployeeCode(ctx, employeeCode)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("EmployeeUseCase: No employee found with EmployeeCode %s", employeeCode)
			return nil, domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by EmployeeCode %s from repository: %v", employeeCode, err)
		return nil, fmt.Errorf("failed to get employee by EmployeeCode %s: %w", employeeCode, err)
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d for EmployeeCode %s", employee.ID, employeeCode)
	return employee, nil
}

func (uc *EmployeeUseCase) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	log.Printf("EmployeeUseCase: GetUserByEmail called with email: %s", email)

	user, err := uc.authRepo.GetUserByEmail(ctx, email)
	if err != nil {
		log.Printf("EmployeeUseCase: User not found with email %s: %v", email, err)
		return nil, err
	}

	log.Printf("EmployeeUseCase: Successfully found user with email %s, UserID: %d", email, user.ID)
	return user, nil
}

func (uc *EmployeeUseCase) GetUserByPhone(ctx context.Context, phone string) (*domain.User, error) {
	log.Printf("EmployeeUseCase: GetUserByPhone called with phone: %s", phone)

	user, err := uc.authRepo.GetUserByPhone(ctx, phone)
	if err != nil {
		log.Printf("EmployeeUseCase: User not found with phone %s: %v", phone, err)
		return nil, err
	}

	log.Printf("EmployeeUseCase: Successfully found user with phone %s, UserID: %d", phone, user.ID)
	return user, nil
}

func (uc *EmployeeUseCase) Update(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: Update called for employee ID %d", employee.ID)

	existingEmployee, err := uc.employeeRepo.GetByID(ctx, employee.ID)
	if err != nil {
		log.Printf("EmployeeUseCase: Error getting existing employee ID %d: %v", employee.ID, err)
		return nil, fmt.Errorf("failed to get employee for update: %w", err)
	}
	if existingEmployee == nil {
		log.Printf("EmployeeUseCase: Employee ID %d not found for update", employee.ID)
		return nil, domain.ErrEmployeeNotFound
	}

	uc.updateEmployeeFields(existingEmployee, employee)

	if employee.User.Email != "" || employee.User.Phone != "" {
		if existingEmployee.User.ID == 0 && existingEmployee.UserID != 0 {
			existingEmployee.User.ID = existingEmployee.UserID
		}

		if existingEmployee.User.ID != 0 {
			err = uc.authRepo.UpdateUser(ctx, &existingEmployee.User)
			if err != nil {
				log.Printf("EmployeeUseCase: Error updating user details for UserID %d: %v", existingEmployee.User.ID, err)
				return nil, fmt.Errorf("failed to update user details for employee ID %d: %w", employee.ID, err)
			}
			log.Printf("EmployeeUseCase: Successfully triggered update for user details (email/phone) for UserID %d", existingEmployee.User.ID)
		} else {
			log.Printf("EmployeeUseCase: Warning - Cannot update user details because UserID is missing for employee %d.", employee.ID)
		}
	}

	var preUpdateWorkScheduleID string
	if existingEmployee.WorkScheduleID != nil {
		preUpdateWorkScheduleID = fmt.Sprintf("%d", *existingEmployee.WorkScheduleID)
	} else {
		preUpdateWorkScheduleID = nilValue
	}
	log.Printf("EmployeeUseCase: About to call repository Update with WorkScheduleID: %s", preUpdateWorkScheduleID)

	err = uc.employeeRepo.Update(ctx, existingEmployee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error updating employee ID %d in repository: %v", employee.ID, err)
		return nil, fmt.Errorf("failed to update employee ID %d: %w", employee.ID, err)
	}

	updatedEmployee, err := uc.employeeRepo.GetByID(ctx, existingEmployee.ID)
	if err != nil {
		log.Printf("EmployeeUseCase: Error refreshing employee ID %d after update: %v", existingEmployee.ID, err)

		return existingEmployee, nil
	}

	var refreshedWorkScheduleID string
	if updatedEmployee.WorkScheduleID != nil {
		refreshedWorkScheduleID = fmt.Sprintf("%d", *updatedEmployee.WorkScheduleID)
	} else {
		refreshedWorkScheduleID = nilValue
	}
	log.Printf("EmployeeUseCase: After refresh, employee ID %d has WorkScheduleID: %s", updatedEmployee.ID, refreshedWorkScheduleID)

	log.Printf("EmployeeUseCase: Successfully updated employee with ID %d", updatedEmployee.ID)
	return updatedEmployee, nil
}

func (uc *EmployeeUseCase) updateEmployeeFields(existing *domain.Employee, update *domain.Employee) {
	if update.FirstName != "" {
		existing.FirstName = update.FirstName
	}
	if update.LastName != nil {
		existing.LastName = update.LastName
	}
	if update.EmployeeCode != nil {
		existing.EmployeeCode = update.EmployeeCode
	}
	if update.Branch != nil {
		existing.Branch = update.Branch
	}
	if update.Gender != nil {
		existing.Gender = update.Gender
	}
	if update.NIK != nil {
		existing.NIK = update.NIK
	}
	if update.PlaceOfBirth != nil {
		existing.PlaceOfBirth = update.PlaceOfBirth
	}
	if update.DateOfBirth != nil {
		existing.DateOfBirth = update.DateOfBirth
	}
	if update.LastEducation != nil {
		existing.LastEducation = update.LastEducation
	}
	if update.Grade != nil {
		existing.Grade = update.Grade
	}
	if update.ContractType != nil {
		existing.ContractType = update.ContractType
	}
	if update.ResignationDate != nil {
		existing.ResignationDate = update.ResignationDate
	}
	if update.HireDate != nil {
		existing.HireDate = update.HireDate
	}
	if update.BankName != nil {
		existing.BankName = update.BankName
	}
	if update.BankAccountNumber != nil {
		existing.BankAccountNumber = update.BankAccountNumber
	}
	if update.BankAccountHolderName != nil {
		existing.BankAccountHolderName = update.BankAccountHolderName
	}
	if update.TaxStatus != nil {
		existing.TaxStatus = update.TaxStatus
	}
	if update.ProfilePhotoURL != nil {
		existing.ProfilePhotoURL = update.ProfilePhotoURL
	}
	if update.WorkScheduleID != nil {
		var existingValue string
		if existing.WorkScheduleID != nil {
			existingValue = fmt.Sprintf("%d", *existing.WorkScheduleID)
		} else {
			existingValue = nilValue
		}
		log.Printf("EmployeeUseCase: Updating WorkScheduleID for employee %d from %s to %d", existing.ID, existingValue, *update.WorkScheduleID)

		newWorkScheduleID := *update.WorkScheduleID
		existing.WorkScheduleID = &newWorkScheduleID

		log.Printf("EmployeeUseCase: WorkScheduleID updated to %d", *existing.WorkScheduleID)
	} else {
		log.Printf("EmployeeUseCase: WorkScheduleID update skipped - update.WorkScheduleID is nil")
	}
	if update.PositionName != "" {
		existing.PositionName = update.PositionName
	}
	if update.User.Email != "" {
		log.Printf("EmployeeUseCase: Updating User Email for UserID %d to %s", existing.UserID, update.User.Email)
		existing.User.Email = update.User.Email
	}
	if update.User.Phone != "" {
		log.Printf("EmployeeUseCase: Updating User Phone for UserID %d to %s", existing.UserID, update.User.Phone)
		existing.User.Phone = update.User.Phone
	}
}

func (uc *EmployeeUseCase) BulkImport(ctx context.Context, employees []*domain.Employee, creatorEmployeeID uint) ([]uint, []EmployeeImportError) {
	log.Printf("EmployeeUseCase: BulkImport called for %d employees by creator %d", len(employees), creatorEmployeeID)

	if err := uc.checkBulkEmployeeLimit(ctx, creatorEmployeeID, len(employees)); err != nil {
		log.Printf("EmployeeUseCase: Bulk import employee limit check failed: %v", err)

		var errors []EmployeeImportError
		for i := range employees {
			errors = append(errors, EmployeeImportError{
				Row:     i + 2,
				Field:   "employee_limit",
				Message: err.Error(),
				Value:   "",
			})
		}
		return []uint{}, errors
	}

	var successfulIDs []uint
	var errors []EmployeeImportError

	for i, employee := range employees {
		log.Printf("EmployeeUseCase: Processing employee %d/%d: %s", i+1, len(employees), employee.FirstName)

		employee.ManagerID = &creatorEmployeeID

		if employee.User.Password == "" {
			employee.User.Password = defaultPassword
		}

		err := uc.authRepo.RegisterEmployeeUser(ctx, &employee.User, employee)
		if err != nil {
			log.Printf("EmployeeUseCase: Error creating employee %s: %v", employee.FirstName, err)
			importError := uc.convertToImportError(err, employee, i+2)
			errors = append(errors, importError)
			continue
		}

		successfulIDs = append(successfulIDs, employee.ID)
		log.Printf("EmployeeUseCase: Successfully created employee %s with ID %d", employee.FirstName, employee.ID)
	}

	if len(successfulIDs) > 0 {
		if err := uc.updateSubscriptionEmployeeCount(ctx, creatorEmployeeID); err != nil {
			log.Printf("EmployeeUseCase: Warning - failed to update subscription employee count after bulk import: %v", err)
		}
	}

	log.Printf("EmployeeUseCase: BulkImport completed. Success: %d, Errors: %d", len(successfulIDs), len(errors))
	return successfulIDs, errors
}

func (uc *EmployeeUseCase) checkBulkEmployeeLimit(ctx context.Context, creatorEmployeeID uint, employeeCount int) error {

	creatorEmployee, err := uc.employeeRepo.GetByID(ctx, creatorEmployeeID)
	if err != nil {
		return fmt.Errorf("failed to get creator employee: %w", err)
	}

	adminUserID, err := uc.findAdminUserID(ctx, creatorEmployee)
	if err != nil {
		return fmt.Errorf("failed to find admin user: %w", err)
	}

	currentCount, err := uc.getCurrentEmployeeCount(ctx, adminUserID)
	if err != nil {
		return fmt.Errorf("failed to get current employee count: %w", err)
	}

	subscription, err := uc.paymentRepo.GetSubscriptionByAdminUserID(ctx, adminUserID)
	if err != nil {

		log.Printf("EmployeeUseCase: Subscription not found for admin %d during bulk import, using default limits. Error: %v", adminUserID, err)

		maxEmployees := 100

		if currentCount+employeeCount > maxEmployees {
			return fmt.Errorf("bulk import would exceed employee limit: maximum %d employees allowed, currently have %d employees, trying to add %d more", maxEmployees, currentCount, employeeCount)
		}

		log.Printf("EmployeeUseCase: Bulk employee limit check passed (fallback) - Current: %d, Adding: %d, Max: %d", currentCount, employeeCount, maxEmployees)
		return nil
	}

	maxEmployees := subscription.SeatPlan.MaxEmployees

	if currentCount+employeeCount > maxEmployees {
		return fmt.Errorf("bulk import would exceed employee limit: your %s plan (%d-%d employees tier) allows maximum %d employees, currently have %d employees, trying to add %d more",
			subscription.SubscriptionPlan.Name,
			subscription.SeatPlan.MinEmployees,
			subscription.SeatPlan.MaxEmployees,
			maxEmployees,
			currentCount, employeeCount)
	}

	log.Printf("EmployeeUseCase: Bulk employee limit check passed - Current: %d, Adding: %d, Max: %d, Plan: %s (%d-%d tier)",
		currentCount, employeeCount, maxEmployees, subscription.SubscriptionPlan.Name,
		subscription.SeatPlan.MinEmployees, subscription.SeatPlan.MaxEmployees)

	return nil
}

func (uc *EmployeeUseCase) BulkImportWithTransaction(ctx context.Context, employees []*domain.Employee, creatorEmployeeID uint) ([]uint, []EmployeeImportError) {
	log.Printf("EmployeeUseCase: BulkImportWithTransaction called for %d employees by creator %d", len(employees), creatorEmployeeID)

	if err := uc.checkBulkEmployeeLimit(ctx, creatorEmployeeID, len(employees)); err != nil {
		log.Printf("EmployeeUseCase: Bulk import employee limit check failed: %v", err)

		var errors []EmployeeImportError
		for i := range employees {
			errors = append(errors, EmployeeImportError{
				Row:     i + 2,
				Field:   "employee_limit",
				Message: err.Error(),
				Value:   "",
			})
		}
		return []uint{}, errors
	}

	log.Printf("EmployeeUseCase: Starting comprehensive pre-validation for %d employees", len(employees))

	validationErrors := uc.preValidateEmployees(ctx, employees)
	if len(validationErrors) > 0 {
		log.Printf("EmployeeUseCase: Pre-validation failed with %d errors", len(validationErrors))
		return nil, validationErrors
	}

	comprehensiveErrors := uc.comprehensivePreValidation(ctx, employees)
	if len(comprehensiveErrors) > 0 {
		log.Printf("EmployeeUseCase: Comprehensive validation failed with %d errors", len(comprehensiveErrors))
		return nil, comprehensiveErrors
	}

	log.Printf("EmployeeUseCase: All validations passed. Starting employee creation...")

	var successfulIDs []uint
	var allErrors []EmployeeImportError

	for i, employee := range employees {
		log.Printf("EmployeeUseCase: Processing employee %d/%d: %s", i+1, len(employees), employee.FirstName)

		employee.ManagerID = &creatorEmployeeID

		if employee.User.Password == "" {
			employee.User.Password = defaultPassword
		}

		lastMinuteErrors := uc.lastMinuteValidation(ctx, employee, i+2)
		if len(lastMinuteErrors) > 0 {
			log.Printf("EmployeeUseCase: Last-minute validation failed for employee %s", employee.FirstName)
			allErrors = append(allErrors, lastMinuteErrors...)

			break
		}

		err := uc.authRepo.RegisterEmployeeUser(ctx, &employee.User, employee)
		if err != nil {

			log.Printf("EmployeeUseCase: UNEXPECTED ERROR creating employee %s after validation passed: %v", employee.FirstName, err)
			importError := uc.convertToImportError(err, employee, i+2)
			allErrors = append(allErrors, importError)

			log.Printf("EmployeeUseCase: BulkImportWithTransaction failed on employee %d. Cannot rollback auth operations.", i+1)
			break
		}

		successfulIDs = append(successfulIDs, employee.ID)
		log.Printf("EmployeeUseCase: Successfully created employee %s with ID %d", employee.FirstName, employee.ID)
	}

	if len(allErrors) > 0 {
		log.Printf("EmployeeUseCase: BulkImportWithTransaction failed with %d errors. No employees should be imported.", len(allErrors))
		return nil, allErrors
	}

	if len(successfulIDs) > 0 {
		if err := uc.updateSubscriptionEmployeeCount(ctx, creatorEmployeeID); err != nil {
			log.Printf("EmployeeUseCase: Warning - failed to update subscription employee count after bulk import: %v", err)
		}
	}

	log.Printf("EmployeeUseCase: BulkImportWithTransaction completed successfully. All %d employees imported", len(successfulIDs))
	return successfulIDs, nil
}

func (uc *EmployeeUseCase) preValidateEmployees(ctx context.Context, employees []*domain.Employee) []EmployeeImportError {
	var validationErrors []EmployeeImportError

	for i, employee := range employees {

		if employee.User.Password == "" {
			employee.User.Password = defaultPassword
		}

		rowErrors := uc.validateRequiredFields(employee, i+2)
		validationErrors = append(validationErrors, rowErrors...)

		duplicateErrors := uc.checkBatchDuplicates(employee, employees, i)
		validationErrors = append(validationErrors, duplicateErrors...)

		dbErrors := uc.checkExistingRecords(ctx, employee, i+2)
		validationErrors = append(validationErrors, dbErrors...)
	}

	return validationErrors
}

func (uc *EmployeeUseCase) validateRequiredFields(employee *domain.Employee, rowNum int) []EmployeeImportError {
	var errors []EmployeeImportError

	if employee.User.Email == "" {
		errors = append(errors, EmployeeImportError{
			Row:      rowNum,
			Field:    "email",
			Message:  "Email is required",
			Value:    "",
			Employee: employee,
		})
	}
	if employee.FirstName == "" {
		errors = append(errors, EmployeeImportError{
			Row:      rowNum,
			Field:    "first_name",
			Message:  "First name is required",
			Value:    "",
			Employee: employee,
		})
	}
	if employee.PositionName == "" {
		errors = append(errors, EmployeeImportError{
			Row:      rowNum,
			Field:    "position_name",
			Message:  "Position name is required",
			Value:    "",
			Employee: employee,
		})
	}

	return errors
}

func (uc *EmployeeUseCase) checkBatchDuplicates(employee *domain.Employee, employees []*domain.Employee, currentIndex int) []EmployeeImportError {
	var errors []EmployeeImportError
	rowNum := currentIndex + 2

	for j, otherEmployee := range employees {
		if currentIndex != j && employee.User.Email == otherEmployee.User.Email {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "email",
				Message:  fmt.Sprintf("Duplicate email '%s' found in row %d", employee.User.Email, j+2),
				Value:    employee.User.Email,
				Employee: employee,
			})
			break
		}
	}

	if employee.User.Phone != "" {
		for j, otherEmployee := range employees {
			if currentIndex != j && employee.User.Phone == otherEmployee.User.Phone {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "phone",
					Message:  fmt.Sprintf("Duplicate phone number '%s' found in row %d", employee.User.Phone, j+2),
					Value:    employee.User.Phone,
					Employee: employee,
				})
				break
			}
		}
	}

	if employee.NIK != nil {
		for j, otherEmployee := range employees {
			if currentIndex != j && otherEmployee.NIK != nil && *employee.NIK == *otherEmployee.NIK {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "nik",
					Message:  fmt.Sprintf("Duplicate NIK '%s' found in row %d", *employee.NIK, j+2),
					Value:    *employee.NIK,
					Employee: employee,
				})
				break
			}
		}
	}

	if employee.EmployeeCode != nil {
		for j, otherEmployee := range employees {
			if currentIndex != j && otherEmployee.EmployeeCode != nil && *employee.EmployeeCode == *otherEmployee.EmployeeCode {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "employee_code",
					Message:  fmt.Sprintf("Duplicate employee code '%s' found in row %d", *employee.EmployeeCode, j+2),
					Value:    *employee.EmployeeCode,
					Employee: employee,
				})
				break
			}
		}
	}

	return errors
}

func (uc *EmployeeUseCase) checkExistingRecords(ctx context.Context, employee *domain.Employee, rowNum int) []EmployeeImportError {
	var errors []EmployeeImportError

	if employee.User.Email != "" {
		existingUser, err := uc.authRepo.GetUserByEmail(ctx, employee.User.Email)
		if err == nil && existingUser != nil {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "email",
				Message:  fmt.Sprintf("Email '%s' is already used by another employee", employee.User.Email),
				Value:    employee.User.Email,
				Employee: employee,
			})
		}
	}

	if employee.User.Phone != "" {
		existingUser, err := uc.authRepo.GetUserByPhone(ctx, employee.User.Phone)
		if err == nil && existingUser != nil {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "phone",
				Message:  fmt.Sprintf("Phone number '%s' is already used by another employee", employee.User.Phone),
				Value:    employee.User.Phone,
				Employee: employee,
			})
		}
	}

	if employee.NIK != nil && *employee.NIK != "" {
		existingEmployee, err := uc.employeeRepo.GetByNIK(ctx, *employee.NIK)
		if err == nil && existingEmployee != nil {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "nik",
				Message:  fmt.Sprintf("NIK '%s' is already registered to another employee", *employee.NIK),
				Value:    *employee.NIK,
				Employee: employee,
			})
		}
	}

	if employee.EmployeeCode != nil && *employee.EmployeeCode != "" {
		existingEmployee, err := uc.employeeRepo.GetByEmployeeCode(ctx, *employee.EmployeeCode)
		if err == nil && existingEmployee != nil {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "employee_code",
				Message:  fmt.Sprintf("Employee code '%s' is already used by another employee", *employee.EmployeeCode),
				Value:    *employee.EmployeeCode,
				Employee: employee,
			})
		}
	}

	return errors
}

type EmployeeImportError struct {
	Row      int
	Field    string
	Message  string
	Value    string
	Employee *domain.Employee
}

func (uc *EmployeeUseCase) convertToImportError(err error, employee *domain.Employee, rowNum int) EmployeeImportError {
	errorMsg := err.Error()
	employeeName := employee.FirstName
	if employee.LastName != nil {
		employeeName += " " + *employee.LastName
	}

	if strings.Contains(errorMsg, "uni_users_email") || strings.Contains(errorMsg, "duplicate key") && strings.Contains(errorMsg, "email") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "email",
			Message:  fmt.Sprintf("Email '%s' is already used by another employee", employee.User.Email),
			Value:    employee.User.Email,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "uni_users_phone") || strings.Contains(errorMsg, "duplicate key") && strings.Contains(errorMsg, "phone") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "phone",
			Message:  fmt.Sprintf("Phone number '%s' is already used by another employee", employee.User.Phone),
			Value:    employee.User.Phone,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "uni_employees_nik") || strings.Contains(errorMsg, "duplicate key") && strings.Contains(errorMsg, "nik") {
		nikValue := unknownValue
		if employee.NIK != nil {
			nikValue = *employee.NIK
		}
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "nik",
			Message:  fmt.Sprintf("NIK '%s' is already registered for another employee", nikValue),
			Value:    nikValue,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "uni_employees_employee_code") || strings.Contains(errorMsg, "duplicate key") && strings.Contains(errorMsg, "employee_code") {
		codeValue := unknownValue
		if employee.EmployeeCode != nil {
			codeValue = *employee.EmployeeCode
		}
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "employee_code",
			Message:  fmt.Sprintf("Employee code '%s' is already used", codeValue),
			Value:    codeValue,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "invalid email format") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "email",
			Message:  fmt.Sprintf("Invalid email format '%s'", employee.User.Email),
			Value:    employee.User.Email,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "phone number") && strings.Contains(errorMsg, "format") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "phone",
			Message:  fmt.Sprintf("Invalid phone format '%s'. Use international format like +628123456789", employee.User.Phone),
			Value:    employee.User.Phone,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "email") && strings.Contains(errorMsg, "required") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "email",
			Message:  "Email is required",
			Value:    employee.User.Email,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "first_name") && strings.Contains(errorMsg, "required") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "first_name",
			Message:  "First name is required",
			Value:    employee.FirstName,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "position_name") && strings.Contains(errorMsg, "required") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "position_name",
			Message:  "Position name is required",
			Value:    employee.PositionName,
			Employee: employee,
		}
	}

	if strings.Contains(errorMsg, "connection") || strings.Contains(errorMsg, "timeout") {
		return EmployeeImportError{
			Row:      rowNum,
			Field:    "general",
			Message:  "Failed to connect to database. Please try again in a few moments",
			Value:    "",
			Employee: employee,
		}
	}

	return EmployeeImportError{
		Row:      rowNum,
		Field:    "general",
		Message:  fmt.Sprintf("Failed to create account for employee '%s'. Please check the data entered", employeeName),
		Value:    "",
		Employee: employee,
	}
}

func (uc *EmployeeUseCase) Resign(ctx context.Context, id uint) error {
	log.Printf("EmployeeUseCase: Resign called for employee ID: %d", id)

	employee, err := uc.employeeRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("EmployeeUseCase: No employee found with ID %d", id)
			return domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by ID %d from repository: %v", id, err)
		return fmt.Errorf("failed to get employee by ID %d: %w", id, err)
	}

	employee.EmploymentStatus = false
	now := time.Now()
	employee.ResignationDate = &now

	err = uc.employeeRepo.Update(ctx, employee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error updating employee resignation status in repository: %v", err)
		return fmt.Errorf("failed to update employee resignation status: %w", err)
	}

	if employee.ManagerID != nil {
		if err := uc.updateSubscriptionEmployeeCount(ctx, *employee.ManagerID); err != nil {
			log.Printf("EmployeeUseCase: Warning - failed to update subscription employee count after resignation: %v", err)

		}
	}

	log.Printf("EmployeeUseCase: Successfully resigned employee with ID %d", id)
	return nil
}

func (uc *EmployeeUseCase) GetStatisticsByManager(ctx context.Context, managerID uint) (*dtoemployee.EmployeeStatisticsResponseDTO, error) {
	log.Printf("EmployeeUseCase: GetStatisticsByManager called for manager ID: %d", managerID)

	totalEmployees, newEmployees, activeEmployees, resignedEmployees,
		permanentEmployees, contractEmployees, freelanceEmployees,
		totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend, err :=
		uc.employeeRepo.GetStatisticsWithTrendsByManager(ctx, managerID)
	if err != nil {
		log.Printf("EmployeeUseCase: Error getting employee statistics with trends by manager from repository: %v", err)
		return nil, fmt.Errorf("failed to get employee statistics by manager: %w", err)
	}

	response := &dtoemployee.EmployeeStatisticsResponseDTO{
		TotalEmployees:       totalEmployees,
		NewEmployees:         newEmployees,
		ActiveEmployees:      activeEmployees,
		ResignedEmployees:    resignedEmployees,
		PermanentEmployees:   permanentEmployees,
		ContractEmployees:    contractEmployees,
		FreelanceEmployees:   freelanceEmployees,
		TotalEmployeesTrend:  &totalEmployeesTrend,
		NewEmployeesTrend:    &newEmployeesTrend,
		ActiveEmployeesTrend: &activeEmployeesTrend,
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee statistics by manager %d - "+
		"Total: %d (trend: %.2f%%), New: %d (trend: %.2f%%), Active: %d (trend: %.2f%%), "+
		"Resigned: %d, Permanent: %d, Contract: %d, Freelance: %d",
		managerID, totalEmployees, totalEmployeesTrend, newEmployees, newEmployeesTrend,
		activeEmployees, activeEmployeesTrend, resignedEmployees, permanentEmployees,
		contractEmployees, freelanceEmployees)

	return response, nil
}

func (uc *EmployeeUseCase) GetStatisticsByManagerAndMonth(ctx context.Context, managerID uint, month string) (*dtoemployee.EmployeeStatisticsResponseDTO, error) {
	log.Printf("EmployeeUseCase: GetStatisticsByManagerAndMonth called for manager ID: %d, month: %s", managerID, month)

	totalEmployees, newEmployees, activeEmployees, resignedEmployees,
		permanentEmployees, contractEmployees, freelanceEmployees,
		totalEmployeesTrend, newEmployeesTrend, activeEmployeesTrend, err :=
		uc.employeeRepo.GetStatisticsWithTrendsByManagerAndMonth(ctx, managerID, month)
	if err != nil {
		log.Printf("EmployeeUseCase: Error getting employee statistics with trends by manager and month from repository: %v", err)
		return nil, fmt.Errorf("failed to get employee statistics by manager and month: %w", err)
	}

	response := &dtoemployee.EmployeeStatisticsResponseDTO{
		TotalEmployees:       totalEmployees,
		NewEmployees:         newEmployees,
		ActiveEmployees:      activeEmployees,
		ResignedEmployees:    resignedEmployees,
		PermanentEmployees:   permanentEmployees,
		ContractEmployees:    contractEmployees,
		FreelanceEmployees:   freelanceEmployees,
		TotalEmployeesTrend:  &totalEmployeesTrend,
		NewEmployeesTrend:    &newEmployeesTrend,
		ActiveEmployeesTrend: &activeEmployeesTrend,
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee statistics by manager %d and month %s - "+
		"Total: %d (trend: %.2f%%), New: %d (trend: %.2f%%), Active: %d (trend: %.2f%%), "+
		"Resigned: %d, Permanent: %d, Contract: %d, Freelance: %d",
		managerID, month, totalEmployees, totalEmployeesTrend, newEmployees, newEmployeesTrend,
		activeEmployees, activeEmployeesTrend, resignedEmployees, permanentEmployees,
		contractEmployees, freelanceEmployees)

	return response, nil
}

func (uc *EmployeeUseCase) UploadProfilePhoto(ctx context.Context, employeeID uint, file *multipart.FileHeader) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: UploadProfilePhoto called for employee ID: %d", employeeID)

	employee, err := uc.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	fileName := uc.generatePhotoFileName(employee, file.Filename)

	var oldFileName string
	if employee.ProfilePhotoURL != nil && *employee.ProfilePhotoURL != "" {
		oldFileName = uc.extractFileNameFromURL(*employee.ProfilePhotoURL)
		if oldFileName != "" && oldFileName != fileName {
			log.Printf("EmployeeUseCase: Found existing photo, attempting to delete from bucket: %s", oldFileName)

			deleted := uc.deleteFileWithRetry(oldFileName, 3)
			if !deleted {
				log.Printf("EmployeeUseCase: Failed to delete old photo file after retries, but continuing with upload")
			}
		} else if oldFileName == fileName {
			log.Printf("EmployeeUseCase: New filename is same as existing, skipping deletion: %s", oldFileName)
		} else {
			log.Printf("EmployeeUseCase: Warning - Could not extract filename from existing photo URL: %s", *employee.ProfilePhotoURL)
		}
	} else {
		log.Printf("EmployeeUseCase: No existing photo found for employee ID: %d", employeeID)
	}

	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer func() {
		if closeErr := src.Close(); closeErr != nil {
			fmt.Printf("Warning: failed to close file: %v", closeErr)
		}
	}()

	if uc.supabaseClient == nil || uc.supabaseClient.Storage == nil {
		return nil, fmt.Errorf("storage client not available")
	}

	log.Printf("EmployeeUseCase: Uploading new file:")
	log.Printf("  - Bucket: %s", bucketNamePhoto)
	log.Printf("  - File: %s", fileName)
	log.Printf("  - Content-Type: %s", uc.getContentTypeFromExtension(file.Filename))

	_, err = uc.supabaseClient.Storage.UploadFile(bucketNamePhoto, fileName, src, storage.FileOptions{
		ContentType: &[]string{uc.getContentTypeFromExtension(file.Filename)}[0],
		Upsert:      &[]bool{true}[0],
	})
	if err != nil {
		log.Printf("EmployeeUseCase: Upload failed with error: %v", err)
		errorMsg := err.Error()
		if strings.Contains(errorMsg, "policy") || strings.Contains(errorMsg, "unauthorized") {
			log.Printf("EmployeeUseCase: Upload failed due to storage policy issues. Check INSERT policies for service_role.")
		}
		return nil, fmt.Errorf("failed to upload file to storage: %w", err)
	}

	log.Printf("EmployeeUseCase: Photo upload successful! File: %s", fileName)

	publicURL := uc.supabaseClient.Storage.GetPublicUrl(bucketNamePhoto, fileName)
	log.Printf("EmployeeUseCase: Generated public URL: %s", publicURL.SignedURL)

	employee.ProfilePhotoURL = &publicURL.SignedURL

	err = uc.employeeRepo.Update(ctx, employee)
	if err != nil {
		log.Printf("EmployeeUseCase: Database update failed, cleaning up uploaded file: %s", fileName)
		if uc.supabaseClient != nil && uc.supabaseClient.Storage != nil {
			if _, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketNamePhoto, []string{fileName}); removeErr != nil {
				log.Printf("Warning: failed to cleanup uploaded file: %v", removeErr)
			}
		}
		return nil, fmt.Errorf("failed to update employee photo URL: %w", err)
	}

	log.Printf("EmployeeUseCase: Successfully updated employee photo URL for ID: %d", employeeID)
	return employee, nil
}

func (uc *EmployeeUseCase) deleteFileWithRetry(fileName string, maxRetries int) bool {
	if uc.supabaseClient == nil || uc.supabaseClient.Storage == nil {
		log.Printf("EmployeeUseCase: Warning - Supabase client not available for file deletion")
		return false
	}

	for attempt := 1; attempt <= maxRetries; attempt++ {
		log.Printf("EmployeeUseCase: Deletion attempt %d/%d for file: %s", attempt, maxRetries, fileName)

		removeResponse, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketNamePhoto, []string{fileName})
		if removeErr == nil {
			log.Printf("EmployeeUseCase: Successfully deleted old photo file: %s on attempt %d. Response: %+v", fileName, attempt, removeResponse)
			return true
		}

		errorMsg := removeErr.Error()
		log.Printf("EmployeeUseCase: Deletion attempt %d failed with error: %v", attempt, removeErr)

		if strings.Contains(errorMsg, "not found") || strings.Contains(errorMsg, "404") {
			log.Printf("EmployeeUseCase: Old photo file not found in storage (may have been deleted already): %s", fileName)
			return true
		}

		if attempt < maxRetries {
			time.Sleep(time.Duration(attempt) * time.Second)
		}
	}

	log.Printf("EmployeeUseCase: Failed to delete file %s after %d attempts", fileName, maxRetries)
	return false
}

func (uc *EmployeeUseCase) generatePhotoFileName(employee *domain.Employee, originalFilename string) string {
	ext := filepath.Ext(originalFilename)

	var lastName string
	if employee.LastName != nil {
		lastName = *employee.LastName
	}

	baseName := fmt.Sprintf("%s_%s_Photo", employee.FirstName, lastName)
	baseName = strings.ReplaceAll(baseName, " ", "_")

	min := big.NewInt(100000000000000)
	max := big.NewInt(999999999999999)
	rangeNum := new(big.Int).Sub(max, min)

	randomInRange, err := rand.Int(rand.Reader, rangeNum)
	if err != nil {
		randomInRange = big.NewInt(123456789012345)
	}

	randomNumber := new(big.Int).Add(randomInRange, min)

	return fmt.Sprintf("%s_%s%s", baseName, randomNumber.String(), ext)
}

func (uc *EmployeeUseCase) extractFileNameFromURL(url string) string {
	log.Printf("EmployeeUseCase: Extracting filename from URL: %s", url)

	if strings.Contains(url, "/storage/v1/object/public/") {
		parts := strings.Split(url, "/storage/v1/object/public/")
		if len(parts) > 1 {
			pathAfterPublic := parts[1]
			pathParts := strings.Split(pathAfterPublic, "/")
			if len(pathParts) >= 2 {
				fileName := strings.Join(pathParts[1:], "/")
				if idx := strings.Index(fileName, "?"); idx != -1 {
					fileName = fileName[:idx]
				}
				log.Printf("EmployeeUseCase: Extracted filename from Supabase URL: %s", fileName)
				return fileName
			}
		}
	}

	parts := strings.Split(url, "/")
	if len(parts) > 0 {
		fileName := parts[len(parts)-1]
		if idx := strings.Index(fileName, "?"); idx != -1 {
			fileName = fileName[:idx]
		}
		log.Printf("EmployeeUseCase: Extracted filename (fallback method): %s", fileName)
		return fileName
	}

	log.Printf("EmployeeUseCase: Could not extract filename from URL")
	return ""
}

func (uc *EmployeeUseCase) getContentTypeFromExtension(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return mimeTypeJPEG
	case ".png":
		return mimeTypePNG
	default:
		return mimeTypeJPEG
	}
}

func (uc *EmployeeUseCase) GetHireDateRange(ctx context.Context, managerID uint) (earliestHireDate, latestHireDate *time.Time, err error) {
	log.Printf("EmployeeUseCase: GetHireDateRange called for manager ID: %d", managerID)

	earliest, latest, err := uc.employeeRepo.GetHireDateRange(ctx, managerID)
	if err != nil {
		log.Printf("EmployeeUseCase: Error getting hire date range from repository: %v", err)
		return nil, nil, fmt.Errorf("failed to get hire date range: %w", err)
	}

	log.Printf("EmployeeUseCase: Successfully retrieved hire date range for manager %d - Earliest: %v, Latest: %v",
		managerID, earliest, latest)

	return earliest, latest, nil
}

func (uc *EmployeeUseCase) SyncSubscriptionEmployeeCount(ctx context.Context, adminUserID uint) error {
	log.Printf("EmployeeUseCase: SyncSubscriptionEmployeeCount called for admin user ID: %d", adminUserID)

	subscription, err := uc.paymentRepo.GetSubscriptionByAdminUserID(ctx, adminUserID)
	if err != nil {
		return fmt.Errorf("failed to get subscription: %w", err)
	}

	currentCount, err := uc.getCurrentEmployeeCount(ctx, adminUserID)
	if err != nil {
		return fmt.Errorf("failed to get current employee count: %w", err)
	}

	subscription.CurrentEmployeeCount = currentCount
	if err := uc.paymentRepo.UpdateSubscription(ctx, subscription); err != nil {
		return fmt.Errorf("failed to update subscription: %w", err)
	}

	log.Printf("EmployeeUseCase: Synced subscription employee count to %d for admin user %d", currentCount, adminUserID)
	return nil
}

func (uc *EmployeeUseCase) comprehensivePreValidation(ctx context.Context, employees []*domain.Employee) []EmployeeImportError {
	var errors []EmployeeImportError

	_ = ctx

	log.Printf("EmployeeUseCase: Starting comprehensive validation for %d employees", len(employees))

	for i, employee := range employees {
		rowNum := i + 2

		if employee.User.Email != "" {
			if !uc.isValidEmailFormat(employee.User.Email) {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "email",
					Message:  fmt.Sprintf("Invalid email format: %s", employee.User.Email),
					Value:    employee.User.Email,
					Employee: employee,
				})
			}
		}

		if employee.User.Phone != "" {
			if !uc.isValidPhoneFormat(employee.User.Phone) {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "phone",
					Message:  fmt.Sprintf("Invalid phone format: %s", employee.User.Phone),
					Value:    employee.User.Phone,
					Employee: employee,
				})
			}
		}

		if employee.NIK != nil && *employee.NIK != "" {
			if !uc.isValidNIKFormat(*employee.NIK) {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "nik",
					Message:  fmt.Sprintf("Invalid NIK format: %s", *employee.NIK),
					Value:    *employee.NIK,
					Employee: employee,
				})
			}
		}

		if employee.PositionName != "" {
			if !uc.isValidPositionName(employee.PositionName) {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "position_name",
					Message:  fmt.Sprintf("Invalid or unsupported position: %s", employee.PositionName),
					Value:    employee.PositionName,
					Employee: employee,
				})
			}
		}

		if employee.DateOfBirth != nil {

			if employee.DateOfBirth.After(time.Now()) {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "date_of_birth",
					Message:  "Date of birth cannot be in the future",
					Value:    employee.DateOfBirth.Format("2006-01-02"),
					Employee: employee,
				})
			}
		}

		if employee.HireDate != nil {
			if employee.HireDate.After(time.Now().AddDate(0, 0, 1)) {
				errors = append(errors, EmployeeImportError{
					Row:      rowNum,
					Field:    "hire_date",
					Message:  "Hire date cannot be more than 1 day in the future",
					Value:    employee.HireDate.Format("2006-01-02"),
					Employee: employee,
				})
			}
		}
	}

	if len(errors) > 0 {
		log.Printf("EmployeeUseCase: Comprehensive validation found %d errors", len(errors))
	} else {
		log.Printf("EmployeeUseCase: Comprehensive validation passed for all %d employees", len(employees))
	}

	return errors
}

func (uc *EmployeeUseCase) isValidEmailFormat(email string) bool {

	return strings.Contains(email, "@") && strings.Contains(email, ".") && len(email) > 5
}

func (uc *EmployeeUseCase) isValidPhoneFormat(phone string) bool {

	if len(phone) < 8 || len(phone) > 20 {
		return false
	}

	return strings.HasPrefix(phone, "+") || strings.HasPrefix(phone, "0") || strings.HasPrefix(phone, "8")
}

func (uc *EmployeeUseCase) isValidNIKFormat(nik string) bool {

	if len(nik) != 16 {
		return false
	}

	for _, char := range nik {
		if char < '0' || char > '9' {
			return false
		}
	}
	return true
}

func (uc *EmployeeUseCase) isValidPositionName(positionName string) bool {

	return len(strings.TrimSpace(positionName)) > 0
}

func (uc *EmployeeUseCase) lastMinuteValidation(ctx context.Context, employee *domain.Employee, rowNum int) []EmployeeImportError {
	var errors []EmployeeImportError

	if employee.User.Email != "" {
		existingUser, err := uc.authRepo.GetUserByEmail(ctx, employee.User.Email)
		if err == nil && existingUser != nil {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "email",
				Message:  fmt.Sprintf("Email '%s' was just registered by another process", employee.User.Email),
				Value:    employee.User.Email,
				Employee: employee,
			})
		}
	}

	if employee.NIK != nil && *employee.NIK != "" {
		existingEmployee, err := uc.employeeRepo.GetByNIK(ctx, *employee.NIK)
		if err == nil && existingEmployee != nil {
			errors = append(errors, EmployeeImportError{
				Row:      rowNum,
				Field:    "nik",
				Message:  fmt.Sprintf("NIK '%s' was just registered by another process", *employee.NIK),
				Value:    *employee.NIK,
				Employee: employee,
			})
		}
	}

	return errors
}

func (uc *EmployeeUseCase) ResetEmployeePassword(ctx context.Context, employeeID uint) error {
	log.Printf("EmployeeUseCase: ResetEmployeePassword called for employee ID: %d", employeeID)

	// Get employee details including user email
	employee, err := uc.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			log.Printf("EmployeeUseCase: No employee found with ID %d", employeeID)
			return domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by ID %d from repository: %v", employeeID, err)
		return fmt.Errorf("failed to get employee by ID %d: %w", employeeID, err)
	}

	// Check if employee has associated user with email
	if employee.User.Email == "" {
		log.Printf("EmployeeUseCase: Employee ID %d has no associated email address", employeeID)
		return fmt.Errorf("employee has no associated email address for password reset")
	}

	// Send password reset email using auth repository
	err = uc.authRepo.ResetPassword(ctx, employee.User.Email)
	if err != nil {
		log.Printf("EmployeeUseCase: Error sending password reset email for employee ID %d (email: %s): %v", employeeID, employee.User.Email, err)
		return fmt.Errorf("failed to send password reset email: %w", err)
	}

	log.Printf("EmployeeUseCase: Successfully sent password reset email to %s for employee ID %d", employee.User.Email, employeeID)
	return nil
}
