import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WorkSchedule, WorkScheduleDetailItem, CreateWorkScheduleRequest } from "@/types/work-schedule.types";
import { useWorkSchedules, useWorkScheduleDetail } from "@/api/queries/work-schedule.queries";
import { useCreateWorkSchedule, useUpdateWorkSchedule, useDeleteWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { useWorkScheduleStore } from "@/stores/work-schedule.store";
import { toast } from "@/components/ui/use-toast";

/**
 * Type for flattened work schedule detail rows - this might still be useful for UI
 * Ensure this aligns with WorkScheduleDetailItem and how forms might use it.
 */
export type WorkScheduleDetailRow = WorkScheduleDetailItem & {
    // If you need to associate with a parent schedule's temporary ID or name in a form context:
    // parentId?: number; 
    // parentName?: string;
};

/**
 * Hook for fetching work schedules list with pagination
 * This encapsulates the query logic and store management
 */
export function useWorkSchedulesList(page: number, pageSize: number) {
    const { setWorkSchedules } = useWorkScheduleStore();

    const queryResult = useWorkSchedules(page, pageSize);

    // Update store when data changes
    React.useEffect(() => {
        if (queryResult.data?.items) {
            setWorkSchedules(queryResult.data.items);
        }
    }, [queryResult.data, setWorkSchedules]);

    return {
        ...queryResult,
        workSchedules: queryResult.data?.items || [],
        totalItems: queryResult.data?.pagination?.total_items || 0,
        totalPages: queryResult.data?.pagination?.total_pages || 0,
        currentPage: queryResult.data?.pagination?.current_page || 1,
        pageSize: queryResult.data?.pagination?.page_size || 10,
        hasNextPage: queryResult.data?.pagination?.has_next_page || false,
        hasPrevPage: queryResult.data?.pagination?.has_prev_page || false,
    };
}

/**
 * Hook for managing work schedule dialog states and navigation
 * This handles UI state that doesn't require external data
 */
export function useWorkSchedule() {
    const router = useRouter();
    const { workSchedules, setWorkSchedules } = useWorkScheduleStore();

    // State for dialog management
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [workScheduleToDelete, setWorkScheduleToDelete] = useState<WorkSchedule | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewedSchedule, setViewedSchedule] = useState<WorkSchedule | null>(null);

    // Delete action handlers
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
    const handleEditNavigation = useCallback((id: number) => {
        router.push(`/check-clock/work-schedule/edit/${id}`);
    }, [router]);

    const handleAddNavigation = useCallback(() => {
        router.push(`/check-clock/work-schedule/add`);
    }, [router]);

    const handleBackToList = useCallback(() => {
        router.push(`/check-clock/work-schedule`);
    }, [router]);

    return {
        // Store data
        workSchedules,
        setWorkSchedules,

        // Dialog states
        isDeleteDialogOpen,
        workScheduleToDelete,
        viewDialogOpen,
        viewedSchedule,

        // Dialog handlers
        handleOpenDeleteDialog,
        handleCloseDeleteDialog,
        handleOpenViewDialog,
        handleCloseViewDialog,

        // Navigation handlers
        handleEditNavigation,
        handleAddNavigation,
        handleBackToList,
    };
}

/**
 * Hook for managing work schedule detail (for edit page)
 */
export function useWorkScheduleDetailData(id: number) {
    const queryResult = useWorkScheduleDetail(id);

    return {
        ...queryResult,
        workSchedule: queryResult.data,
    };
}

/**
 * Hook for work schedule mutations (create, update, delete)
 */
export function useWorkScheduleMutations() {
    const router = useRouter();
    const createMutation = useCreateWorkSchedule();
    const updateMutation = useUpdateWorkSchedule();
    const deleteMutation = useDeleteWorkSchedule();    // Create work schedule
    const handleCreate = useCallback(async (data: CreateWorkScheduleRequest) => {
        try {
            await createMutation.mutateAsync(data);
            toast({
                title: "Success",
                description: "Work schedule successfully created",
                duration: 2000,
            });
            setTimeout(() => {
                router.push("/check-clock/work-schedule");
            }, 2000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to create work schedule";
            toast({
                title: "Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 3000,
            });
            throw error;
        }
    }, [createMutation, router]);

    // Update work schedule
    const handleUpdate = useCallback(async (id: number, data: CreateWorkScheduleRequest) => {
        try {
            await updateMutation.mutateAsync({ id, data });
            toast({
                title: "Success",
                description: "Work schedule successfully updated",
                duration: 2000,
            });
            setTimeout(() => {
                router.push("/check-clock/work-schedule");
            }, 2000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to update work schedule";
            toast({
                title: "Failed",
                description: errorMessage,
                variant: "destructive",
                duration: 3000,
            });
            throw error;
        }
    }, [updateMutation, router]);

    // Delete work schedule
    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast({
                title: "Success",
                description: "Work schedule successfully deleted",
                duration: 2000,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to delete work schedule";
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
 * Comprehensive hook that combines all work schedule operations
 * This is the main hook that pages should use - it includes:
 * - List functionality with pagination
 * - Dialog management
 * - Navigation
 * - Mutations
 * - Store management
 */
export function useWorkScheduleOperations(page: number, pageSize: number) {
    // Get list data and pagination info
    const listHook = useWorkSchedulesList(page, pageSize);

    // Get dialog and navigation handlers
    const dialogHook = useWorkSchedule();

    // Get mutation handlers
    const mutationHook = useWorkScheduleMutations();

    return {
        // List data
        ...listHook,

        // Dialog management
        isDeleteDialogOpen: dialogHook.isDeleteDialogOpen,
        workScheduleToDelete: dialogHook.workScheduleToDelete,
        viewDialogOpen: dialogHook.viewDialogOpen,
        viewedSchedule: dialogHook.viewedSchedule,
        handleOpenDeleteDialog: dialogHook.handleOpenDeleteDialog,
        handleCloseDeleteDialog: dialogHook.handleCloseDeleteDialog,
        handleOpenViewDialog: dialogHook.handleOpenViewDialog,
        handleCloseViewDialog: dialogHook.handleCloseViewDialog,

        // Navigation
        handleEditNavigation: dialogHook.handleEditNavigation,
        handleAddNavigation: dialogHook.handleAddNavigation,
        handleBackToList: dialogHook.handleBackToList,

        // Mutations
        isCreating: mutationHook.isCreating,
        isUpdating: mutationHook.isUpdating,
        isDeleting: mutationHook.isDeleting,
        handleCreate: mutationHook.handleCreate,
        handleUpdate: mutationHook.handleUpdate,
        handleDelete: mutationHook.handleDelete,
    };
}
