import { create } from "zustand";

import type { EmployeeStatsData } from "@/services/employee.service";
import type { Employee, EmployeeFilters } from "@/types/employee.types";

interface EmployeeState {
	// Employee list state
	employees: Employee[];
	totalEmployees: number;
	isLoading: boolean;
	error: string | null;

	// Current filters and pagination
	currentPage: number;
	pageSize: number;
	filters: EmployeeFilters;

	// Employee stats
	stats: EmployeeStatsData | null;
	isStatsLoading: boolean;
	statsError: string | null;

	// Selected employee for detail view
	selectedEmployee: Employee | null;
	isDetailLoading: boolean;

	// Actions
	setEmployees: (employees: Employee[], total: number) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setCurrentPage: (page: number) => void;
	setPageSize: (size: number) => void;
	setFilters: (filters: EmployeeFilters) => void;
	setStats: (stats: EmployeeStatsData) => void;
	setStatsLoading: (loading: boolean) => void;
	setStatsError: (error: string | null) => void;
	setSelectedEmployee: (employee: Employee | null) => void;
	setDetailLoading: (loading: boolean) => void;
	clearError: () => void;
	clearStatsError: () => void;
	resetState: () => void;
}

const initialState = {
	employees: [],
	totalEmployees: 0,
	isLoading: false,
	error: null,
	currentPage: 1,
	pageSize: 10,
	filters: {},
	stats: null,
	isStatsLoading: false,
	statsError: null,
	selectedEmployee: null,
	isDetailLoading: false,
};

export const useEmployeeStore = create<EmployeeState>((set) => ({
	...initialState,

	setEmployees: (employees, total) =>
		set({ employees, totalEmployees: total, isLoading: false }),

	setLoading: (loading) => set({ isLoading: loading }),

	setError: (error) => set({ error, isLoading: false }),

	setCurrentPage: (page) => set({ currentPage: page }),

	setPageSize: (size) => set({ pageSize: size }),

	setFilters: (filters) => set({ filters }),

	setStats: (stats) => set({ stats, isStatsLoading: false }),

	setStatsLoading: (loading) => set({ isStatsLoading: loading }),

	setStatsError: (error) => set({ statsError: error, isStatsLoading: false }),

	setSelectedEmployee: (employee) =>
		set({ selectedEmployee: employee, isDetailLoading: false }),

	setDetailLoading: (loading) => set({ isDetailLoading: loading }),

	clearError: () => set({ error: null }),

	clearStatsError: () => set({ statsError: null }),

	resetState: () => set({ ...initialState }),
}));
