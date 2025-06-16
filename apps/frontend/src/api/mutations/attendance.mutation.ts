import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { attendanceService } from "@/services/attendance.service";
import {
	ClockInAttendanceRequest,
	ClockOutAttendanceRequest,
	Attendance,
} from "@/types/attendance.types";

import { queryKeys } from "../query-keys";

const handleAttendanceError = (error: unknown, action: string) => {
	console.error(`${action} error:`, error);
	let errorMessage = `${action} failed. Please try again.`;

	if (error instanceof AxiosError) {
		if (error.response?.status === 400) {
			errorMessage =
				error.response?.data?.message ||
				"Invalid request. Please check your information.";
		} else if (error.response?.status === 401) {
			errorMessage = "You are not authorized to perform this action.";
		} else if (error.response?.status === 404) {
			errorMessage = "Employee or work schedule not found.";
		} else if (error.response?.status === 409) {
			errorMessage =
				error.response?.data?.message ||
				"You have already performed this action today.";
		} else if (error.response?.status === 500) {
			errorMessage =
				error.response?.data?.message ||
				"Server error. Please contact support.";
		} else if (error.response?.data?.message) {
			errorMessage = error.response.data.message;
		} else if (error.message) {
			errorMessage = error.message;
		}
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}

	toast.error(`${action.toUpperCase()} ERROR: ${errorMessage}`, {
		duration: 8000,
		description:
			error instanceof AxiosError
				? `Status: ${error.response?.status}`
				: "Please try again or contact support",
	});
};

export const useClockIn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ClockInAttendanceRequest) =>
			attendanceService.clockIn(request),
		onSuccess: (data, variables) => {
			// Show success toast
			toast.success("Clock-in successful!", {
				description: `You have successfully clocked in at ${new Date().toLocaleTimeString()}`,
			});

			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
			// Also invalidate the specific employee's attendance queries
			if (variables.employee_id) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.attendance.byEmployee(
						variables.employee_id
					),
				});
			}
		},
		onError: (error) => {
			handleAttendanceError(error, "Clock-in");
		},
	});
};

export const useClockOut = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ClockOutAttendanceRequest) =>
			attendanceService.clockOut(request),
		onSuccess: (data, variables) => {
			// Show success toast
			toast.success("Clock-out successful!", {
				description: `You have successfully clocked out at ${new Date().toLocaleTimeString()}`,
			});

			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
			// Also invalidate the specific employee's attendance queries
			if (variables.employee_id) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.attendance.byEmployee(
						variables.employee_id
					),
				});
			}
		},
		onError: (error) => {
			handleAttendanceError(error, "Clock-out");
		},
	});
};

export const useCreateAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (attendance: Partial<Attendance>) =>
			attendanceService.createAttendance(attendance),
		onSuccess: () => {
			toast.success("Attendance record created successfully!");

			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
		},
		onError: (error) => {
			handleAttendanceError(error, "Create attendance");
		},
	});
};

export const useUpdateAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			attendance,
		}: {
			id: number;
			attendance: Partial<Attendance>;
		}) => attendanceService.updateAttendance(id, attendance),
		onSuccess: () => {
			toast.success("Attendance record updated successfully!");

			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
		},
		onError: (error) => {
			handleAttendanceError(error, "Update attendance");
		},
	});
};

export const useDeleteAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => attendanceService.deleteAttendance(id),
		onSuccess: () => {
			toast.success("Attendance record deleted successfully!");

			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
		},
		onError: (error) => {
			handleAttendanceError(error, "Delete attendance");
		},
	});
};
