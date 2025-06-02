package branch

import (
	"context"
	"errors"

	"github.com/SukaMajuu/hris/apps/backend/domain"
	"github.com/SukaMajuu/hris/apps/backend/domain/interfaces"
	"gorm.io/gorm"
)

type BranchUseCase struct {
	branchRepo interfaces.BranchRepository
}

func NewBranchUseCase(branchRepo interfaces.BranchRepository) *BranchUseCase {
	return &BranchUseCase{
		branchRepo: branchRepo,
	}
}

func (u *BranchUseCase) Create(ctx context.Context, branch *domain.Branch) (*domain.Branch, error) {
	if err := u.branchRepo.Create(ctx, branch); err != nil {
		return nil, err
	}
	return branch, nil
}

func (u *BranchUseCase) GetByID(ctx context.Context, id uint) (*domain.Branch, error) {
	branch, err := u.branchRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("branch not found")
		}
		return nil, err
	}
	return branch, nil
}

func (u *BranchUseCase) GetByHrID(ctx context.Context, hrID uint) ([]*domain.Branch, error) {
	branches, err := u.branchRepo.GetByHrID(ctx, hrID)
	if err != nil {
		return nil, err
	}
	return branches, nil
}

func (u *BranchUseCase) Update(ctx context.Context, id uint, updateData *domain.Branch) (*domain.Branch, error) {
	// Get existing branch
	existingBranch, err := u.branchRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("branch not found")
		}
		return nil, err
	}

	// Update fields
	existingBranch.Name = updateData.Name
	existingBranch.HrID = updateData.HrID

	if err := u.branchRepo.Update(ctx, existingBranch); err != nil {
		return nil, err
	}

	return existingBranch, nil
}

func (u *BranchUseCase) Delete(ctx context.Context, id uint) error {
	// Check if branch exists
	_, err := u.branchRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("branch not found")
		}
		return err
	}

	return u.branchRepo.Delete(ctx, id)
}

func (u *BranchUseCase) List(ctx context.Context, filters map[string]interface{}) ([]*domain.Branch, error) {
	return u.branchRepo.List(ctx, filters)
}
