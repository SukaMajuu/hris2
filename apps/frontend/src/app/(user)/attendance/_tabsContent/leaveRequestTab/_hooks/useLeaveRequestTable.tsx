import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import React, { useState, useMemo, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEAVE_STATUS, LEAVE_TABLE_HEADERS } from "@/const/leave";
import type { LeaveRequest } from "@/types/leave-request.types";
import { formatLeaveType } from "@/utils/leave";
import { formatLeaveStatus, getLeaveStatusBadgeClasses } from "@/utils/status";

// Helper interface for table display data
interface PermitTableData {
	id: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	reason: string;
	status: string;
	attachmentUrl?: string;
	adminNote?: string;
	submittedAt: string;
	duration: string;
}

interface UseLeaveRequestTableProps {
	leaveRequestsData: {
		items: LeaveRequest[];
		pagination?: {
			total_pages: number;
		};
	} | null;
	currentPage: number;
	setCurrentPage: (page: number) => void;
	pageSize: number;
	setPageSize: (size: number) => void;
}

const getStatusBadge = (status: string): React.JSX.Element => {
	const formattedStatus = formatLeaveStatus(status);
	const badgeClasses = getLeaveStatusBadgeClasses(status);

	return <Badge className={badgeClasses}>{formattedStatus}</Badge>;
};

export const useLeaveRequestTable = ({
	leaveRequestsData,
	setCurrentPage,
	setPageSize,
}: UseLeaveRequestTableProps) => {
	const [nameFilter, setNameFilter] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	// Memoize expensive calculations
	const calculateDuration = useCallback(
		(startDate: string, endDate: string): string => {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
			return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
		},
		[]
	);

	// Transform leave request data for table
	const permitData: PermitTableData[] = useMemo(() => {
		if (!leaveRequestsData?.items) return [];

		return leaveRequestsData.items.map((request: LeaveRequest) => ({
			id: request.id,
			leaveType: formatLeaveType(request.leave_type),
			startDate: request.start_date,
			endDate: request.end_date,
			reason: request.employee_note || "No reason provided",
			status: request.status,
			attachmentUrl: request.attachment || undefined,
			adminNote: request.admin_note || undefined,
			submittedAt: request.created_at || new Date().toISOString(),
			duration: calculateDuration(request.start_date, request.end_date),
		}));
	}, [leaveRequestsData, calculateDuration]);

	const handleViewDetails = useCallback(
		(id: number) => {
			const request = leaveRequestsData?.items.find(
				(item: LeaveRequest) => item.id === id
			);
			return request || null;
		},
		[leaveRequestsData?.items]
	);

	// Define render function outside the component instead of component
	const renderDetailsCell = useCallback(
		(id: number) => (
			<Button
				size="sm"
				variant="default"
				className="bg-blue-500 text-white hover:bg-blue-600"
				onClick={(e) => {
					e.stopPropagation();
					handleViewDetails(id);
				}}
			>
				<Eye className="mr-1 h-4 w-4" />
				View
			</Button>
		),
		[handleViewDetails]
	);

	const columns: ColumnDef<PermitTableData>[] = useMemo(
		() => [
			{
				header: LEAVE_TABLE_HEADERS.NUMBER,
				cell: ({ row, table }) => {
					const {
						pageIndex,
						pageSize: currentPageSize,
					} = table.getState().pagination;
					return pageIndex * currentPageSize + row.index + 1;
				},
				meta: { className: "w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: LEAVE_TABLE_HEADERS.LEAVE_TYPE,
				accessorKey: "leaveType",
				enableColumnFilter: true,
			},
			{
				header: LEAVE_TABLE_HEADERS.START_DATE,
				accessorKey: "startDate",
				cell: ({ row }) =>
					new Date(row.original.startDate).toLocaleDateString(),
			},
			{
				header: LEAVE_TABLE_HEADERS.END_DATE,
				accessorKey: "endDate",
				cell: ({ row }) =>
					new Date(row.original.endDate).toLocaleDateString(),
			},
			{
				header: LEAVE_TABLE_HEADERS.DURATION,
				accessorKey: "duration",
			},
			{
				header: LEAVE_TABLE_HEADERS.STATUS,
				accessorKey: "status",
				cell: ({ row }) => getStatusBadge(row.original.status),
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: LEAVE_TABLE_HEADERS.SUBMITTED,
				accessorKey: "submittedAt",
				cell: ({ row }) =>
					new Date(row.original.submittedAt).toLocaleDateString(),
			},
			{
				header: LEAVE_TABLE_HEADERS.DETAILS,
				id: "details",
				cell: ({ row }) => renderDetailsCell(row.original.id),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[renderDetailsCell]
	);

	const table = useReactTable({
		data: permitData,
		columns,
		state: {
			columnFilters: [{ id: "leaveType", value: nameFilter }],
			pagination,
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find(
				(f) => f.id === "leaveType"
			);
			setNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: (updater) => {
			const newPagination =
				typeof updater === "function" ? updater(pagination) : updater;
			setPagination(newPagination);
			setCurrentPage(newPagination.pageIndex + 1);
			setPageSize(newPagination.pageSize);
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		pageCount: leaveRequestsData?.pagination?.total_pages || 0,
		manualPagination: true,
		autoResetPageIndex: false,
	});

	return {
		table,
		permitData,
		nameFilter,
		setNameFilter,
		pagination,
		setPagination,
		calculateDuration,
		getStatusBadge,
		handleViewDetails,
	};
};
