package employee

import (
	"context"
	"errors"
	"fmt"
	"log"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoemployee "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type EmployeeUseCase struct {
	employeeRepo interfaces.EmployeeRepository
	authRepo     interfaces.AuthRepository
}

func NewEmployeeUseCase(
	employeeRepo interfaces.EmployeeRepository,
	authRepo interfaces.AuthRepository,
) *EmployeeUseCase {
	return &EmployeeUseCase{
		employeeRepo: employeeRepo,
		authRepo:     authRepo,
	}
}

func (uc *EmployeeUseCase) List(ctx context.Context, filters map[string]interface{}, paginationParams domain.PaginationParams) (*domain.EmployeeListResponseData, error) {
	domainEmployees, totalItems, err := uc.employeeRepo.List(ctx, filters, paginationParams)
	if err != nil {
		return nil, fmt.Errorf("failed to list employees from repository: %w", err)
	}

	employeeDTOs := make([]*dtoemployee.EmployeeResponseDTO, len(domainEmployees))
	for i, emp := range domainEmployees {
		var genderDTO *string
		if emp.Gender != nil {
			genderStr := string(*emp.Gender)
			genderDTO = &genderStr
		}

		var phoneDTO *string
		if emp.User.Phone != "" {
			phoneDTO = &emp.User.Phone
		}

		employeeDTOs[i] = &dtoemployee.EmployeeResponseDTO{
			ID:               emp.ID,
			FirstName:        emp.FirstName,
			LastName:         emp.LastName,
			Gender:           genderDTO,
			Phone:            phoneDTO,
			BranchID:         emp.BranchID,
			PositionID:       emp.PositionID,
			Grade:            emp.Grade,
			EmploymentStatus: emp.EmploymentStatus,
		}
	}

	totalPages := 0
	if paginationParams.PageSize > 0 {
		totalPages = int((totalItems + int64(paginationParams.PageSize) - 1) / int64(paginationParams.PageSize))
	}
	if totalPages < 1 && totalItems > 0 {
		totalPages = 1
	} else if totalItems == 0 {
		totalPages = 0
	}

	response := &domain.EmployeeListResponseData{
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

func (uc *EmployeeUseCase) Create(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	if employee.User.Email != "" {
		log.Printf("EmployeeUseCase: Create called for employee. FirstName: %s, UserEmail: %s", employee.FirstName, employee.User.Email)
	} else {
		log.Printf("EmployeeUseCase: Create called for employee. FirstName: %s, UserEmail: (not provided)", employee.FirstName)
	}

	if employee.User.Password == "" {
		employee.User.Password = "password"
	}

	err := uc.authRepo.RegisterEmployeeUser(ctx, &employee.User, employee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error from authRepo.RegisterEmployeeUser: %v", err)
		return nil, fmt.Errorf("failed to create employee and user: %w", err)
	}

	log.Printf("EmployeeUseCase: Successfully created employee with ID %d and User ID %d", employee.ID, employee.User.ID)
	return employee, nil
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

	var genderDTO *string
	if employee.Gender != nil {
		genderStr := string(*employee.Gender)
		genderDTO = &genderStr
	}

	var phoneDTO *string
	if employee.User.Phone != "" {
		phoneDTO = &employee.User.Phone
	}

	employeeDTO := &dtoemployee.EmployeeResponseDTO{
		ID:               employee.ID,
		FirstName:        employee.FirstName,
		LastName:         employee.LastName,
		Gender:           genderDTO,
		Phone:            phoneDTO,
		BranchID:         employee.BranchID,
		PositionID:       employee.PositionID,
		Grade:            employee.Grade,
		EmploymentStatus: employee.EmploymentStatus,
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d", id)
	return employeeDTO, nil
}

// Update modifies an existing employee's details.
// This would typically involve retrieving the employee, validating changes,
// applying updates, and saving them via the repository.
func (uc *EmployeeUseCase) Update(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: Update called for employee ID %d: %+v", employee.ID, employee)
	// TODO: Implement business logic for updating an employee.
	// Example:
	existingEmployee, err := uc.employeeRepo.GetByID(ctx, employee.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve existing employee for update: %w", err)
	}
	if existingEmployee == nil {
		return nil, fmt.Errorf("employee with ID %d not found for update", employee.ID)
	}

	// Apply updates from 'employee' to 'existingEmployee'
	// We should only update fields that are actually provided in the 'employee' input
	// and are not zero-valued, to avoid unintentional overwrites.

	if employee.FirstName != "" {
		existingEmployee.FirstName = employee.FirstName
	}
	if employee.LastName != nil {
		existingEmployee.LastName = employee.LastName
	}
	if employee.EmployeeCode != nil {
		existingEmployee.EmployeeCode = employee.EmployeeCode
	}
	if employee.BranchID != nil {
		existingEmployee.BranchID = employee.BranchID
	}
	if employee.Gender != nil {
		existingEmployee.Gender = employee.Gender
	}
	if employee.NIK != nil {
		existingEmployee.NIK = employee.NIK
	}
	if employee.PlaceOfBirth != nil {
		existingEmployee.PlaceOfBirth = employee.PlaceOfBirth
	}
	if employee.LastEducation != nil {
		existingEmployee.LastEducation = employee.LastEducation
	}
	if employee.Grade != nil {
		existingEmployee.Grade = employee.Grade
	}
	if employee.ContractType != nil {
		existingEmployee.ContractType = employee.ContractType
	}
	if employee.ResignationDate != nil {
		existingEmployee.ResignationDate = employee.ResignationDate
	}
	if employee.HireDate != nil {
		existingEmployee.HireDate = employee.HireDate
	}
	if employee.BankName != nil {
		existingEmployee.BankName = employee.BankName
	}
	if employee.BankAccountNumber != nil {
		existingEmployee.BankAccountNumber = employee.BankAccountNumber
	}
	if employee.BankAccountHolderName != nil {
		existingEmployee.BankAccountHolderName = employee.BankAccountHolderName
	}
	if employee.TaxStatus != nil {
		existingEmployee.TaxStatus = employee.TaxStatus
	}
	if employee.ProfilePhotoURL != nil {
		existingEmployee.ProfilePhotoURL = employee.ProfilePhotoURL
	}

	// If employee.PositionID is provided (not zero), update it.
	// Note: This assumes 0 is not a valid PositionID. If it is,
	// the input DTO for updates should use *uint for PositionID.
	if employee.PositionID != 0 {
		existingEmployee.PositionID = employee.PositionID
	}

	// Note: User field and its sub-fields (Email, Phone, Password) updates
	// might need special handling, potentially in a separate auth use case or method.
	// For now, we are not updating User details here to avoid complexity.
	// EmploymentStatus is a boolean, so we update it directly if provided in the request.
	// Assuming the request `employee` struct will have `EmploymentStatus` set if it's intended to be changed.
	existingEmployee.EmploymentStatus = employee.EmploymentStatus

	err = uc.employeeRepo.Update(ctx, existingEmployee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error updating employee ID %d in repository: %v", employee.ID, err)
		return nil, fmt.Errorf("failed to update employee ID %d: %w", employee.ID, err)
	}
	log.Printf("EmployeeUseCase: Successfully updated employee with ID %d", existingEmployee.ID)
	return existingEmployee, nil
}

/*
// Delete removes an employee record by their ID.
// Business logic might include checks (e.g., cannot delete if user has active responsibilities).
func (uc *EmployeeUseCase) Delete(ctx context.Context, id uint) error {
	log.Printf("EmployeeUseCase: Delete called for ID: %d", id)
	// TODO: Implement business logic for deleting an employee.
	// Example:
	// if err := uc.canDeleteEmployee(ctx, id); err != nil {
	//   return fmt.Errorf("cannot delete employee ID %d: %w", id, err)
	// }
	//
	// err := uc.employeeRepo.Delete(ctx, id)
	// if err != nil {
	//	 log.Printf("EmployeeUseCase: Error deleting employee ID %d from repository: %v", id, err)
	//	 return fmt.Errorf("failed to delete employee ID %d: %w", id, err)
	// }
	// log.Printf("EmployeeUseCase: Successfully deleted employee with ID %d", id)
	// return nil
	return fmt.Errorf("Delete employee not implemented")
}
*/
