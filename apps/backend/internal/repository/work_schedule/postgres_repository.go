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

/*
// DeleteSchedule menghapus jadwal kerja berdasarkan ID
func (r *WorkScheduleRepository) DeleteSchedule(ctx context.Context, id uint) error {
	// Implementasi penghapusan jadwal kerja
	// Misalnya, penghapusan lunak atau penghapusan keras
	// Untuk contoh ini, kita akan melakukan penghapusan keras
	result := r.db.WithContext(ctx).Delete(&domain.WorkSchedule{}, id)
	if result.Error != nil {
		return fmt.Errorf("failed to delete work schedule with ID %d: %w", id, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("no work schedule found with ID %d to delete", id) // Atau bisa juga mengembalikan nil jika tidak ada yang dihapus dianggap bukan error
	}
	return nil
}

// GetDetailsByScheduleID mengambil detail jadwal kerja berdasarkan ID jadwal kerja
func (r *WorkScheduleRepository) GetDetailsByScheduleID(ctx context.Context, scheduleID uint) ([]*domain.WorkScheduleDetail, error) {
	var details []*domain.WorkScheduleDetail
	if err := r.db.WithContext(ctx).Where("work_schedule_id = ?", scheduleID).Find(&details).Error; err != nil {
		return nil, fmt.Errorf("failed to get work schedule details for schedule ID %d: %w", scheduleID, err)
	}
	return details, nil
}

// SaveWithDetails menyimpan (membuat atau memperbarui) jadwal kerja beserta detailnya
func (r *WorkScheduleRepository) SaveWithDetails(ctx context.Context, workSchedule *domain.WorkSchedule, details []*domain.WorkScheduleDetail, deletedDetailIDs []uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Simpan atau perbarui WorkSchedule utama
		if err := tx.Save(workSchedule).Error; err != nil {
			return fmt.Errorf("failed to save work schedule: %w", err)
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

// SoftDeleteDetail melakukan soft delete pada detail jadwal kerja
func (r *WorkScheduleRepository) SoftDeleteDetail(ctx context.Context, detailID uint) error {
	// Implementasi soft delete jika diperlukan, misalnya dengan mengatur kolom deleted_at
	// Untuk contoh ini, kita akan melakukan penghapusan keras
	result := r.db.WithContext(ctx).Delete(&domain.WorkScheduleDetail{}, detailID)
	if result.Error != nil {
		return fmt.Errorf("failed to delete work schedule detail with ID %d: %w", detailID, result.Error)
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("no work schedule detail found with ID %d to delete", detailID)
	}
	return nil
}

// ListWithPagination mengambil daftar jadwal kerja dengan paginasi
func (r *WorkScheduleRepository) ListWithPagination(ctx context.Context, pagination domain.PaginationParams) ([]*domain.WorkSchedule, int64, error) {
	var workSchedules []*domain.WorkSchedule
	var totalItems int64

	query := r.db.WithContext(ctx).Model(&domain.WorkSchedule{})

	// Hitung total item sebelum paginasi
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to count work schedules: %w", err)
	}

	// Terapkan paginasi
	offset := (pagination.Page - 1) * pagination.PageSize
	if err := query.Offset(offset).Limit(pagination.PageSize).Find(&workSchedules).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to list work schedules with pagination: %w", err)
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
*/
