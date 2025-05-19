package employee

import (
	"context"
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	dtoemployee "github.com/SukaMajuu/hris/apps/backend/domain/dto/employee"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
)

type EmployeeUseCase struct {
	employeeRepo interfaces.EmployeeRepository
}

func NewEmployeeUseCase(
	employeeRepo interfaces.EmployeeRepository,
) *EmployeeUseCase {
	return &EmployeeUseCase{
		employeeRepo: employeeRepo,
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

		employeeDTOs[i] = &dtoemployee.EmployeeResponseDTO{
			ID:               emp.ID,
			FirstName:        emp.FirstName,
			LastName:         emp.LastName,
			Gender:           genderDTO,
			Phone:            &emp.User.Phone,
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

/*
// Create creates a new employee record.
// It would involve validating the input, potentially checking for duplicates,
// and then calling the repository to save the new employee.
func (uc *EmployeeUseCase) Create(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: Create called for employee: %+v", employee)
	// TODO: Implement business logic for creating an employee.
	// Example:
	// if err := validateEmployeeData(employee); err != nil {
	// 	return nil, fmt.Errorf("validation failed: %w", err)
	// }
	//
	// createdEmployee, err := uc.employeeRepo.Create(ctx, employee)
	// if err != nil {
	//	 log.Printf("EmployeeUseCase: Error creating employee in repository: %v", err)
	//	 return nil, fmt.Errorf("failed to create employee: %w", err)
	// }
	// log.Printf("EmployeeUseCase: Successfully created employee with ID %d", createdEmployee.ID)
	// return createdEmployee, nil
	return nil, fmt.Errorf("Create employee not implemented")
}

// GetByID retrieves a single employee by their unique ID.
func (uc *EmployeeUseCase) GetByID(ctx context.Context, id uint) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: GetByID called for ID: %d", id)
	// TODO: Implement business logic for retrieving an employee by ID.
	// employee, err := uc.employeeRepo.GetByID(ctx, id)
	// if err != nil {
	//	 log.Printf("EmployeeUseCase: Error getting employee by ID %d from repository: %v", id, err)
	//	 return nil, fmt.Errorf("failed to get employee by ID %d: %w", id, err)
	// }
	// if employee == nil {
	// 	log.Printf("EmployeeUseCase: No employee found with ID %d", id)
	//   // Consider returning a domain-specific error like domain.ErrEmployeeNotFound
	//	 return nil, fmt.Errorf("employee with ID %d not found", id)
	// }
	// log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d", id)
	// return employee, nil
	return nil, fmt.Errorf("GetByID employee not implemented")
}

// Update modifies an existing employee's details.
// This would typically involve retrieving the employee, validating changes,
// applying updates, and saving them via the repository.
func (uc *EmployeeUseCase) Update(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: Update called for employee ID %d: %+v", employee.ID, employee)
	// TODO: Implement business logic for updating an employee.
	// Example:
	// existingEmployee, err := uc.employeeRepo.GetByID(ctx, employee.ID)
	// if err != nil {
	//	 return nil, fmt.Errorf("failed to retrieve existing employee for update: %w", err)
	// }
	// if existingEmployee == nil {
	//	 return nil, fmt.Errorf("employee with ID %d not found for update", employee.ID)
	// }
	//
	// // Apply updates from 'employee' to 'existingEmployee' here, after validation.
	// // For example: existingEmployee.FirstName = employee.FirstName if employee.FirstName is valid and provided.
	//
	// updatedEmployee, err := uc.employeeRepo.Update(ctx, existingEmployee)
	// if err != nil {
	//	log.Printf("EmployeeUseCase: Error updating employee ID %d in repository: %v", employee.ID, err)
	//	return nil, fmt.Errorf("failed to update employee ID %d: %w", employee.ID, err)
	// }
	// log.Printf("EmployeeUseCase: Successfully updated employee with ID %d", updatedEmployee.ID)
	// return updatedEmployee, nil
	return nil, fmt.Errorf("Update employee not implemented")
}

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
