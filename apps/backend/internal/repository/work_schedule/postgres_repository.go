package work_schedule

import (
	"context"
	"fmt"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"gorm.io/gorm"
)

type WorkScheduleRepository struct {
	db *gorm.DB
}

// NewPostgresRepository membuat instance baru dari WorkSchedule repository
func NewWorkScheduleRepository(db *gorm.DB) *WorkScheduleRepository {
	return &WorkScheduleRepository{
		db: db,
	}
}

// Create menyimpan jadwal kerja baru dengan semua detailnya
func (r *WorkScheduleRepository) CreateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// 1. Create the main WorkSchedule record (ensure it's active)
		workSchedule.IsActive = true
		if err := tx.Create(workSchedule).Error; err != nil {
			return fmt.Errorf("failed to create work schedule: %w", err)
		}

		// 2. Create each WorkScheduleDetail record, associating it with the main WorkSchedule
		for _, detail := range details {
			detail.WorkScheduleID = workSchedule.ID // Set the foreign key
			detail.IsActive = true                  // Pastikan detail baru aktif
			if err := tx.Create(detail).Error; err != nil {
				return fmt.Errorf("failed to create work schedule detail for schedule ID %d: %w", workSchedule.ID, err)
			}
		}
		return nil
	})
}

// GetByIDAndUser mengambil jadwal kerja aktif berdasarkan ID dan userID beserta detailnya (hanya yang aktif)
func (r *WorkScheduleRepository) GetByIDAndUser(ctx context.Context, id uint, userID uint) (*domain.WorkSchedule, error) {
	var workSchedule domain.WorkSchedule
	// Preload Details yang aktif dan their associated Location, hanya untuk work schedule yang aktif dan dimiliki user
	if err := r.db.WithContext(ctx).
		Where("is_active = ? AND created_by = ?", true, userID).
		Preload("Details", "is_active = ?", true).
		Preload("Details.Location").
		First(&workSchedule, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("work schedule with ID %d not found, not active, or not owned by user", id)
		}
		return nil, fmt.Errorf("failed to get work schedule by ID %d for user %d: %w", id, userID, err)
	}
	return &workSchedule, nil
}

// GetByIDWithAllDetailsByUser mengambil jadwal kerja aktif berdasarkan ID dan userID beserta semua detailnya (aktif dan tidak aktif) untuk editing
func (r *WorkScheduleRepository) GetByIDWithAllDetailsByUser(ctx context.Context, id uint, userID uint) (*domain.WorkSchedule, error) {
	var workSchedule domain.WorkSchedule
	// Preload semua Details (aktif dan tidak aktif) beserta associated Location, hanya untuk work schedule yang aktif dan dimiliki user
	if err := r.db.WithContext(ctx).
		Where("is_active = ? AND created_by = ?", true, userID).
		Preload("Details").
		Preload("Details.Location").
		First(&workSchedule, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("work schedule with ID %d not found, not active, or not owned by user", id)
		}
		return nil, fmt.Errorf("failed to get work schedule by ID %d for user %d: %w", id, userID, err)
	}
	return &workSchedule, nil
}

// GetByIDWithDetails mengambil jadwal kerja aktif berdasarkan ID beserta detailnya (hanya yang aktif)
func (r *WorkScheduleRepository) GetByIDWithDetails(ctx context.Context, id uint) (*domain.WorkSchedule, error) {
	var workSchedule domain.WorkSchedule
	// Preload Details yang aktif dan their associated Location, hanya untuk work schedule yang aktif
	if err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Preload("Details", "is_active = ?", true).
		Preload("Details.Location").
		First(&workSchedule, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("work schedule with ID %d not found or not active", id)
		}
		return nil, fmt.Errorf("failed to get work schedule by ID %d: %w", id, err)
	}
	return &workSchedule, nil
}

// GetByIDWithAllDetails mengambil jadwal kerja aktif berdasarkan ID beserta semua detailnya (aktif dan tidak aktif) untuk editing
func (r *WorkScheduleRepository) GetByIDWithAllDetails(ctx context.Context, id uint) (*domain.WorkSchedule, error) {
	var workSchedule domain.WorkSchedule
	// Preload semua Details (aktif dan tidak aktif) beserta associated Location, hanya untuk work schedule yang aktif
	if err := r.db.WithContext(ctx).
		Where("is_active = ?", true).
		Preload("Details").
		Preload("Details.Location").
		First(&workSchedule, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("work schedule with ID %d not found or not active", id)
		}
		return nil, fmt.Errorf("failed to get work schedule by ID %d: %w", id, err)
	}
	return &workSchedule, nil
}

// UpdateByUser memperbarui jadwal kerja beserta detailnya hanya jika dimiliki oleh user
func (r *WorkScheduleRepository) UpdateByUser(ctx context.Context, id uint, userID uint, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Check if work schedule exists and is owned by user
		var existingSchedule domain.WorkSchedule
		if err := tx.Where("id = ? AND is_active = ? AND created_by = ?", id, true, userID).First(&existingSchedule).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("work schedule with ID %d not found, not active, or not owned by user", id)
			}
			return fmt.Errorf("failed to check work schedule ownership: %w", err)
		}

		// Update WorkSchedule utama
		workSchedule.ID = id
		workSchedule.CreatedBy = userID // Maintain ownership
		if err := tx.Save(workSchedule).Error; err != nil {
			return fmt.Errorf("failed to update work schedule: %w", err)
		}

		// Hapus work schedule detail yang ditandai untuk dihapus (hard delete)
		if len(deletedDetailIDs) > 0 {
			if err := tx.Where("id IN ? AND work_schedule_id = ?", deletedDetailIDs, id).Delete(&domain.WorkScheduleDetail{}).Error; err != nil {
				return fmt.Errorf("failed to delete work schedule details: %w", err)
			}
		}

		// Simpan atau perbarui setiap WorkScheduleDetail
		for _, detail := range details {
			detail.WorkScheduleID = id // Pastikan ID jadwal kerja terhubung
			if err := tx.Save(detail).Error; err != nil {
				return fmt.Errorf("failed to save work schedule detail for schedule ID %d: %w", id, err)
			}
		}
		return nil
	})
}

// UpdateWithDetails memperbarui jadwal kerja beserta detailnya
func (r *WorkScheduleRepository) UpdateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update WorkSchedule utama
		if err := tx.Save(workSchedule).Error; err != nil {
			return fmt.Errorf("failed to update work schedule: %w", err)
		}
		// Hapus work schedule detail yang ditandai untuk dihapus (hard delete)
		if len(deletedDetailIDs) > 0 {
			if err := tx.Where("id IN ?", deletedDetailIDs).Delete(&domain.WorkScheduleDetail{}).Error; err != nil {
				return fmt.Errorf("failed to delete work schedule details: %w", err)
			}
		}
		// Simpan atau perbarui setiap WorkScheduleDetail
		for _, detail := range details {
			detail.WorkScheduleID = workSchedule.ID // Pastikan ID jadwal kerja terhubung
			// Keep the IsActive value as set from the handler/usecase layer
			// detail.IsActive should already be set correctly from the domain object
			if err := tx.Save(detail).Error; err != nil {
				return fmt.Errorf("failed to save work schedule detail for schedule ID %d: %w", workSchedule.ID, err)
			}
		}
		return nil
	})
}

// GetDetailsByScheduleID mengambil detail jadwal kerja berdasarkan ID jadwal kerja (hanya yang aktif)
func (r *WorkScheduleRepository) GetDetailsByScheduleID(ctx context.Context, scheduleID uint) ([]*domain.WorkScheduleDetail, error) {
	var details []*domain.WorkScheduleDetail
	if err := r.db.WithContext(ctx).
		Preload("Location").
		Where("work_schedule_id = ? AND is_active = ?", scheduleID, true).
		Find(&details).Error; err != nil {
		return nil, fmt.Errorf("failed to get work schedule details for schedule ID %d: %w", scheduleID, err)
	}
	return details, nil
}

// DeleteByUser melakukan soft delete pada jadwal kerja hanya jika dimiliki oleh user
func (r *WorkScheduleRepository) DeleteByUser(ctx context.Context, id uint, userID uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, check if the work schedule exists, is still active, and is owned by user
		var workSchedule domain.WorkSchedule
		if err := tx.Where("id = ? AND is_active = ? AND created_by = ?", id, true, userID).First(&workSchedule).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("work schedule with ID %d not found, already deleted, or not owned by user", id)
			}
			return fmt.Errorf("failed to check work schedule existence and ownership: %w", err)
		}

		// Soft delete all work schedule details by setting is_active to false
		if err := tx.Model(&domain.WorkScheduleDetail{}).
			Where("work_schedule_id = ?", id).
			Update("is_active", false).Error; err != nil {
			return fmt.Errorf("failed to soft delete work schedule details for schedule ID %d: %w", id, err)
		}

		// Soft delete the main work schedule by setting is_active to false
		if err := tx.Model(&workSchedule).Update("is_active", false).Error; err != nil {
			return fmt.Errorf("failed to soft delete work schedule with ID %d: %w", id, err)
		}

		return nil
	})
}

// DeleteWithDetails melakukan soft delete pada jadwal kerja dengan mengubah status is_active menjadi false
func (r *WorkScheduleRepository) DeleteWithDetails(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, check if the work schedule exists and is still active
		var workSchedule domain.WorkSchedule
		if err := tx.Where("id = ? AND is_active = ?", id, true).First(&workSchedule).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("work schedule with ID %d not found or already deleted", id)
			}
			return fmt.Errorf("failed to check work schedule existence: %w", err)
		}

		// Soft delete all work schedule details by setting is_active to false
		if err := tx.Model(&domain.WorkScheduleDetail{}).
			Where("work_schedule_id = ?", id).
			Update("is_active", false).Error; err != nil {
			return fmt.Errorf("failed to soft delete work schedule details for schedule ID %d: %w", id, err)
		}

		// Soft delete the main work schedule by setting is_active to false
		if err := tx.Model(&workSchedule).Update("is_active", false).Error; err != nil {
			return fmt.Errorf("failed to soft delete work schedule with ID %d: %w", id, err)
		}

		return nil
	})
}

// ListByUser mengambil daftar jadwal kerja yang aktif dan dimiliki oleh user dengan paginasi
func (r *WorkScheduleRepository) ListByUser(ctx context.Context, userID uint, paginationParams domain.PaginationParams) ([]*domain.WorkSchedule, int64, error) {
	var workSchedules []*domain.WorkSchedule
	var totalItems int64

	offset := (paginationParams.Page - 1) * paginationParams.PageSize

	// Count total active items owned by user only
	err := r.db.WithContext(ctx).Model(&domain.WorkSchedule{}).
		Where("is_active = ? AND created_by = ?", true, userID).
		Count(&totalItems).Error
	if err != nil {
		return nil, 0, err
	}

	// Retrieve paginated active items owned by user with active details preloaded, ordered by ID
	err = r.db.WithContext(ctx).Model(&domain.WorkSchedule{}).
		Where("is_active = ? AND created_by = ?", true, userID).
		Preload("Details", "is_active = ?", true).
		Preload("Details.Location"). // Preload location for each detail
		Order("id ASC").             // Add ordering by ID ascending
		Offset(offset).
		Limit(paginationParams.PageSize).
		Find(&workSchedules).Error

	if err != nil {
		return nil, 0, err
	}

	return workSchedules, totalItems, nil
}

// ListWithPagination mengambil daftar jadwal kerja yang aktif dengan paginasi
func (r *WorkScheduleRepository) ListWithPagination(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.WorkSchedule, int64, error) {
	var workSchedules []*domain.WorkSchedule
	var totalItems int64

	offset := (paginationParams.Page - 1) * paginationParams.PageSize

	// Count total active items only
	err := r.db.WithContext(ctx).Model(&domain.WorkSchedule{}).
		Where("is_active = ?", true).
		Count(&totalItems).Error
	if err != nil {
		return nil, 0, err
	}

	// Retrieve paginated active items with active details preloaded, ordered by ID
	err = r.db.WithContext(ctx).Model(&domain.WorkSchedule{}).
		Where("is_active = ?", true).
		Preload("Details", "is_active = ?", true).
		Preload("Details.Location"). // Preload location for each detail
		Order("id ASC").             // Add ordering by ID ascending
		Offset(offset).
		Limit(paginationParams.PageSize).
		Find(&workSchedules).Error

	if err != nil {
		return nil, 0, err
	}

	return workSchedules, totalItems, nil
}

// IsDetailConfigurationUnique memeriksa apakah konfigurasi detail unik
func (r *WorkScheduleRepository) IsDetailConfigurationUnique(ctx context.Context, scheduleID uint, workTypeDetail string, days []domain.Days, excludeDetailID uint) (bool, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&domain.WorkScheduleDetail{}).
		Where("work_schedule_id = ?", scheduleID).
		Where("work_type_detail = ?", workTypeDetail)

	// Logika untuk memeriksa days mungkin perlu disesuaikan tergantung bagaimana Anda menyimpannya
	// Untuk contoh ini, kita asumsikan days adalah string yang bisa dibandingkan langsung atau perlu parsing
	// Jika days adalah array/slice, Anda mungkin perlu query yang lebih kompleks atau memproses di sisi aplikasi

	if excludeDetailID != 0 {
		query = query.Where("id != ?", excludeDetailID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("failed to check uniqueness of work schedule detail: %w", err)
	}

	return count == 0, nil
}
