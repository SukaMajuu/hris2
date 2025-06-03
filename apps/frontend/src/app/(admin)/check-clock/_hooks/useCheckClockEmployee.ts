import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckclockSettings } from "@/api/queries/checkclock-settings.queries";
import { CheckclockSettingsResponse } from "@/types/checkclock-settings.types";

export function useCheckClockEmployee(initialPage = 1, initialPageSize = 10) {
	const [page, setPage] = useState(initialPage);
	const [pageSize, setPageSize] = useState(initialPageSize);
	const router = useRouter();

	const settingsQuery = useCheckclockSettings({ page, page_size: pageSize });

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

	return {
		employees,
		pagination,
		page,
		setPage: handlePageChange,
		pageSize,
		setPageSize: handlePageSizeChange,
		handleEdit,
		isLoading: settingsQuery.isLoading,
		error: settingsQuery.error,
		refetch: settingsQuery.refetch,
	};
}
