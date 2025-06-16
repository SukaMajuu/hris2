import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState, useCallback } from "react";

import { WorkSchedule } from "@/types/work-schedule.types";

import { createWorkScheduleColumns } from "../_components/WorkScheduleTableColumns";

interface UseWorkScheduleTableProps {
	workSchedules: WorkSchedule[];
	pagination: {
		currentPage: number;
		pageSize: number;
		totalPages: number;
	};
	onEdit: (schedule: WorkSchedule) => void;
	onView: (schedule: WorkSchedule) => void;
	onDelete: (schedule: WorkSchedule) => void;
	onRowClick: (row: { original: WorkSchedule }) => void;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
}

export const useWorkScheduleTable = ({
	workSchedules,
	pagination,
	onEdit,
	onView,
	onDelete,
	onRowClick,
	onPageChange,
	onPageSizeChange,
}: UseWorkScheduleTableProps) => {
	const [scheduleNameFilter, setScheduleNameFilter] = useState("");

	// Memoized columns
	const columns = useMemo<ColumnDef<WorkSchedule>[]>(
		() =>
			createWorkScheduleColumns(
				pagination.currentPage,
				pagination.pageSize,
				onView,
				onEdit,
				onDelete
			),
		[pagination.currentPage, pagination.pageSize, onView, onEdit, onDelete]
	);

	// Table configuration
	const table = useReactTable<WorkSchedule>({
		data: workSchedules,
		columns,
		state: {
			columnFilters: [{ id: "name", value: scheduleNameFilter }],
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
			setScheduleNameFilter((nameFilterUpdate?.value as string) || "");
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
			setScheduleNameFilter(value);
			table.getColumn("name")?.setFilterValue(value);
		},
		[table]
	);

	return {
		table,
		scheduleNameFilter,
		handleNameFilterChange,
		handleRowClick: onRowClick,
	};
};
