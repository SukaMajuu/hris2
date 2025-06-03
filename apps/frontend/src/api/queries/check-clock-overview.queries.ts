import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { checkClockService } from "@/services/check-clock-overview.service";
import { PaginatedResponse } from "@/services/api.service";
import {
    CheckClockOverviewItem,
    CheckClockOverviewFilters, // Impor tipe filter spesifik
    CheckClockApprovalFilters,  // Impor tipe filter spesifik
    CheckClockEmployeeFilters   // Impor tipe filter spesifik
} from "@/types/check-clock-overview.types"; // Pastikan path ini benar dan file ini mengekspor tipe filter

export const useCheckClockOverviewList = (
    page: number,
    pageSize: number,
    filters?: CheckClockOverviewFilters // Menggunakan tipe spesifik
) => {
    return useQuery<PaginatedResponse<CheckClockOverviewItem>, Error>({
        queryKey: queryKeys.checkClock.overviewList({ page, pageSize, ...filters }),
        queryFn: () => checkClockService.getCheckClockOverview(page, pageSize, filters),
        placeholderData: (previousData) => previousData,
    });
};

export const useCheckClockEntryDetail = (id: number | string | null | undefined) => {
    return useQuery<CheckClockOverviewItem, Error>({
        queryKey: queryKeys.checkClock.detail(id ?? ''),
        queryFn: () => checkClockService.getCheckClockEntryById(id!), // id akan non-null jika enabled
        enabled: !!id,
    });
};

export const useCheckClockApprovalList = (
    page: number,
    pageSize: number,
    filters?: CheckClockApprovalFilters // Menggunakan tipe spesifik
) => {
    return useQuery<PaginatedResponse<CheckClockOverviewItem>, Error>({
        queryKey: queryKeys.checkClock.approvalList({ page, pageSize, ...filters }),
        queryFn: () => checkClockService.getApprovalList(page, pageSize, filters),
        placeholderData: (previousData) => previousData,
    });
};

export const useEmployeeCheckClockList = (
    employeeId: string,
    page: number,
    pageSize: number,
    filters?: CheckClockEmployeeFilters // Menggunakan tipe spesifik
) => {
    return useQuery<PaginatedResponse<CheckClockOverviewItem>, Error>({
        queryKey: queryKeys.checkClock.employeeCheckClocks(employeeId, { page, pageSize, ...filters }),
        queryFn: () => checkClockService.getEmployeeCheckClockEntries(employeeId, page, pageSize, filters),
        enabled: !!employeeId,
        placeholderData: (previousData) => previousData,
    });
};
