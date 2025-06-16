import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	ATTENDANCE_TABLE_HEADERS,
	ATTENDANCE_UI_MESSAGES,
	ATTENDANCE_UI_CONFIG,
} from "@/const/attendance";
import type { Attendance } from "@/types/attendance.types";
import {
	formatAttendanceStatus,
	getAttendanceStatusBadgeClasses,
} from "@/utils/status";
import { formatWorkHours } from "@/utils/time";
import { utcToLocal } from "@/utils/timezone";

interface UseAttendanceTableProps {
	filteredData: Attendance[];
	onViewDetails: (id: number) => void;
}

// Helper function to get status badge
const getStatusBadge = (status: string): React.JSX.Element => {
	const formattedStatus = formatAttendanceStatus(status);
	const badgeClasses = getAttendanceStatusBadgeClasses(status);

	return <Badge className={badgeClasses}>{formattedStatus}</Badge>;
};

// Helper function to get clock in time display
const getClockInTimeDisplay = (clockInTime: string | null): string => {
	if (!clockInTime) return ATTENDANCE_UI_MESSAGES.NO_LOCATION;
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

// Define render function for details cell
const renderDetailsCell = (
	id: number,
	onViewDetails: (attendanceId: number) => void
): React.JSX.Element => (
	<Button
		variant="default"
		size="sm"
		className="bg-blue-500 px-6 text-white hover:bg-blue-600"
		onClick={() => onViewDetails(id)}
	>
		<Eye className="mr-1 h-4 w-4" />
		View
	</Button>
);

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

	const columns: ColumnDef<Attendance>[] = useMemo(
		() => [
			{
				header: ATTENDANCE_TABLE_HEADERS.NUMBER,
				cell: ({ row, table }) => {
					const {
						pageIndex: currentPageIndex,
						pageSize: currentPageSize,
					} = table.getState().pagination;
					// Use correct row index within current page context
					const currentPageRows = table.getRowModel().rows;
					const rowIndexInPage = currentPageRows.findIndex(
						(r) => r.id === row.id
					);
					const rowNumber =
						currentPageIndex * currentPageSize + rowIndexInPage + 1;

					return rowNumber;
				},
				meta: {
					className: "max-w-[80px]",
				},
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.DATE,
				accessorKey: "date",
				cell: ({ row }) => {
					const dateStr = row.original.date;
					// Use the date field directly, or clock_in if available
					const dateToUse = row.original.clock_in || dateStr;
					const date = new Date(dateToUse);

					// Check if the date is valid
					if (Number.isNaN(date.getTime())) {
						return ATTENDANCE_UI_MESSAGES.INVALID_DATE;
					}

					return date.toLocaleDateString(
						"en-US",
						ATTENDANCE_UI_CONFIG.DATE_FORMAT_OPTIONS
					);
				},
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.CLOCK_IN,
				accessorKey: "clock_in",
				cell: ({ row }) => {
					const clockInTime = row.getValue("clock_in") as
						| string
						| null;
					return getClockInTimeDisplay(clockInTime);
				},
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.CLOCK_OUT,
				accessorKey: "clock_out",
				cell: ({ row }) => {
					const clockOutTime = row.getValue("clock_out") as
						| string
						| null;
					return utcToLocal(clockOutTime, "time-with-seconds");
				},
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.LOCATION,
				cell: ({ row }) => {
					const { clock_in_lat, clock_in_long } = row.original;
					return clock_in_lat && clock_in_long
						? `${clock_in_lat}, ${clock_in_long}`
						: ATTENDANCE_UI_MESSAGES.NO_LOCATION;
				},
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.WORK_HOURS,
				accessorKey: "work_hours",
				cell: ({ row }) =>
					row.original.work_hours
						? formatDecimalHoursToTime(row.original.work_hours)
						: ATTENDANCE_UI_MESSAGES.NO_LOCATION,
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.STATUS,
				accessorKey: "status",
				cell: ({ row }) => getStatusBadge(row.original.status),
			},
			{
				header: ATTENDANCE_TABLE_HEADERS.DETAILS,
				accessorKey: "id",
				cell: ({ row }) =>
					renderDetailsCell(
						Number(row.original.id),
						handleViewDetails
					),
			},
		],
		[handleViewDetails]
	);

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			pagination,
			columnFilters,
		},
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		manualPagination: false,
		pageCount: Math.ceil(filteredData.length / pageSize),
	});

	return {
		table,
		columnFilters,
		setColumnFilters,
		pagination,
		setPagination,
		getStatusBadge,
		getClockInTimeDisplay,
		formatDecimalHoursToTime,
	};
};
