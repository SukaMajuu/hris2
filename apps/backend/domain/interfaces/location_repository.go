package interfaces

import (
    "context"

    "github.com/SukaMajuu/hris/apps/backend/domain"
)

type LocationRepository interface {
    // Create creates a new location
    CreateLocation(ctx context.Context, location *domain.Location) error

    // Read operations
    GetAllLocations(ctx context.Context) ([]*domain.Location, error)

    // Update updates an existing location
    // UpdateLocation(ctx context.Context, id string, location *domain.Location) error

    // Delete removes a location
    // DeleteLocation(ctx context.Context, id string) error
}