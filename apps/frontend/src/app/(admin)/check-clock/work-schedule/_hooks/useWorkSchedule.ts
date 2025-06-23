import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { useDeleteWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
import { WorkSchedule } from "@/types/work-schedule.types";

export const useWorkSchedule = (page = 1, pageSize = 10) => {
	const router = useRouter();

	// State management
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [
		workScheduleToDelete,
		setWorkScheduleToDelete,
	] = useState<WorkSchedule | null>(null);
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [viewedSchedule, setViewedSchedule] = useState<WorkSchedule | null>(
		null
	);

	// Queries and mutations
	const workSchedulesQuery = useWorkSchedules(page, pageSize);
	const deleteMutation = useDeleteWorkSchedule();

	// Sort work schedules by ID
	const sortedWorkSchedules = workSchedulesQuery.data?.items
		? [...workSchedulesQuery.data.items].sort((a, b) => {
				const idA = a.id || 0;
				const idB = b.id || 0;
				return idA - idB;
		  })
		: [];

	const paginationInfo = workSchedulesQuery.data?.pagination;
	const pagination = {
		totalItems: paginationInfo?.total_items || 0,
		totalPages: paginationInfo?.total_pages || 0,
		currentPage: paginationInfo?.current_page || 1,
		pageSize: paginationInfo?.page_size || 10,
		hasNextPage: paginationInfo?.has_next_page || false,
		hasPrevPage: paginationInfo?.has_prev_page || false,
		items: sortedWorkSchedules,
	};

	// Delete dialog handlers
	const handleOpenDeleteDialog = useCallback((workSchedule: WorkSchedule) => {
		setWorkScheduleToDelete(workSchedule);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleCloseDeleteDialog = useCallback(() => {
		setIsDeleteDialogOpen(false);
		setWorkScheduleToDelete(null);
	}, []);

	// View dialog handlers
	const handleOpenViewDialog = useCallback((workSchedule: WorkSchedule) => {
		setViewedSchedule(workSchedule);
		setViewDialogOpen(true);
	}, []);

	const handleCloseViewDialog = useCallback(() => {
		setViewDialogOpen(false);
		setViewedSchedule(null);
	}, []);

	// Navigation handlers
	const handleEdit = useCallback(
		(schedule: WorkSchedule) => {
			if (schedule.id) {
				router.push(`/check-clock/work-schedule/edit/${schedule.id}`);
			}
		},
		[router]
	);

	const handleRowClick = useCallback(
		(row: { original: WorkSchedule }) => {
			const workSchedule = row.original;
			if (workSchedule.id) {
				router.push(
					`/check-clock/work-schedule/edit/${workSchedule.id}`
				);
			}
		},
		[router]
	);

	// Delete work schedule
	const handleConfirmDelete = useCallback(async () => {
		if (!workScheduleToDelete?.id) return;

		try {
			await deleteMutation.mutateAsync(workScheduleToDelete.id);
			toast.success("Work schedule successfully deleted");
			handleCloseDeleteDialog();
		} catch (error) {
			console.error("Delete work schedule error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to delete work schedule";
			toast.error(errorMessage);
		}
	}, [workScheduleToDelete, deleteMutation, handleCloseDeleteDialog]);

	return {
		// Data with normalized pagination
		workSchedules: sortedWorkSchedules,
		pagination,
		isLoading: workSchedulesQuery.isLoading,
		isError: workSchedulesQuery.isError,
		error: workSchedulesQuery.error,

		// Dialog state
		isDeleteDialogOpen,
		workScheduleToDelete,
		viewDialogOpen,
		viewedSchedule,

		// Handlers
		handleOpenDeleteDialog,
		handleCloseDeleteDialog,
		handleOpenViewDialog,
		handleCloseViewDialog,
		handleConfirmDelete,
		handleEdit,
		handleRowClick,

		// Query controls
		refetch: workSchedulesQuery.refetch,
	};
};
