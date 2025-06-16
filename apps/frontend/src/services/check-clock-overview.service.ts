import { API_ROUTES } from "@/config/api.routes";
import {
    CheckClockEntryPayload,
    CheckClockOverviewItem,
    CheckClockApprovalPayload,
    CheckClockOverviewFilters, // Pastikan ini diimpor dari file types yang benar
    CheckClockApprovalFilters,  // Pastikan ini diimpor dari file types yang benar
    CheckClockEmployeeFilters   // Pastikan ini diimpor dari file types yang benar
} from "@/types/check-clock-overview.types"; // Menggunakan path yang Anda berikan

import { ApiService, PaginatedResponse } from "./api.service";

class CheckClockService {
    private api: ApiService;

    constructor() {
        this.api = new ApiService();
    }

    async getCheckClockOverview(
        page: number,
        pageSize: number,
        filters?: CheckClockOverviewFilters // Menggunakan tipe spesifik
    ): Promise<PaginatedResponse<CheckClockOverviewItem>> {
        const params = { ...filters, page, page_size: pageSize };
        const response = await this.api.get<{ data: PaginatedResponse<CheckClockOverviewItem> }>(
            API_ROUTES.v1.api.checkClockOverview.list,
            { params }
        );
        return response.data.data;
    }

    async getCheckClockEntryById(id: number | string): Promise<CheckClockOverviewItem> {
        const response = await this.api.get<{ data: CheckClockOverviewItem }>(
            API_ROUTES.v1.api.checkClockOverview.detail(id)
        );
        return response.data.data;
    }

    async createCheckClockEntry(payload: CheckClockEntryPayload): Promise<CheckClockOverviewItem> {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
            const value = payload[key as keyof CheckClockEntryPayload];
            if (key === 'evidence' && value instanceof File) {
                formData.append(key, value);
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        const response = await this.api.post<{ data: CheckClockOverviewItem }>(
            API_ROUTES.v1.api.checkClockOverview.create,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data.data;
    }

    async updateCheckClockEntry(id: number | string, payload: Partial<CheckClockEntryPayload>): Promise<CheckClockOverviewItem> {
        const formData = new FormData();
        Object.keys(payload).forEach(key => {
            const value = payload[key as keyof CheckClockEntryPayload];
            if (key === 'evidence' && value instanceof File) {
                formData.append(key, value);
            } else if (key === 'id') {
                // Skip id if it's part of the URL and not needed in body
            } else if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });
        const response = await this.api.patch<{ data: CheckClockOverviewItem }>(
            API_ROUTES.v1.api.checkClockOverview.update(id),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } } // Atau application/json jika API Anda mendukungnya untuk PATCH
        );
        return response.data.data;
    }

    async deleteCheckClockEntry(id: number | string): Promise<void> {
        await this.api.delete(API_ROUTES.v1.api.checkClockOverview.delete(id));
    }

    async getApprovalList(
        page: number,
        pageSize: number,
        filters?: CheckClockApprovalFilters // Menggunakan tipe spesifik
    ): Promise<PaginatedResponse<CheckClockOverviewItem>> {
        const params = { ...filters, page, page_size: pageSize, status: filters?.status || 'Pending' };
        const response = await this.api.get<{ data: PaginatedResponse<CheckClockOverviewItem> }>(
            API_ROUTES.v1.api.checkClockOverview.approvalList,
            { params }
        );
        return response.data.data;
    }

    async approveOrRejectCheckClockEntry(id: number | string, payload: CheckClockApprovalPayload): Promise<CheckClockOverviewItem> {
        const response = await this.api.patch<{ data: CheckClockOverviewItem }>(
            API_ROUTES.v1.api.checkClockOverview.approveReject(id),
            payload // Payload ini kemungkinan besar JSON, bukan FormData
        );
        return response.data.data;
    }

    async getEmployeeCheckClockEntries(
        employeeId: string,
        page: number,
        pageSize: number,
        filters?: CheckClockEmployeeFilters // Menggunakan tipe spesifik
    ): Promise<PaginatedResponse<CheckClockOverviewItem>> {
        const params = { ...filters, page, page_size: pageSize };
        const response = await this.api.get<{ data: PaginatedResponse<CheckClockOverviewItem> }>(
            API_ROUTES.v1.api.checkClockOverview.employeeRecords(employeeId),
            { params }
        );
        return response.data.data;
    }
}

export const checkClockService = new CheckClockService();
