// src/services/check-clock-approval.service.ts
import { ApiService, PaginatedResponse } from "./api.service";
import { API_ROUTES } from "@/config/api.routes";
import {
    CheckClockApprovalItem,
    CheckClockApprovalDetail,
    CheckClockApprovalActionPayload,
    // PaginatedCheckClockApprovalResponse, // Replaced by PaginatedResponse<CheckClockApprovalItem>
} from "@/types/check-clock-approval.types";
import { createPaginationQueryParams, PaginationParams } from "@/lib/pagination";


export class CheckClockApprovalService {
    private api: ApiService;

    constructor() {
        this.api = new ApiService();
    }

    async getApprovalList(params: PaginationParams): Promise<PaginatedResponse<CheckClockApprovalItem>> {
        const queryParams = createPaginationQueryParams(params);
        const queryString = new URLSearchParams(queryParams).toString();
        
        // The response structure from your API might wrap the paginated data under a 'data' key.
        // Example: { status: number, message: string, data: PaginatedResponse<CheckClockApprovalItem> }
        // Adjust the .get call and return statement based on your actual API response.
        const response = await this.api.get<{ data: PaginatedResponse<CheckClockApprovalItem> }>(
            `${API_ROUTES.v1.api.checkClockApprovals.list}?${queryString}`
        );
        // If your API directly returns PaginatedResponse<CheckClockApprovalItem> without the outer 'data' wrapper:
        // const response = await this.api.get<PaginatedResponse<CheckClockApprovalItem>>(
        //     `${API_ROUTES.v1.api.checkClockApprovals.list}?${queryString}`
        // );
        // return response.data; 
        return response.data.data; // Assuming the actual data is nested under response.data.data
    }

    async getApprovalDetail(id: number | string): Promise<CheckClockApprovalDetail> {
        // Similar to getApprovalList, adjust based on API response structure.
        const response = await this.api.get<{ data: CheckClockApprovalDetail }>(
            API_ROUTES.v1.api.checkClockApprovals.detail(id)
        );
        // If direct:
        // const response = await this.api.get<CheckClockApprovalDetail>(
        //     API_ROUTES.v1.api.checkClockApprovals.detail(id)
        // );
        // return response.data;
        return response.data.data; // Assuming data is nested
    }

    async approveRequest(id: number | string, payload?: CheckClockApprovalActionPayload): Promise<void> {
        // The response for an action like 'approve' might be minimal (e.g., just a success status)
        // or it might return the updated item. The Promise<void> assumes a minimal response.
        // Adjust if your API returns data.
        await this.api.post<void>( // Expecting no significant data in response body for this action
            API_ROUTES.v1.api.checkClockApprovals.approve(id),
            payload
        );
    }

    async rejectRequest(id: number | string, payload?: CheckClockApprovalActionPayload): Promise<void> {
         await this.api.post<void>( // Expecting no significant data in response body
            API_ROUTES.v1.api.checkClockApprovals.reject(id),
            payload
        );
    }
}

export const checkClockApprovalService = new CheckClockApprovalService();