import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useEmployeesQuery } from "@/api/queries/employee.queries";
import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
import { useCreateCheckclockSettings } from "@/api/mutations/checkclock-settings.mutation";
import type { CheckclockSettingsInput } from "@/schemas/checkclock.schema";

export function useAddCheckClockForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// API queries
	const employeesQuery = useEmployeesQuery(1, 100, {});
	const workSchedulesQuery = useWorkSchedules(1, 100);
	const createMutation = useCreateCheckclockSettings();

	// Extract data from queries
	const employees = employeesQuery.data?.data?.items || [];
	const workSchedules = workSchedulesQuery.data?.items || [];
	const isDataLoading =
		employeesQuery.isLoading || workSchedulesQuery.isLoading;

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

				toast({
					title: "Success",
					description: "Check clock settings added successfully",
					duration: 2000,
				});

				setTimeout(() => {
					router.push("/check-clock");
				}, 2000);
			} catch (error) {
				console.error("Error saving data:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to save check clock settings. Please try again.";

				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[router, createMutation]
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
	};
}
