// src/api/queries/check-clock-employee.queries.ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { checkClockEmployeeService } from "@/services/check-clock-employee.service";
import { PaginatedCheckClockEmployeeResponse, CheckClockEmployeeEntry } from "@/types/check-clock-employee.types";

export const useCheckClockEmployees = (
    employeeId?: number,
    page?: number,
    pageSize?: number,
    startDate?: string,
    endDate?: string,
    options?: { enabled?: boolean }
) => {
    return useQuery<PaginatedCheckClockEmployeeResponse, Error>({
        queryKey: queryKeys.checkClockEmployees.list({ employeeId, page, pageSize, startDate, endDate }),
        queryFn: () => checkClockEmployeeService.getAll(employeeId, page, pageSize, startDate, endDate),
        enabled: options?.enabled ?? true,
    });
};

export const useCheckClockEmployeeDetail = (id: number, options?: { enabled?: boolean }) => {
    return useQuery<CheckClockEmployeeEntry, Error>({
        queryKey: queryKeys.checkClockEmployees.detail(id),
        queryFn: () => checkClockEmployeeService.getById(id),
        enabled: options?.enabled ?? !!id,
    });
};