import { useState, useCallback } from "react";
import { useLocations } from "@/api/queries/location.queries";
import {
	useCreateLocation,
	useUpdateLocation,
	useDeleteLocation,
} from "@/api/mutations/location.mutation";
import { toast } from "sonner";
import { CreateLocationRequest, UpdateLocationRequest } from "@/types/location";
import { Location } from "@/types/location";
import { calculatePaginationResult, PaginationResult } from "@/lib/pagination";

export const useLocation = (page = 1, pageSize = 10) => {
	// State management
	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<Location>>({});
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [locationToDelete, setLocationToDelete] = useState<Location | null>(
		null
	);

	// Queries and mutations
	const locationsQuery = useLocations({ page, page_size: pageSize });
	const createMutation = useCreateLocation();
	const updateMutation = useUpdateLocation();
	const deleteMutation = useDeleteLocation();

	// Transform server pagination data using utility function
	const paginationResult: PaginationResult<Location> = locationsQuery.data
		?.data
		? calculatePaginationResult<Location>(
				locationsQuery.data.data.pagination,
				"items"
		  )
		: {
				totalItems: 0,
				totalPages: 0,
				currentPage: 1,
				pageSize: 10,
				hasNextPage: false,
				hasPrevPage: false,
				items: [],
		  };

	// Override items with actual location data
	if (locationsQuery.data?.data?.items) {
		paginationResult.items = locationsQuery.data.data.items;
	}

	// Form handlers
	const handleChange = useCallback(
		(key: string | number | symbol, value: string | number) => {
			setFormData((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const handleMapPositionChange = useCallback((lat: number, lng: number) => {
		setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
	}, []);

	// Dialog handlers
	const handleOpenAddDialog = useCallback(() => {
		setFormData({ radius_m: 100 });
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

	// Save location (create or update)
	const handleSaveLocation = useCallback(async () => {
		try {
			if (isEditing && formData.id) {
				// Update existing location
				const updateData: UpdateLocationRequest = {
					name: formData.name!,
					address_detail: formData.address_detail!,
					latitude: formData.latitude!,
					longitude: formData.longitude!,
					radius_m: Number(formData.radius_m),
				};
				await updateMutation.mutateAsync({
					id: formData.id.toString(),
					payload: updateData,
				});
				toast.success("Location successfully updated");
			} else {
				// Create new location
				const createData: CreateLocationRequest = {
					name: formData.name!,
					address_detail: formData.address_detail!,
					latitude: formData.latitude!,
					longitude: formData.longitude!,
					radius_m: Number(formData.radius_m),
				};
				await createMutation.mutateAsync(createData);
				toast.success("Location successfully created");
			}

			setDialogOpen(false);
			setFormData({});
		} catch (error) {
			console.error("Save location error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to save location";
			toast.error(errorMessage);
		}
	}, [formData, isEditing, createMutation, updateMutation]);

	// Delete location
	const handleConfirmDelete = useCallback(async () => {
		if (!locationToDelete) return;

		try {
			await deleteMutation.mutateAsync(locationToDelete.id.toString());
			toast.success("Location successfully deleted");
			handleCloseDeleteDialog();
		} catch (error) {
			console.error("Delete location error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to delete location";
			toast.error(errorMessage);
		}
	}, [locationToDelete, deleteMutation]);

	return {
		// Data with normalized pagination
		locations: paginationResult.items,
		pagination: paginationResult,
		isLoading: locationsQuery.isLoading,
		isError: locationsQuery.isError,
		error: locationsQuery.error,

		// Form state
		dialogOpen,
		setDialogOpen,
		formData,
		setFormData,
		isEditing,
		isDeleteDialogOpen,
		locationToDelete,

		// Loading states
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,

		// Handlers
		handleChange,
		handleMapPositionChange,
		handleOpenAddDialog,
		handleOpenEditDialog,
		handleOpenDeleteDialog,
		handleCloseDeleteDialog,
		handleSaveLocation,
		handleConfirmDelete,

		// Query controls
		refetch: locationsQuery.refetch,
	};
};
