import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEmployeeDetailQuery } from "@/api/queries/employee.queries";
import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
import { useUpdateEmployee } from "@/api/mutations/employee.mutations";

export function useAssignWorkSchedule(employeeId: string) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	// API queries
	const employeeQuery = useEmployeeDetailQuery(
		parseInt(employeeId),
		!!employeeId
	);
	const workSchedulesQuery = useWorkSchedules(1, 100); // Get all work schedules
	const updateEmployeeMutation = useUpdateEmployee();

	// Extract data from queries
	const employee = employeeQuery.data || null;
	const workSchedules = workSchedulesQuery.data?.items || [];
	const isDataLoading =
		employeeQuery.isLoading || workSchedulesQuery.isLoading;

	// Current assignment data
	const currentAssignment = employee
		? {
				employee_id: employee.id,
				work_schedule_id: employee.work_schedule_id || undefined,
		  }
		: null;

	// Handle form submission
	const handleSubmit = useCallback(
		async (data: { employee_id: number; work_schedule_id: number }) => {
			if (!employee) {
				toast.error("Employee data not found");
				return;
			}

			setIsLoading(true);
			try {
				await updateEmployeeMutation.mutateAsync({
					id: employee.id,
					data: {
						work_schedule_id: data.work_schedule_id,
					},
				});

				toast.success("Work schedule assigned successfully");

				router.push("/check-clock");
			} catch (error) {
				console.error("Error assigning work schedule:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Failed to assign work schedule. Please try again.";
				toast.error(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[employee, router, updateEmployeeMutation]
	);

	return {
		employee,
		workSchedules,
		currentAssignment,
		isLoading,
		isDataLoading,
		handleSubmit,
		// Expose query controls for potential refetching
		refetchEmployee: employeeQuery.refetch,
		refetchWorkSchedules: workSchedulesQuery.refetch,
	};
}
