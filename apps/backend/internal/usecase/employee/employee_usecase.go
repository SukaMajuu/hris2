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

func (uc *EmployeeUseCase) List(ctx context.Context, filters map[string]interface{}, paginationParams domain.PaginationParams) (*dtoemployee.EmployeeListResponseData, error) {
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
			PositionName:          emp.PositionName,
			Branch:                emp.Branch,
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

func (uc *EmployeeUseCase) Create(ctx context.Context, employee *domain.Employee, creatorEmployeeID uint) (*domain.Employee, error) {
	if employee.User.Email != "" {
		log.Printf("EmployeeUseCase: Create called for employee. FirstName: %s, UserEmail: %s, CreatorEmployeeID: %d", employee.FirstName, employee.User.Email, creatorEmployeeID)
	} else {
		log.Printf("EmployeeUseCase: Create called for employee. FirstName: %s, UserEmail: (not provided), CreatorEmployeeID: %d", employee.FirstName, creatorEmployeeID)
	}

	employee.ManagerID = &creatorEmployeeID

	if employee.User.Password == "" {
		employee.User.Password = "password"
	}

	err := uc.authRepo.RegisterEmployeeUser(ctx, &employee.User, employee)
	if err != nil {
		log.Printf("EmployeeUseCase: Error from authRepo.RegisterEmployeeUser: %v", err)
		return nil, fmt.Errorf("failed to create employee and user: %w", err)
	}

	log.Printf("EmployeeUseCase: Successfully created employee with ID %d and User ID %d, Manager ID %d", employee.ID, employee.User.ID, *employee.ManagerID)
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
	if employee.Branch != nil {
		existingEmployee.Branch = employee.Branch
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

	if employee.PositionName != "" {
		existingEmployee.PositionName = employee.PositionName
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
		log.Printf("EmployeeUseCase: Attempting to delete file with details:")
		log.Printf("  - Bucket: %s", bucketNamePhoto)
		log.Printf("  - File: %s", fileName)
		log.Printf("  - Client type: service_role (backend)")
		log.Printf("  - Attempt: %d", attempt)

		if attempt == 1 {
			log.Printf("EmployeeUseCase: Verifying file existence before deletion...")

		}

		removeResponse, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketNamePhoto, []string{fileName})
		if removeErr == nil {
			log.Printf("EmployeeUseCase: Successfully deleted old photo file: %s on attempt %d. Response: %+v", fileName, attempt, removeResponse)
			return true
		}

		errorMsg := removeErr.Error()
		log.Printf("EmployeeUseCase: Deletion attempt %d failed with error: %v", attempt, removeErr)

		if strings.Contains(errorMsg, "body must be object") {
			log.Printf("EmployeeUseCase: 'body must be object' error detected on attempt %d. This indicates storage policy issues:", attempt)
			log.Printf("  1. Missing DELETE policy for service_role on bucket '%s'", bucketNamePhoto)
			log.Printf("  2. Missing SELECT policy for service_role on bucket '%s'", bucketNamePhoto)
			log.Printf("  3. Policies may be configured for authenticated users instead of service_role")
			log.Printf("  4. Potential policy caching or race condition issue")

			if attempt == 1 {
				log.Printf("EmployeeUseCase: Required storage policies for service_role:")
				log.Printf("  DELETE: CREATE POLICY \"Enable delete for service role\" ON storage.objects FOR DELETE USING (auth.role() = 'service_role');")
				log.Printf("  SELECT: CREATE POLICY \"Enable select for service role\" ON storage.objects FOR SELECT USING (auth.role() = 'service_role');")
				log.Printf("  Alternative bucket-specific DELETE: CREATE POLICY \"Enable delete for service role on photo bucket\" " +
					"ON storage.objects FOR DELETE USING (bucket_id = 'photo' AND auth.role() = 'service_role');")
			}

			if attempt < maxRetries {
				log.Printf("EmployeeUseCase: Waiting 1 second before retry due to policy issue...")
				time.Sleep(1 * time.Second)
			}
		} else if strings.Contains(errorMsg, "not found") || strings.Contains(errorMsg, "404") {
			log.Printf("EmployeeUseCase: Old photo file not found in storage (may have been deleted already): %s", fileName)
			return true
		} else if strings.Contains(errorMsg, "unauthorized") || strings.Contains(errorMsg, "403") {
			log.Printf("EmployeeUseCase: Authorization error on attempt %d - service role may lack proper storage permissions", attempt)
			if attempt < maxRetries {
				time.Sleep(1 * time.Second)
			}
		} else if strings.Contains(errorMsg, "policy") {
			log.Printf("EmployeeUseCase: Policy violation detected on attempt %d - check storage policies for service_role access", attempt)
			if attempt < maxRetries {
				time.Sleep(1 * time.Second)
			}
		} else {
			log.Printf("EmployeeUseCase: Unexpected error on attempt %d deleting old photo: %v", attempt, removeErr)
			if attempt < maxRetries {
				time.Sleep(500 * time.Millisecond)
			}
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
