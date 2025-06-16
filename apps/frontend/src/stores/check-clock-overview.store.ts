import { create } from "zustand";

import { CheckClockOverviewItem } from "@/types/check-clock-overview.types"; // Or from check-clock-overview.types.ts

interface CheckClockOverviewState {
    overviewItems: CheckClockOverviewItem[];
    selectedItem: CheckClockOverviewItem | null;
    isLoading: boolean;
    error: string | null;
    setOverviewItems: (items: CheckClockOverviewItem[]) => void;
    setSelectedItem: (item: CheckClockOverviewItem | null) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useCheckClockOverviewStore = create<CheckClockOverviewState>((set) => ({
    overviewItems: [],
    selectedItem: null,
    isLoading: false,
    error: null,
    setOverviewItems: (items) => set({ overviewItems: items, isLoading: false, error: null }),
    setSelectedItem: (item) => set({ selectedItem: item }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error, isLoading: false }),
}));
