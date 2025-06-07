import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { attendanceService } from "@/services/attendance.service";

export const useAttendances = () => {
	return useQuery({
		queryKey: queryKeys.attendance.list(),
		queryFn: () => attendanceService.getAttendances(),
	});
};

export const useAttendanceById = (id: number) => {
	return useQuery({
		queryKey: queryKeys.attendance.detail(id),
		queryFn: () => attendanceService.getAttendanceById(id),
		enabled: !!id,
	});
};

export const useAttendancesByEmployee = (employeeId: number) => {
	return useQuery({
		queryKey: queryKeys.attendance.byEmployee(employeeId),
		queryFn: () => attendanceService.getAttendancesByEmployee(employeeId),
		enabled: !!employeeId,
	});
};
