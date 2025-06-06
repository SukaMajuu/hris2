import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckclockSettings } from "@/api/queries/checkclock-settings.queries";
import { CheckclockSettingsResponse } from "@/types/checkclock-settings.types";

interface FilterOptions {
	name?: string;
	position?: string;
	work_type?: string;
	work_schedule_id?: string;
}

export function useCheckClockEmployee(initialPage = 1, initialPageSize = 10) {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);
	const [filters, setFilters] = useState<FilterOptions>({});
	const router = useRouter();

	// Build params for API call
	const params = {
		page,
		page_size: pageSize,
		...filters,
	};

	const settingsQuery = useCheckclockSettings(params);

	const settingsData = settingsQuery.data?.data;
	const employees = (settingsData?.items ||
		[]) as CheckclockSettingsResponse[];

	const paginationInfo = settingsData?.pagination;
	const pagination = {
		totalItems: paginationInfo?.total_items || 0,
		totalPages: paginationInfo?.total_pages || 0,
		currentPage: paginationInfo?.current_page || 1,
		pageSize: paginationInfo?.page_size || 10,
		hasNextPage: paginationInfo?.has_next_page || false,
		hasPrevPage: paginationInfo?.has_prev_page || false,
		items: employees,
	};

	const handleEdit = (id: number) => {
		router.push(`/check-clock/edit/${id}`);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setPageSize(newPageSize);
		setPage(1);
	};

	const applyFilters = (newFilters: FilterOptions) => {
		setFilters(newFilters);
		setPage(1); // Reset to first page when applying filters
	};

	const resetFilters = () => {
		setFilters({});
		setPage(1);
	};

	return {
		employees,
		pagination,
		page,
		setPage: handlePageChange,
		pageSize,
		setPageSize: handlePageSizeChange,
		filters,
		applyFilters,
		resetFilters,
		handleEdit,
		isLoading: settingsQuery.isLoading,
		error: settingsQuery.error,
		refetch: settingsQuery.refetch,
	};
}
