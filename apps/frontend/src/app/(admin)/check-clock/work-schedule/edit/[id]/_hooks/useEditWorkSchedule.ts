import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

import { useUpdateWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { useLocations } from "@/api/queries/location.queries";
import { useWorkScheduleDetailForEdit } from "@/api/queries/work-schedule.queries";
import { workScheduleSchema } from "@/schemas/work-schedule.schema";
import { WorkSchedule } from "@/types/work-schedule.types";


export const useEditWorkSchedule = (id: number) => {
	const router = useRouter();
	const [validationErrors, setValidationErrors] = useState<
		Record<string, string>
	>({});

	// Queries and mutations - using the edit query instead of regular detail query
	const workScheduleQuery = useWorkScheduleDetailForEdit(id);
	const locationsQuery = useLocations({});
	const updateMutation = useUpdateWorkSchedule();

	// Get data
	const workSchedule = workScheduleQuery.data;
	const locations = locationsQuery.data?.data?.items || [];

	const clearValidationErrors = useCallback(() => {
		setValidationErrors({});
	}, []);

	// Handle form submission with validation
	const handleSubmit = useCallback(
		async (data: WorkSchedule, detailsToDelete: number[] = []) => {
			try {
				// Clear previous validation errors
				setValidationErrors({});

				const validatedData = workScheduleSchema.parse(data);

				// Create the payload with toDelete array
				const updatePayload = {
					...validatedData,
					toDelete: detailsToDelete
				};

				await updateMutation.mutateAsync({ id, data: updatePayload });
				toast.success("Work schedule successfully updated");

				router.push("/check-clock/work-schedule");
			} catch (error) {
				console.error("Update work schedule error:", error);

				if (error instanceof ZodError) {
					// Map Zod errors to form fields
					const fieldErrors: Record<string, string> = {};

					error.issues.forEach((issue) => {
						const fieldPath = issue.path.join(".");
						fieldErrors[fieldPath] = issue.message;
					});

					setValidationErrors(fieldErrors);
					toast.error("Please fix the validation errors below");
					return;
				}

				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to update work schedule";
				toast.error(errorMessage);
			}
		},
		[updateMutation, router, id]
	);

	const handleCancel = useCallback(() => {
		router.push("/check-clock/work-schedule");
	}, [router]);

	return {
		// Work schedule data
		workSchedule,
		isLoadingWorkSchedule: workScheduleQuery.isLoading,
		workScheduleError: workScheduleQuery.error,

		// Locations for form
		locations,
		isLoadingLocations: locationsQuery.isLoading,
		locationsError: locationsQuery.error,

		// Form submission with validation
		handleSubmit,
		isUpdating: updateMutation.isPending,
		validationErrors,
		clearValidationErrors,

		// Navigation
		handleCancel,

		// Query controls
		refetchWorkSchedule: workScheduleQuery.refetch,
		refetchLocations: locationsQuery.refetch,
	};
};
