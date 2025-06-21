import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { useMemo, useState, useCallback } from "react";

import { ATTENDANCE_UI_CONFIG } from "@/const/attendance";
import type { Attendance } from "@/types/attendance.types";
import {
	formatAttendanceStatus,
	getAttendanceStatusBadgeClasses,
} from "@/utils/status";
import { formatWorkHours } from "@/utils/time";
import { utcToLocal } from "@/utils/timezone";

import { createAttendanceColumns } from "../_components/AttendanceTableColumns";

interface UseAttendanceTableProps {
	filteredData: Attendance[];
	onViewDetails: (id: number) => void;
}

// Helper function to get clock in time display
const getClockInTimeDisplay = (clockInTime: string | null): string => {
	if (!clockInTime) return "-";
	return utcToLocal(clockInTime, "time-with-seconds");
};

// Helper function to format decimal hours to time format
const formatDecimalHoursToTime = (decimalHours: number | string): string => {
	const hours =
		typeof decimalHours === "string"
			? parseFloat(decimalHours)
			: decimalHours;
	return formatWorkHours(hours);
};

export const useAttendanceTable = ({
	filteredData,
	onViewDetails,
}: UseAttendanceTableProps) => {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ATTENDANCE_UI_CONFIG.DEFAULT_PAGE_SIZE,
	});

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize]
	);

	const handleViewDetails = useCallback(
		(id: number) => {
			const data = filteredData.find(
				(item: Attendance) => item.id === id
			);
			if (data) {
				onViewDetails(id);
			}
		},
		[filteredData, onViewDetails]
	);

	// Memoized columns
	const columns = useMemo<ColumnDef<Attendance>[]>(
		() =>
			createAttendanceColumns(pageIndex + 1, pageSize, handleViewDetails),
		[pageIndex, pageSize, handleViewDetails]
	);

	// Table configuration
	const table = useReactTable<Attendance>({
		data: filteredData,
		columns,
		state: {
			columnFilters,
			pagination,
		},
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		pageCount: Math.ceil(filteredData.length / pageSize) || 0,
		manualPagination: false,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return {
		table,
		columnFilters,
		setColumnFilters,
		pagination,
		setPagination,
		getClockInTimeDisplay,
		formatDecimalHoursToTime,
		// Helper functions for status badge
		formatAttendanceStatus,
		getAttendanceStatusBadgeClasses,
	};
};
