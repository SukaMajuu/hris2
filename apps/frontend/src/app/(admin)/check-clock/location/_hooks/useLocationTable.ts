import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useCallback } from "react";

import { LocationResponse } from "@/types/location.types";

import { createLocationColumns } from "../_components/LocationTableColumns";

interface FilterOptions {
	name?: string;
	address_detail?: string;
	radius_range?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
}

interface UseLocationTableProps {
	locations: LocationResponse[];
	pagination: {
		currentPage: number;
		pageSize: number;
		totalPages: number;
	};
	filters: FilterOptions;
	onEdit: (location: LocationResponse) => void;
	onDelete: (location: LocationResponse) => void;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	onApplyFilters: (filters: FilterOptions) => void;
}

export const useLocationTable = ({
	locations,
	pagination,
	filters,
	onEdit,
	onDelete,
	onPageChange,
	onPageSizeChange,
	onApplyFilters,
}: UseLocationTableProps) => {
	// Memoized columns
	const columns = useMemo<ColumnDef<LocationResponse>[]>(
		() =>
			createLocationColumns(
				pagination.currentPage,
				pagination.pageSize,
				onEdit,
				onDelete
			),
		[pagination.currentPage, pagination.pageSize, onEdit, onDelete]
	);

	// Table configuration
	const table = useReactTable<LocationResponse>({
		data: locations,
		columns,
		state: {
			columnFilters: [{ id: "name", value: filters.name || "" }],
			pagination: {
				pageIndex: pagination.currentPage - 1,
				pageSize: pagination.pageSize,
			},
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find((f) => f.id === "name");
			const newNameFilter = (nameFilterUpdate?.value as string) || "";
			onApplyFilters({
				...filters,
				name: newNameFilter,
			});
		},
		onPaginationChange: (updater) => {
			const currentPaginationState = {
				pageIndex: pagination.currentPage - 1,
				pageSize: pagination.pageSize,
			};
			const newPagination =
				typeof updater === "function"
					? updater(currentPaginationState)
					: updater;
			onPageChange(newPagination.pageIndex + 1);
			onPageSizeChange(newPagination.pageSize);
		},
		pageCount: pagination.totalPages || 0,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	// Filter handlers
	const handleNameFilterChange = useCallback(
		(value: string) => {
			const newFilters = {
				...filters,
				name: value,
			};
			onApplyFilters(newFilters);
			table.getColumn("name")?.setFilterValue(value);
		},
		[filters, onApplyFilters, table]
	);

	return {
		table,
		handleNameFilterChange,
	};
};
