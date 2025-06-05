import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
import { useCheckclockSettings } from "@/api/queries/checkclock-settings.queries";
import { useCreateCheckclockSettings } from "@/api/mutations/checkclock-settings.mutation";
import type { CheckclockSettingsInput } from "@/schemas/checkclock.schema";

export function useAddCheckClockForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	// API queries - Only fetch active employees
	const employeesQuery = useEmployeesQuery(1, 100, { employment_status: true });
	const workSchedulesQuery = useWorkSchedules(1, 100);
	const checkclockSettingsQuery = useCheckclockSettings();
	const createMutation = useCreateCheckclockSettings();
	// Extract data from queries
	const allEmployees = employeesQuery.data?.data?.items || [];
	const workSchedules = workSchedulesQuery.data?.items || [];
	const existingSettings = checkclockSettingsQuery.data?.data?.items || [];
	// Filter out employees who already have check-clock settings or are inactive
	const employees = useMemo(() => {
		const existingEmployeeIds = new Set(
			existingSettings.map((setting: any) => setting.employee_id)
		);
		return allEmployees.filter((employee: any) => 
			!existingEmployeeIds.has(employee.id) && 
			employee.employment_status === true
		);
	}, [allEmployees, existingSettings]);
	const isDataLoading =
		employeesQuery.isLoading || 
		workSchedulesQuery.isLoading || 
		checkclockSettingsQuery.isLoading;

	// Handle form submission
	const handleSubmit = useCallback(
		async (data: CheckclockSettingsInput) => {
			setIsLoading(true);
			try {
				console.log("Saving check-clock settings:", data);

				// Convert to the format expected by the API
				const apiData = {
					employee_id: data.employee_id,
					work_schedule_id: data.work_schedule_id,
				};

				await createMutation.mutateAsync(apiData);

				// Refresh the check-clock settings to update the filtered employee list
				await checkclockSettingsQuery.refetch();				toast.success("Check clock settings added successfully");

				setTimeout(() => {
					router.push("/check-clock");
				}, 2000);
			} catch (error) {
				console.error("Error saving data:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to save check clock settings. Please try again.";				toast.error(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[router, createMutation, checkclockSettingsQuery]
	);
	return {
		employees,
		workSchedules,
		isLoading,
		isDataLoading,
		handleSubmit,
		// Expose query controls for potential refetching
		refetchEmployees: employeesQuery.refetch,
		refetchWorkSchedules: workSchedulesQuery.refetch,
		refetchCheckclockSettings: checkclockSettingsQuery.refetch,
	};
}
