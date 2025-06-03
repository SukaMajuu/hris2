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
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	storage "github.com/supabase-community/storage-go"
	"github.com/supabase-community/supabase-go"
	"gorm.io/gorm"
)

const bucketNamePhoto = "photo"

// MIME type constants for content type detection
const (
	mimeTypeJPEG = "image/jpeg"
	mimeTypePNG  = "image/png"
)

type EmployeeUseCase struct {
	employeeRepo   interfaces.EmployeeRepository
	authRepo       interfaces.AuthRepository
	supabaseClient *supabase.Client
}

func NewEmployeeUseCase(
	employeeRepo interfaces.EmployeeRepository,
	authRepo interfaces.AuthRepository,
	supabaseClient *supabase.Client,
) *EmployeeUseCase {
	return &EmployeeUseCase{
		employeeRepo:   employeeRepo,
		authRepo:       authRepo,
		supabaseClient: supabaseClient,
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
			ID:                    emp.ID,
			Email:                 &emp.User.Email,
			Phone:                 phoneDTO,
			FirstName:             emp.FirstName,
			LastName:              emp.LastName,
			EmployeeCode:          emp.EmployeeCode,
			PositionName:          emp.Position.Name,
			Gender:                genderDTO,
			NIK:                   emp.NIK,
			PlaceOfBirth:          emp.PlaceOfBirth,
			Grade:                 emp.Grade,
			EmploymentStatus:      emp.EmploymentStatus,
			BankName:              emp.BankName,
			BankAccountNumber:     emp.BankAccountNumber,
			BankAccountHolderName: emp.BankAccountHolderName,
			ProfilePhotoURL:       emp.ProfilePhotoURL,
		}

		if emp.Branch != nil {
			employeeDTOs[i].BranchName = &emp.Branch.Name
		}

		if emp.LastEducation != nil {
			lastEducationStr := string(*emp.LastEducation)
			employeeDTOs[i].LastEducation = &lastEducationStr
		}
		if emp.ContractType != nil {
			contractTypeStr := string(*emp.ContractType)
			employeeDTOs[i].ContractType = &contractTypeStr
		}
		if emp.TaxStatus != nil {
			taxStatusStr := string(*emp.TaxStatus)
			employeeDTOs[i].TaxStatus = &taxStatusStr
		}
		if emp.DateOfBirth != nil {
			dateOfBirthStr := emp.DateOfBirth.Format("2006-01-02")
			employeeDTOs[i].DateOfBirth = &dateOfBirthStr
		}
		if emp.HireDate != nil {
			hireDateStr := emp.HireDate.Format("2006-01-02")
			employeeDTOs[i].HireDate = &hireDateStr
		}
		if emp.ResignationDate != nil {
			resignationDateStr := emp.ResignationDate.Format("2006-01-02")
			employeeDTOs[i].ResignationDate = &resignationDateStr
		}

		if emp.User.Email == "" {
			employeeDTOs[i].Email = nil
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
		ID:                    employee.ID,
		Email:                 &employee.User.Email,
		Phone:                 phoneDTO,
		FirstName:             employee.FirstName,
		LastName:              employee.LastName,
		EmployeeCode:          employee.EmployeeCode,
		PositionName:          employee.Position.Name,
		Gender:                genderDTO,
		NIK:                   employee.NIK,
		PlaceOfBirth:          employee.PlaceOfBirth,
		Grade:                 employee.Grade,
		EmploymentStatus:      employee.EmploymentStatus,
		BankName:              employee.BankName,
		BankAccountNumber:     employee.BankAccountNumber,
		BankAccountHolderName: employee.BankAccountHolderName,
		ProfilePhotoURL:       employee.ProfilePhotoURL,
	}

	if employee.Branch != nil {
		employeeDTO.BranchName = &employee.Branch.Name
	}

	if employee.LastEducation != nil {
		lastEducationStr := string(*employee.LastEducation)
		employeeDTO.LastEducation = &lastEducationStr
	}
	if employee.ContractType != nil {
		contractTypeStr := string(*employee.ContractType)
		employeeDTO.ContractType = &contractTypeStr
	}
	if employee.TaxStatus != nil {
		taxStatusStr := string(*employee.TaxStatus)
		employeeDTO.TaxStatus = &taxStatusStr
	}
	if employee.DateOfBirth != nil {
		dateOfBirthStr := employee.DateOfBirth.Format("2006-01-02")
		employeeDTO.DateOfBirth = &dateOfBirthStr
	}
	if employee.HireDate != nil {
		hireDateStr := employee.HireDate.Format("2006-01-02")
		employeeDTO.HireDate = &hireDateStr
	}
	if employee.ResignationDate != nil {
		resignationDateStr := employee.ResignationDate.Format("2006-01-02")
		employeeDTO.ResignationDate = &resignationDateStr
	}

	if employee.User.Email == "" {
		employeeDTO.Email = nil
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee with ID %d", id)
	return employeeDTO, nil
}

func (uc *EmployeeUseCase) Update(ctx context.Context, employee *domain.Employee) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: Update called for employee ID %d: %+v", employee.ID, employee)

	existingEmployee, err := uc.employeeRepo.GetByID(ctx, employee.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve existing employee for update: %w", err)
	}
	if existingEmployee == nil {
		return nil, fmt.Errorf("employee with ID %d not found for update", employee.ID)
	}

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
	if employee.DateOfBirth != nil {
		existingEmployee.DateOfBirth = employee.DateOfBirth
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

	if employee.PositionID != 0 {
		existingEmployee.PositionID = employee.PositionID
	}

	if employee.User.Email != "" {
		log.Printf("EmployeeUseCase: Updating User Email for UserID %d to %s", existingEmployee.UserID, employee.User.Email)
		existingEmployee.User.Email = employee.User.Email
	}
	if employee.User.Phone != "" {
		log.Printf("EmployeeUseCase: Updating User Phone for UserID %d to %s", existingEmployee.UserID, employee.User.Phone)
		existingEmployee.User.Phone = employee.User.Phone
	}

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

	err = uc.employeeRepo.Update(ctx, existingEmployee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error updating employee ID %d in repository: %v", employee.ID, err)
		return nil, fmt.Errorf("failed to update employee ID %d: %w", employee.ID, err)
	}
	log.Printf("EmployeeUseCase: Successfully updated employee with ID %d", existingEmployee.ID)
	return existingEmployee, nil
}

func (uc *EmployeeUseCase) Resign(ctx context.Context, id uint) error {
	log.Printf("EmployeeUseCase: Resign (Delete) called for ID: %d", id)

	existingEmployee, err := uc.employeeRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, domain.ErrEmployeeNotFound) {
			log.Printf("EmployeeUseCase: No employee found with ID %d for resignation", id)
			return domain.ErrEmployeeNotFound
		}
		log.Printf("EmployeeUseCase: Error getting employee by ID %d from repository for resignation: %v", id, err)
		return fmt.Errorf("failed to get employee by ID %d for resignation: %w", id, err)
	}

	now := time.Now()
	existingEmployee.EmploymentStatus = false
	existingEmployee.ResignationDate = &now

	err = uc.employeeRepo.Update(ctx, existingEmployee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error updating employee ID %d in repository for resignation: %v", id, err)
		return fmt.Errorf("failed to update employee ID %d for resignation: %w", id, err)
	}

	log.Printf("EmployeeUseCase: Successfully resigned employee with ID %d. EmploymentStatus set to false and ResignationDate to %v", id, now.Format(time.RFC3339))
	return nil
}

func (uc *EmployeeUseCase) GetStatistics(ctx context.Context) (*dtoemployee.EmployeeStatisticsResponseDTO, error) {
	log.Printf("EmployeeUseCase: GetStatistics called")

	totalEmployees, newEmployees, activeEmployees, resignedEmployees, permanentEmployees, contractEmployees, freelanceEmployees, err := uc.employeeRepo.GetStatistics(ctx)
	if err != nil {
		log.Printf("EmployeeUseCase: Error getting employee statistics from repository: %v", err)
		return nil, fmt.Errorf("failed to get employee statistics: %w", err)
	}

	response := &dtoemployee.EmployeeStatisticsResponseDTO{
		TotalEmployees:     totalEmployees,
		NewEmployees:       newEmployees,
		ActiveEmployees:    activeEmployees,
		ResignedEmployees:  resignedEmployees,
		PermanentEmployees: permanentEmployees,
		ContractEmployees:  contractEmployees,
		FreelanceEmployees: freelanceEmployees,
	}

	log.Printf("EmployeeUseCase: Successfully retrieved employee statistics - Total: %d, New: %d, Active: %d, Resigned: %d, Permanent: %d, Contract: %d, Freelance: %d",
		totalEmployees, newEmployees, activeEmployees, resignedEmployees, permanentEmployees, contractEmployees, freelanceEmployees)

	return response, nil
}

func (uc *EmployeeUseCase) UploadProfilePhoto(ctx context.Context, employeeID uint, file *multipart.FileHeader) (*domain.Employee, error) {
	log.Printf("EmployeeUseCase: UploadProfilePhoto called for employee ID: %d", employeeID)

	// Step 1: Read existing employee data from database
	employee, err := uc.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	// Step 2: Check if there's an existing photo and delete it from bucket first
	var oldFileName string
	if employee.ProfilePhotoURL != nil && *employee.ProfilePhotoURL != "" {
		oldFileName = uc.extractFileNameFromURL(*employee.ProfilePhotoURL)
		if oldFileName != "" {
			log.Printf("EmployeeUseCase: Found existing photo, deleting from bucket: %s", oldFileName)
			removeResponse, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketNamePhoto, []string{oldFileName})
			if removeErr != nil {
				log.Printf("Warning: failed to remove old photo file '%s': %v", oldFileName, removeErr)
				// Continue with upload even if delete fails
			} else {
				log.Printf("EmployeeUseCase: Successfully deleted old photo file: %s. Response: %+v", oldFileName, removeResponse)
			}
		} else {
			log.Printf("EmployeeUseCase: Warning - Could not extract filename from existing photo URL: %s", *employee.ProfilePhotoURL)
		}
	} else {
		log.Printf("EmployeeUseCase: No existing photo found for employee ID: %d", employeeID)
	}

	// Step 3: Generate new filename for the new photo
	fileName := uc.generatePhotoFileName(employee, file.Filename)

	// Step 4: Open and prepare the new file for upload
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

	// Step 5: Upload new photo to bucket
	_, err = uc.supabaseClient.Storage.UploadFile(bucketNamePhoto, fileName, src, storage.FileOptions{
		ContentType: &[]string{uc.getContentTypeFromExtension(file.Filename)}[0],
		Upsert:      &[]bool{true}[0],
	})
	if err != nil {
		log.Printf("EmployeeUseCase: Upload failed with error: %v", err)
		return nil, fmt.Errorf("failed to upload file to storage: %w", err)
	}

	log.Printf("EmployeeUseCase: Photo upload successful! File: %s", fileName)

	// Step 6: Generate public URL for the new photo
	publicURL := uc.supabaseClient.Storage.GetPublicUrl(bucketNamePhoto, fileName)
	log.Printf("EmployeeUseCase: Generated public URL: %s", publicURL.SignedURL)

	// Step 7: Update database with new photo URL
	employee.ProfilePhotoURL = &publicURL.SignedURL

	err = uc.employeeRepo.Update(ctx, employee)
	if err != nil {
		// Step 8: If database update fails, cleanup the newly uploaded file
		log.Printf("EmployeeUseCase: Database update failed, cleaning up uploaded file: %s", fileName)
		if _, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketNamePhoto, []string{fileName}); removeErr != nil {
			log.Printf("Warning: failed to cleanup uploaded file: %v", removeErr)
		}
		return nil, fmt.Errorf("failed to update employee photo URL: %w", err)
	}

	log.Printf("EmployeeUseCase: Successfully updated employee photo URL for ID: %d", employeeID)
	return employee, nil
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

	// Handle Supabase storage URLs
	// Format: https://xxx.supabase.co/storage/v1/object/public/photo/filename.ext
	if strings.Contains(url, "/storage/v1/object/public/") {
		// Split by "public/" and take the part after it
		parts := strings.Split(url, "/storage/v1/object/public/")
		if len(parts) > 1 {
			// Get the part after "public/" which should be "bucket/filename"
			pathAfterPublic := parts[1]
			// Split by "/" to get bucket and filename
			pathParts := strings.Split(pathAfterPublic, "/")
			if len(pathParts) >= 2 {
				// Skip the bucket name (first part) and get the filename
				fileName := strings.Join(pathParts[1:], "/") // Join in case filename has slashes
				// Remove query parameters if any
				if idx := strings.Index(fileName, "?"); idx != -1 {
					fileName = fileName[:idx]
				}
				log.Printf("EmployeeUseCase: Extracted filename from Supabase URL: %s", fileName)
				return fileName
			}
		}
	}

	// Fallback: extract filename from the end of URL
	parts := strings.Split(url, "/")
	if len(parts) > 0 {
		fileName := parts[len(parts)-1]
		// Remove query parameters if any
		if idx := strings.Index(fileName, "?"); idx != -1 {
			fileName = fileName[:idx]
		}
		log.Printf("EmployeeUseCase: Extracted filename (fallback method): %s", fileName)
		return fileName
	}

	log.Printf("EmployeeUseCase: Could not extract filename from URL")
	return ""
}

// getContentTypeFromExtension determines the content type based on file extension
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
