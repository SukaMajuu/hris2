import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { WorkSchedule, WorkScheduleDetailItem } from "@/types/work-schedule.types";
import { workScheduleService } from "@/services/work-schedule.service";

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
 * Hook to manage work schedule data, focusing on a single schedule for forms (add/edit).
 * List management should be handled by React Query hooks like useWorkSchedules.
 */
export function useWorkSchedule(scheduleId?: number) {
    const router = useRouter();
    // State for managing a single work schedule, e.g., for an edit form
    const [currentSchedule, setCurrentSchedule] = useState<Partial<WorkSchedule> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // If an ID is provided, fetch the schedule for editing
    useEffect(() => {
        if (scheduleId) {
            setIsLoading(true);
            workScheduleService.getById(scheduleId)
                .then(data => {
                    setCurrentSchedule(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err);
                    setIsLoading(false);
                    console.error("Failed to fetch work schedule by ID", err);
                });
        }
    }, [scheduleId]);


    /**
     * Menangani event edit jadwal kerja - navigation part
     * The actual data fetching for edit page should use useWorkScheduleDetail query or similar.
     */
    const handleEditNavigation = (id: number) => {
        router.push(`/check-clock/work-schedule/edit/${id}`);
    };

    // Function to save (create or update) a work schedule
    const handleSaveWorkSchedule = useCallback(async (data: Partial<WorkSchedule>) => {
        setIsLoading(true);
        setError(null);
        try {
            let savedData;
            if (data.id) {
                // Update existing work schedule
                savedData = await workScheduleService.update(data.id, data);
            } else {
                // Create new work schedule
                // Ensure all required fields for creation are present in 'data'
                savedData = await workScheduleService.create(data);
            }
            setCurrentSchedule(savedData); // Optionally update local state
            setIsLoading(false);
            return { success: true, id: savedData.id };
        } catch (e) {
            const err = e instanceof Error ? e : new Error("Failed to save work schedule");
            setError(err);
            setIsLoading(false);
            console.error(err);
            return { success: false, error: err.message };
        }
    }, []);

    return {
        currentSchedule,
        setCurrentSchedule, // To allow form to update it
        isLoading,
        error,
        handleEditNavigation, // Renamed to avoid confusion with data editing
        handleSaveWorkSchedule,
    };
}
