import { useQuery } from "@tanstack/react-query";

import { employeeService } from "@/services/employee.service";
import type { EmployeeFilters } from "@/types/employee.types";

import { queryKeys } from "../query-keys";

export const useEmployeesQuery = (
	page: number,
	pageSize: number,
	filters: EmployeeFilters
) =>
	useQuery({
		queryKey: queryKeys.employees.list(page, pageSize, filters),
		queryFn: () => employeeService.getEmployees(page, pageSize, filters),
		staleTime: 30 * 1000,
	});

export const useEmployeeStatsQuery = (month?: string) =>
	useQuery({
		queryKey: queryKeys.employees.stats(month),
		queryFn: () => employeeService.getEmployeeStats(month),
		staleTime: 30 * 1000,
	});

export const useEmployeeDetailQuery = (id: number, enabled: boolean = true) =>
	useQuery({
		queryKey: queryKeys.employees.detail(id),
		queryFn: () => employeeService.getEmployeeDetail(id),
		enabled: enabled && !!id,
		staleTime: 30 * 1000,
	});

export const useCurrentUserProfileQuery = () =>
	useQuery({
		queryKey: queryKeys.employees.currentProfile,
		queryFn: () => employeeService.getCurrentUserProfile(),
		staleTime: 30 * 1000,
	});

export const useHireDateRangeQuery = () =>
	useQuery({
		queryKey: queryKeys.employees.hireDateRange(),
		queryFn: () => employeeService.getHireDateRange(),
		staleTime: 5 * 60 * 1000, // 5 minutes cache since this data doesn't change frequently
	});
