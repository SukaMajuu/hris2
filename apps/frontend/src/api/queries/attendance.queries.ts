import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
import { attendanceService } from '@/services/attendance.service';

export const useAttendances = (page: number = 1, pageSize: number = 1000) => {
  return useQuery({
    queryKey: queryKeys.attendance.list(page, pageSize),
    queryFn: () => attendanceService.getAttendances(page, pageSize),
  });
};

export const useAttendanceStatistics = () => {
  return useQuery({
    queryKey: queryKeys.attendance.statistics(),
    queryFn: () => attendanceService.getAttendanceStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentAttendances = () => {
  return useQuery({
    queryKey: queryKeys.attendance.recent(),
    queryFn: () => attendanceService.getRecentAttendances(),
    staleTime: 30 * 1000, // 30 seconds
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

export const useEmployeeMonthlyStatistics = (year?: number, month?: number) => {
  return useQuery({
    queryKey: queryKeys.attendance.monthlyStatistics(year, month),
    queryFn: () => attendanceService.getEmployeeMonthlyStatistics(year, month),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
