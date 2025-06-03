import { useState, useCallback } from "react";
import { useLocations, useLocationDetail } from "@/api/queries/location.queries";
import { useCreateLocation, useUpdateLocation, useDeleteLocation } from "@/api/mutations/location.mutation";
import { toast } from "@/components/ui/use-toast";
import { LocationResponse, CreateLocationRequest, UpdateLocationRequest } from "@/types/location";

export interface Location {
  id: number;
  locationName: string;
  addressDetails: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

function mapLocationResponseToLocation(loc: LocationResponse): Location {
  return {
    id: loc.id,
    locationName: loc.name,
    addressDetails: loc.address_detail,
    latitude: loc.latitude,
    longitude: loc.longitude,
    radius: loc.radius_m,
  };
}

/**
 * Hook for fetching locations list
 * This encapsulates the query logic
 */
export function useLocationsList(page = 1, pageSize = 10) {
  const queryResult = useLocations({ page, page_size: pageSize });

  const locations: Location[] =
    queryResult.data && queryResult.data.data && queryResult.data.data.items && Array.isArray(queryResult.data.data.items)
      ? queryResult.data.data.items.map(mapLocationResponseToLocation)
      : [];

  const pagination = queryResult.data?.data?.pagination || {
    total_items: 0,
    total_pages: 0,
    current_page: 1,
    page_size: 10,
    has_next_page: false,
    has_prev_page: false,
  };

  return {
    ...queryResult,
    locations,
    pagination,
  };
}

/**
 * Hook for managing location detail (if needed for edit)
 */
export function useLocationDetailData(id: string) {
  const queryResult = useLocationDetail(id);
  return {
    ...queryResult,
    location: queryResult.data?.data ? mapLocationResponseToLocation(queryResult.data.data) : null,
  };
}

/**
 * Hook for location mutations (create, update, delete)
 */
export function useLocationMutations() {
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  // Create location
  const handleCreate = useCallback(async (data: CreateLocationRequest) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: "Success",
        description: "Location successfully created",
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create location";
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  }, [createMutation]);

  // Update location
  const handleUpdate = useCallback(async (id: string, data: UpdateLocationRequest) => {
    try {
      await updateMutation.mutateAsync({ id, payload: data });
      toast({
        title: "Success",
        description: "Location successfully updated",
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update location";
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  }, [updateMutation]);

  // Delete location
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Location successfully deleted",
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete location";
      toast({
        title: "Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  }, [deleteMutation]);

  return {
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Mutation handlers
    handleCreate,
    handleUpdate,
    handleDelete,

    // Raw mutations (if needed for advanced usage)
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

/**
 * Hook for managing location dialog states and form
 * This handles UI state that doesn't require external data
 */
export function useLocationDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const handleChange = useCallback(
    (key: keyof Location, value: string | number) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleMapPositionChange = useCallback((lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  }, []);

  const handleOpenAddDialog = useCallback(() => {
    setFormData({ radius: 100 });
    setIsEditing(false);
    setDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((data: Location) => {
    setFormData(data);
    setIsEditing(true);
    setDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((location: Location) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setLocationToDelete(null);
  }, []);

  return {
    // Dialog states
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    isEditing,
    isDeleteDialogOpen,
    locationToDelete,

    // Form handlers
    handleChange,
    handleMapPositionChange,

    // Dialog handlers
    handleOpenAddDialog,
    handleOpenEditDialog,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
  };
}

/**
 * Comprehensive hook that combines all location operations
 * This is the main hook that pages should use
 */
export function useLocationOperations(page = 1, pageSize = 10) {
  // Get list data with pagination
  const listHook = useLocationsList(page, pageSize);

  // Get dialog management
  const dialogHook = useLocationDialog();

  // Get mutation handlers
  const mutationHook = useLocationMutations();

  // Combined save handler that uses both edit state and mutations
  const handleSaveLocation = useCallback(async () => {
    const { formData, isEditing, setDialogOpen, setFormData } = dialogHook;
    const { handleCreate, handleUpdate } = mutationHook;

    try {
      if (isEditing && formData.id) {
        const updateData: UpdateLocationRequest = {
          name: formData.locationName!,
          address_detail: formData.addressDetails!,
          latitude: formData.latitude!,
          longitude: formData.longitude!,
          radius_m: Number(formData.radius),
        };
        await handleUpdate(formData.id.toString(), updateData);
      } else {
        const createData: CreateLocationRequest = {
          name: formData.locationName!,
          address_detail: formData.addressDetails!,
          latitude: formData.latitude!,
          longitude: formData.longitude!,
          radius_m: Number(formData.radius),
        };
        await handleCreate(createData);
      }

      setDialogOpen(false);
      setFormData({});
    } catch (error) {
      // Error handling is done in mutations
      console.error("Save failed:", error);
    }
  }, [dialogHook, mutationHook]);

  // Combined delete handler
  const handleConfirmDelete = useCallback(async () => {
    const { locationToDelete, handleCloseDeleteDialog } = dialogHook;
    const { handleDelete } = mutationHook;

    if (locationToDelete) {
      try {
        await handleDelete(locationToDelete.id.toString());
        handleCloseDeleteDialog();
      } catch (error) {
        // Error handling is done in mutations
        console.error("Delete failed:", error);
      }
    }
  }, [dialogHook, mutationHook]);

  return {
    // List data
    ...listHook,

    // Dialog management
    ...dialogHook,

    // Mutations
    ...mutationHook,

    // Combined handlers
    handleSaveLocation,
    handleConfirmDelete,
  };
}

/**
 * Legacy hook for backward compatibility
 * @deprecated Use useLocationOperations instead
 */
export function useLocation() {
  return useLocationOperations();
}
