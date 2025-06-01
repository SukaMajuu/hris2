// src/stores/check-clock-approval.store.ts
import { create } from 'zustand';
import {
    CheckClockApprovalItem,
    CheckClockApprovalDetail,
} from '@/types/check-clock-approval.types'; // Corrected import path

interface CheckClockApprovalState {
    // Data
    approvalList: CheckClockApprovalItem[];
    selectedItemForDetail: CheckClockApprovalDetail | null; // Full detail for the sheet

    // UI State for Modals/Sheets
    selectedItemForModal: CheckClockApprovalItem | null; // Item for the approve/reject confirmation modal
    isApprovalModalOpen: boolean;
    isDetailSheetOpen: boolean;

    // Filters and Pagination (can be managed here or in component state)
    filters: Record<string, string | number | boolean | undefined>; // e.g., { employeeName: '', requestType: '', status: 'pending', someNumericFilter: 123 }
    pagination: {
        pageIndex: number; // 0-based
        pageSize: number;
        totalItems: number; // Total items available from server for the current filters
        totalPages: number; // Calculated or from server
    };

    // Loading/Error states (optional, as React Query also handles this for fetches)
    isLoading: boolean;
    error: string | null;

    // Actions
    setApprovalList: (items: CheckClockApprovalItem[], totalItems?: number) => void;
    
    openApprovalModal: (item: CheckClockApprovalItem) => void;
    closeApprovalModal: () => void;
    
    openDetailSheet: (itemDetail: CheckClockApprovalDetail) => void; // Expects full detail
    closeDetailSheet: () => void;
    setSelectedDetailItem: (itemDetail: CheckClockApprovalDetail | null) => void; // For direct setting if needed

    setFilters: (newFilters: Partial<CheckClockApprovalState['filters']>) => void;
    setPagination: (newPagination: Partial<CheckClockApprovalState['pagination']>) => void;
    
    startLoading: () => void;
    setError: (errorMessage: string | null) => void;
    
    resetState: () => void; // To reset to initial state
}

const initialState: Omit<CheckClockApprovalState, 
    'setApprovalList' | 
    'openApprovalModal' | 
    'closeApprovalModal' | 
    'openDetailSheet' | 
    'closeDetailSheet' |
    'setSelectedDetailItem' |
    'setFilters' |
    'setPagination' |
    'startLoading' |
    'setError' |
    'resetState'
> = {
    approvalList: [],
    selectedItemForDetail: null,
    selectedItemForModal: null,
    isApprovalModalOpen: false,
    isDetailSheetOpen: false,
    filters: {},
    pagination: {
        pageIndex: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
    },
    isLoading: false,
    error: null,
};

export const useCheckClockApprovalStore = create<CheckClockApprovalState>((set, get) => ({
    ...initialState,

    setApprovalList: (items, totalItems) => {
        const { pageSize } = get().pagination;
        set({
            approvalList: items,
            isLoading: false,
            error: null,
            pagination: {
                ...get().pagination,
                totalItems: totalItems !== undefined ? totalItems : get().pagination.totalItems,
                totalPages: totalItems !== undefined && pageSize > 0 ? Math.ceil(totalItems / pageSize) : get().pagination.totalPages,
            }
        });
    },

    openApprovalModal: (item) => set({ selectedItemForModal: item, isApprovalModalOpen: true }),
    closeApprovalModal: () => set({ selectedItemForModal: null, isApprovalModalOpen: false }),

    openDetailSheet: (itemDetail) => set({ selectedItemForDetail: itemDetail, isDetailSheetOpen: true }),
    closeDetailSheet: () => set({ selectedItemForDetail: null, isDetailSheetOpen: false }),
    setSelectedDetailItem: (itemDetail) => set({ selectedItemForDetail: itemDetail, isLoading: false, error: null }),


    setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters },
        // Reset pagination when filters change to avoid being on a non-existent page
        pagination: { ...initialState.pagination, pageSize: state.pagination.pageSize } 
    })),
    
    setPagination: (newPagination) => {
        const currentPagination = get().pagination;
        const updatedPagination = { ...currentPagination, ...newPagination };
        
        // Recalculate totalPages if pageSize or totalItems changed
        if (newPagination.pageSize || newPagination.totalItems !== undefined) {
            if (updatedPagination.pageSize > 0) {
                updatedPagination.totalPages = Math.ceil(updatedPagination.totalItems / updatedPagination.pageSize);
            } else {
                updatedPagination.totalPages = 0; // Avoid division by zero
            }
        }
        // Ensure pageIndex is valid
        if (updatedPagination.pageIndex >= updatedPagination.totalPages && updatedPagination.totalPages > 0) {
            updatedPagination.pageIndex = updatedPagination.totalPages - 1;
        } else if (updatedPagination.pageIndex < 0) {
            updatedPagination.pageIndex = 0;
        }

        set({ pagination: updatedPagination });
    },

    startLoading: () => set({ isLoading: true, error: null }),
    setError: (errorMessage) => set({ isLoading: false, error: errorMessage }),

    resetState: () => set(initialState),
}));