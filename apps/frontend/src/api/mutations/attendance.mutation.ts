import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { queryKeys } from "../query-keys";
import {
	ClockInAttendanceRequest,
	ClockOutAttendanceRequest,
	Attendance,
} from "@/types/attendance";

export const useClockIn = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ClockInAttendanceRequest) =>
			attendanceService.clockIn(request),
		onSuccess: (data, variables) => {
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
	});
};

export const useClockOut = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ClockOutAttendanceRequest) =>
			attendanceService.clockOut(request),
		onSuccess: (data, variables) => {
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
	});
};

export const useCreateAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (attendance: Partial<Attendance>) =>
			attendanceService.createAttendance(attendance),
		onSuccess: () => {
			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
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
			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
		},
	});
};

export const useDeleteAttendance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => attendanceService.deleteAttendance(id),
		onSuccess: () => {
			// Invalidate and refetch attendance queries
			queryClient.invalidateQueries({
				queryKey: queryKeys.attendance.all,
			});
		},
	});
};
