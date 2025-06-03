package document

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	storage "github.com/supabase-community/storage-go"
	"github.com/supabase-community/supabase-go"
)

const bucketName = "document"

const (
	mimeTypePDF   = "application/pdf"
	mimeTypeDoc   = "application/msword"
	mimeTypeDocx  = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	mimeTypeOctet = "application/octet-stream"
)

type DocumentUseCase struct {
	documentRepo   interfaces.DocumentRepository
	employeeRepo   interfaces.EmployeeRepository
	supabaseClient *supabase.Client
}

func NewDocumentUseCase(
	documentRepo interfaces.DocumentRepository,
	employeeRepo interfaces.EmployeeRepository,
	supabaseClient *supabase.Client,
) *DocumentUseCase {
	return &DocumentUseCase{
		documentRepo:   documentRepo,
		employeeRepo:   employeeRepo,
		supabaseClient: supabaseClient,
	}
}

func (uc *DocumentUseCase) UploadDocument(ctx context.Context, userID uint, file *multipart.FileHeader) (*domain.Document, error) {

	employee, err := uc.employeeRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	fileName := uc.generateFileName(employee, file.Filename)

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

	_, err = uc.supabaseClient.Storage.UploadFile(bucketName, fileName, src, storage.FileOptions{
		ContentType: &[]string{uc.getContentTypeFromExtension(file.Filename)}[0],
		Upsert:      &[]bool{true}[0],
	})
	if err != nil {
		fmt.Printf("UseCase: Upload failed with error: %v\n", err)
		return nil, fmt.Errorf("failed to upload file to storage: %w", err)
	}

	fmt.Printf("UseCase: Upload successful!\n")

	publicURL := uc.supabaseClient.Storage.GetPublicUrl(bucketName, fileName)

	document := &domain.Document{
		EmployeeID: employee.ID,
		Name:       fileName,
		URL:        publicURL.SignedURL,
	}

	err = uc.documentRepo.Create(ctx, document)
	if err != nil {
		if uc.supabaseClient != nil && uc.supabaseClient.Storage != nil {
			if _, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketName, []string{fileName}); removeErr != nil {
				fmt.Printf("Warning: failed to cleanup uploaded file: %v", removeErr)
			}
		}
		return nil, fmt.Errorf("failed to create document record: %w", err)
	}

	return document, nil
}

func (uc *DocumentUseCase) GetDocumentsByEmployeeID(ctx context.Context, employeeID uint) ([]*domain.Document, error) {
	return uc.documentRepo.GetByEmployeeID(ctx, employeeID)
}

func (uc *DocumentUseCase) GetDocumentsByUserID(ctx context.Context, userID uint) ([]*domain.Document, error) {
	employee, err := uc.employeeRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee for user ID %d: %w", userID, err)
	}

	documents, err := uc.documentRepo.GetByEmployeeID(ctx, employee.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get documents for employee ID %d: %w", employee.ID, err)
	}

	return documents, nil
}

func (uc *DocumentUseCase) DeleteDocument(ctx context.Context, id uint) error {
	document, err := uc.documentRepo.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get document: %w", err)
	}

	err = uc.documentRepo.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete document from database: %w", err)
	}

	if uc.supabaseClient != nil && uc.supabaseClient.Storage != nil {
		if _, err = uc.supabaseClient.Storage.RemoveFile(bucketName, []string{document.Name}); err != nil {
			fmt.Printf("Warning: failed to delete file from storage: %v", err)
		}
	}

	return nil
}

func (uc *DocumentUseCase) generateFileName(employee *domain.Employee, originalFilename string) string {
	ext := filepath.Ext(originalFilename)

	var lastName string
	if employee.LastName != nil {
		lastName = *employee.LastName
	}

	baseName := fmt.Sprintf("%s %s_Documents", employee.FirstName, lastName)
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

func (uc *DocumentUseCase) getContentTypeFromExtension(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".pdf":
		return mimeTypePDF
	case ".doc":
		return mimeTypeDoc
	case ".docx":
		return mimeTypeDocx
	default:
		return mimeTypeOctet
	}
}

func (uc *DocumentUseCase) UploadDocumentForEmployee(ctx context.Context, employeeID uint, file *multipart.FileHeader) (*domain.Document, error) {
	employee, err := uc.employeeRepo.GetByID(ctx, employeeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get employee: %w", err)
	}

	fileName := uc.generateFileName(employee, file.Filename)

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

	_, err = uc.supabaseClient.Storage.UploadFile(bucketName, fileName, src, storage.FileOptions{
		ContentType: &[]string{uc.getContentTypeFromExtension(file.Filename)}[0],
		Upsert:      &[]bool{true}[0],
	})
	if err != nil {
		fmt.Printf("UseCase: Upload failed with error: %v\n", err)
		return nil, fmt.Errorf("failed to upload file to storage: %w", err)
	}

	fmt.Printf("UseCase: Upload successful!\n")

	publicURL := uc.supabaseClient.Storage.GetPublicUrl(bucketName, fileName)

	document := &domain.Document{
		EmployeeID: employee.ID,
		Name:       fileName,
		URL:        publicURL.SignedURL,
	}

	err = uc.documentRepo.Create(ctx, document)
	if err != nil {
		if uc.supabaseClient != nil && uc.supabaseClient.Storage != nil {
			if _, removeErr := uc.supabaseClient.Storage.RemoveFile(bucketName, []string{fileName}); removeErr != nil {
				fmt.Printf("Warning: failed to cleanup uploaded file: %v", removeErr)
			}
		}
		return nil, fmt.Errorf("failed to create document record: %w", err)
	}

	return document, nil
}
