import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { PaginationParams, createPaginationParams } from "@/lib/pagination";

/**
 * Custom hook for handling pagination in React components
 * @param initialPage Initial page number
 * @param initialPageSize Initial page size
 * @returns Pagination state and handlers
 */
export function usePagination(initialPage = 1, initialPageSize = 10) {
	const searchParams = useSearchParams();
	const [pagination, setPagination] = useState<PaginationParams>(() => {
		const page = searchParams.get("page");
		const pageSize = searchParams.get("page_size");

		return createPaginationParams(
			page ? parseInt(page, 10) : initialPage,
			pageSize ? parseInt(pageSize, 10) : initialPageSize
		);
	});

	useEffect(() => {
		const page = searchParams.get("page");
		const pageSize = searchParams.get("page_size");

		if (page || pageSize) {
			setPagination(
				createPaginationParams(
					page ? parseInt(page, 10) : pagination.page,
					pageSize ? parseInt(pageSize, 10) : pagination.pageSize
				)
			);
		}
	}, [searchParams, pagination.page, pagination.pageSize]);

	const setPage = useCallback((page: number) => {
		setPagination((prev) => createPaginationParams(page, prev.pageSize));
	}, []);

	const setPageSize = useCallback((pageSize: number) => {
		setPagination((prev) => createPaginationParams(prev.page, pageSize));
	}, []);

	const nextPage = useCallback(() => {
		setPagination((prev) =>
			createPaginationParams(prev.page + 1, prev.pageSize)
		);
	}, []);

	const prevPage = useCallback(() => {
		setPagination((prev) =>
			createPaginationParams(Math.max(1, prev.page - 1), prev.pageSize)
		);
	}, []);

	const resetPagination = useCallback(() => {
		setPagination(createPaginationParams(initialPage, initialPageSize));
	}, [initialPage, initialPageSize]);

	return {
		pagination,
		setPagination,
		setPage,
		setPageSize,
		nextPage,
		prevPage,
		resetPagination,
	};
}
