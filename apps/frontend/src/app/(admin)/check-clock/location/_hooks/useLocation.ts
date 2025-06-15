import { useState, useCallback, useMemo } from "react";
import { useLocations } from "@/api/queries/location.queries";
import {
	useCreateLocation,
	useUpdateLocation,
	useDeleteLocation,
} from "@/api/mutations/location.mutation";
import { toast } from "sonner";
import { CreateLocationRequest, UpdateLocationRequest } from "@/types/location";
import { Location } from "@/types/location";

interface FilterOptions {
	name?: string;
	address_detail?: string;
	radius_range?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
}

export const useLocation = (initialPage = 1, initialPageSize = 10) => {
	// State management
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);
	const [filters, setFilters] = useState<FilterOptions>({});
	const [isFilterVisible, setIsFilterVisible] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<Location>>({});
	const [isEditing, setIsEditing] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [locationToDelete, setLocationToDelete] = useState<Location | null>(
		null
	);

	// Build params for API call
	const params = {
		page,
		page_size: pageSize,
		...filters,
	};

	// Queries and mutations
	const locationsQuery = useLocations(params);
	const createMutation = useCreateLocation();
	const updateMutation = useUpdateLocation();
	const deleteMutation = useDeleteLocation();

	// Extract data from server response
	const locationData = locationsQuery.data?.data;
	const serverLocations = locationData?.items || [];

	// Apply client-side filtering and sorting for fields not handled by backend
	const processedLocations = useMemo(() => {
		let filteredLocations = [...serverLocations];

		// Apply radius range filter (client-side)
		if (filters.radius_range && filters.radius_range !== "all") {
			filteredLocations = filteredLocations.filter((location) => {
				const radius = location.radius_m;
				switch (filters.radius_range) {
					case "0":
						return radius === 0;
					case "<100":
						return radius > 0 && radius < 100;
					case "100-500":
						return radius >= 100 && radius <= 500;
					case ">500":
						return radius > 500;
					default:
						return true;
				}
			});
		}

		// Apply sorting (client-side)
		if (filters.sort_by && filters.sort_order) {
			filteredLocations.sort((a, b) => {
				let aValue: string | number = a[
					filters.sort_by as keyof Location
				] as string | number;
				let bValue: string | number = b[
					filters.sort_by as keyof Location
				] as string | number;

				// Handle string comparison for name
				if (filters.sort_by === "name") {
					aValue = (aValue || "").toString().toLowerCase();
					bValue = (bValue || "").toString().toLowerCase();
				}

				// Handle numeric comparison for radius
				if (filters.sort_by === "radius_m") {
					aValue = Number(aValue) || 0;
					bValue = Number(bValue) || 0;
				}

				if (aValue < bValue)
					return filters.sort_order === "asc" ? -1 : 1;
				if (aValue > bValue)
					return filters.sort_order === "asc" ? 1 : -1;
				return 0;
			});
		}

		return filteredLocations;
	}, [serverLocations, filters]);

	const locations = processedLocations;

	// Create pagination result from server response
	const paginationInfo = locationData?.pagination;
	const pagination = {
		totalItems: paginationInfo?.total_items || 0,
		totalPages: paginationInfo?.total_pages || 0,
		currentPage: paginationInfo?.current_page || 1,
		pageSize: paginationInfo?.page_size || 10,
		hasNextPage: paginationInfo?.has_next_page || false,
		hasPrevPage: paginationInfo?.has_prev_page || false,
		items: locations,
	};

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
	}, [locationToDelete, deleteMutation, handleCloseDeleteDialog]);

	// Filter handlers following Check-Clock Employee pattern
	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	const applyFilters = (newFilters: FilterOptions) => {
		setFilters(newFilters);
		setPage(1); // Reset to first page when applying filters
	};
	const resetFilters = () => {
		setFilters({});
		setPage(1);
	};

	const handleApplyFilters = (newFilters: FilterOptions) => {
		setFilters(newFilters);
		setPage(1); // Reset to first page when applying filters
	};

	const handleResetFilters = () => {
		setFilters({});
		setPage(1);
	};

	const handleToggleFilterVisibility = () => {
		setIsFilterVisible((prev) => !prev);
	};

	return {
		// Data with normalized pagination
		locations,
		pagination,
		page,
		setPage: handlePageChange,
		pageSize,
		setPageSize: handlePageSizeChange,
		isLoading: locationsQuery.isLoading,
		isError: locationsQuery.isError,
		error: locationsQuery.error,
		// Filter state and handlers following Check-Clock Employee pattern
		filters,
		isFilterVisible,
		applyFilters,
		resetFilters,
		handleApplyFilters,
		handleResetFilters,
		handleToggleFilterVisibility,

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
