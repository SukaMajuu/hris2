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
		// 1. Create the main WorkSchedule record
		if err := tx.Create(workSchedule).Error; err != nil {
			return fmt.Errorf("failed to create work schedule: %w", err)
		}

		// 2. Create each WorkScheduleDetail record, associating it with the main WorkSchedule
		for _, detail := range details {
			detail.WorkScheduleID = workSchedule.ID // Set the foreign key
			if err := tx.Create(detail).Error; err != nil {
				return fmt.Errorf("failed to create work schedule detail for schedule ID %d: %w", workSchedule.ID, err)
			}
		}
		return nil
	})
}

// GetByIDWithDetails mengambil jadwal kerja berdasarkan ID beserta detailnya
func (r *WorkScheduleRepository) GetByIDWithDetails(ctx context.Context, id uint) (*domain.WorkSchedule, error) {
	var workSchedule domain.WorkSchedule
	// Preload Details and their associated Location
	if err := r.db.WithContext(ctx).Preload("Details.Location").First(&workSchedule, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("work schedule with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to get work schedule by ID %d: %w", id, err)
	}
	return &workSchedule, nil
}

// UpdateWithDetails memperbarui jadwal kerja beserta detailnya
func (r *WorkScheduleRepository) UpdateWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Update WorkSchedule utama
		if err := tx.Save(workSchedule).Error; err != nil {
			return fmt.Errorf("failed to update work schedule: %w", err)
		}

		// Hapus detail yang ditandai untuk dihapus
		if len(deletedDetailIDs) > 0 {
			if err := tx.Delete(&domain.WorkScheduleDetail{}, deletedDetailIDs).Error; err != nil {
				return fmt.Errorf("failed to delete work schedule details: %w", err)
			}
		}

		// Simpan atau perbarui setiap WorkScheduleDetail
		for _, detail := range details {
			detail.WorkScheduleID = workSchedule.ID // Pastikan ID jadwal kerja terhubung
			if err := tx.Save(detail).Error; err != nil {
				return fmt.Errorf("failed to save work schedule detail for schedule ID %d: %w", workSchedule.ID, err)
			}
		}
		return nil
	})
}

// GetDetailsByScheduleID mengambil detail jadwal kerja berdasarkan ID jadwal kerja
func (r *WorkScheduleRepository) GetDetailsByScheduleID(ctx context.Context, scheduleID uint) ([]*domain.WorkScheduleDetail, error) {
	var details []*domain.WorkScheduleDetail
	if err := r.db.WithContext(ctx).Preload("Location").Where("work_schedule_id = ?", scheduleID).Find(&details).Error; err != nil {
		return nil, fmt.Errorf("failed to get work schedule details for schedule ID %d: %w", scheduleID, err)
	}
	return details, nil
}

// DeleteWithDetails menghapus jadwal kerja beserta semua detailnya
func (r *WorkScheduleRepository) DeleteWithDetails(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// First, check if the work schedule exists
		var workSchedule domain.WorkSchedule
		if err := tx.First(&workSchedule, id).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				return fmt.Errorf("work schedule with ID %d not found", id)
			}
			return fmt.Errorf("failed to check work schedule existence: %w", err)
		}

		// Delete all work schedule details first (due to foreign key constraint)
		if err := tx.Where("work_schedule_id = ?", id).Delete(&domain.WorkScheduleDetail{}).Error; err != nil {
			return fmt.Errorf("failed to delete work schedule details for schedule ID %d: %w", id, err)
		}

		// Then delete the main work schedule
		if err := tx.Delete(&workSchedule).Error; err != nil {
			return fmt.Errorf("failed to delete work schedule with ID %d: %w", id, err)
		}

		return nil
	})
}

// ListWithPagination mengambil daftar jadwal kerja dengan paginasi
func (r *WorkScheduleRepository) ListWithPagination(ctx context.Context, paginationParams domain.PaginationParams) ([]*domain.WorkSchedule, int64, error) {
	var workSchedules []*domain.WorkSchedule
	var totalItems int64

	offset := (paginationParams.Page - 1) * paginationParams.PageSize

	// Count total items
	err := r.db.WithContext(ctx).Model(&domain.WorkSchedule{}).Count(&totalItems).Error
	if err != nil {
		return nil, 0, err
	}

	// Retrieve paginated items with details preloaded
	err = r.db.WithContext(ctx).Model(&domain.WorkSchedule{}).
		Preload("Details").
		Preload("Details.Location"). // Preload location for each detail
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
