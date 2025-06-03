package position

import (
	"context"
	"errors"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type PositionUseCase struct {
	positionRepo interfaces.PositionRepository
}

func NewPositionUseCase(positionRepo interfaces.PositionRepository) *PositionUseCase {
	return &PositionUseCase{
		positionRepo: positionRepo,
	}
}

func (u *PositionUseCase) Create(ctx context.Context, position *domain.Position) (*domain.Position, error) {
	if err := u.positionRepo.Create(ctx, position); err != nil {
		return nil, err
	}
	return position, nil
}

func (u *PositionUseCase) GetByID(ctx context.Context, id uint) (*domain.Position, error) {
	position, err := u.positionRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("position not found")
		}
		return nil, err
	}
	return position, nil
}

func (u *PositionUseCase) GetByHrID(ctx context.Context, hrID uint) ([]*domain.Position, error) {
	positions, err := u.positionRepo.GetByHrID(ctx, hrID)
	if err != nil {
		return nil, err
	}
	return positions, nil
}

func (u *PositionUseCase) Update(ctx context.Context, id uint, updateData *domain.Position) (*domain.Position, error) {
	// Get existing position
	existingPosition, err := u.positionRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("position not found")
		}
		return nil, err
	}

	// Update fields
	existingPosition.Name = updateData.Name
	existingPosition.HrID = updateData.HrID

	if err := u.positionRepo.Update(ctx, existingPosition); err != nil {
		return nil, err
	}

	return existingPosition, nil
}

func (u *PositionUseCase) Delete(ctx context.Context, id uint) error {
	// Check if position exists
	_, err := u.positionRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("position not found")
		}
		return err
	}

	return u.positionRepo.Delete(ctx, id)
}

func (u *PositionUseCase) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Position, error) {
	return u.positionRepo.List(ctx, filters)
}
