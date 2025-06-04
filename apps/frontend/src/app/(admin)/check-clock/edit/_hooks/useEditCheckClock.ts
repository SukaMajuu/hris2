import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
import { useCheckclockSettingsById } from "@/api/queries/checkclock-settings.queries";
import { useUpdateCheckclockSettings } from "@/api/mutations/checkclock-settings.mutation";
import type { CheckclockSettingsInput } from "@/schemas/checkclock.schema";

export function useEditCheckClockForm(id: string) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// API queries
	const employeesQuery = useEmployeesQuery(1, 100, {employment_status: false}); // Get all employees
	const workSchedulesQuery = useWorkSchedules(1, 100); // Get all work schedules
	const checkclockQuery = useCheckclockSettingsById(id); // Get specific checkclock settings
	const updateMutation = useUpdateCheckclockSettings();

	// Extract data from queries
	const employees = employeesQuery.data?.data?.items || [];
	const workSchedules = workSchedulesQuery.data?.items || [];
	const isDataLoading =
		employeesQuery.isLoading ||
		workSchedulesQuery.isLoading ||
		checkclockQuery.isLoading;

	// Convert API response to form data
	const initialData: CheckclockSettingsInput | null = checkclockQuery.data
		?.data
		? {
				id: checkclockQuery.data.data.id,
				employee_id: checkclockQuery.data.data.employee_id,
				work_schedule_id: checkclockQuery.data.data.work_schedule_id,
		  }
		: null;

	// Handle form submission
	const handleSubmit = useCallback(
		async (data: CheckclockSettingsInput) => {
			setIsLoading(true);
			try {
				console.log("Updating check-clock settings:", data);

				// Convert to the format expected by the API
				const apiData = {
					employee_id: data.employee_id,
					work_schedule_id: data.work_schedule_id,
				};

				await updateMutation.mutateAsync({
					id: id,
					payload: apiData,
				});				toast.success("Check clock settings updated successfully");

				setTimeout(() => {
					router.push("/check-clock");
				}, 2000);
			} catch (error) {
				console.error("Error updating data:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to update check clock settings. Please try again.";				toast.error(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[id, router, updateMutation]
	);

	return {
		employees,
		workSchedules,
		initialData,
		isLoading,
		isDataLoading,
		handleSubmit,
		// Expose query controls for potential refetching
		refetchEmployees: employeesQuery.refetch,
		refetchWorkSchedules: workSchedulesQuery.refetch,
		refetchCheckclockSettings: checkclockQuery.refetch,
	};
}
