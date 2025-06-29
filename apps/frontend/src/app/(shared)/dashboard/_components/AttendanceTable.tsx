"use client";

import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";

import { useRecentAttendances } from "@/api/queries/attendance.queries";
import { DataTable } from "@/components/dataTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FEATURE_CODES } from "@/const/features";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import type { RecentAttendance } from "@/services/attendance.service";

// Render functions outside the component
const renderNameCell = (name: string) => (
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="cursor-help truncate pr-2">{name}</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>{name}</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
);

// Helper function to get status badge class
const getStatusBadgeClass = (status: string) => {
	if (status === "Ontime") return "bg-[#34d399] text-white";
	if (status === "Early Leave") return "bg-[#fbbf24] text-white";
	if (status === "Late") return "bg-[#f87171] text-white";
	if (status === "Leave") return "bg-[#8b5cf6] text-white";
	return "bg-[#94a3b8] text-white";
};

const renderStatusCell = (status: string) => (
	<Badge className={getStatusBadgeClass(status)}>{status}</Badge>
);

export const AttendanceTable = () => {
	const { hasFeature } = useFeatureAccess();
	const canAccessCheckClock = hasFeature(FEATURE_CODES.CHECK_CLOCK_SYSTEM);

	const { data: attendanceData = [], isLoading } = useRecentAttendances();

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});

	const columns = useMemo<ColumnDef<RecentAttendance>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row }) => row.index + 1,
				meta: { className: "w-[60px] text-center" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Name",
				accessorKey: "name",
				meta: { className: "w-[150px]" },
				cell: ({ row }) => renderNameCell(row.original.name),
			},
			{
				header: "Status",
				accessorKey: "status",
				meta: { className: "w-[120px] text-center" },
				cell: ({ row }) => renderStatusCell(row.original.status),
			},
			{
				header: "Check In",
				accessorKey: "check_in",
				meta: { className: "w-[100px] text-center" },
			},
			{
				header: "Check Out",
				accessorKey: "check_out",
				meta: { className: "w-[100px] text-center" },
			},
		],
		[]
	);

	const table = useReactTable({
		data: attendanceData,
		columns,
		state: {
			pagination,
			columnFilters,
		},
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return (
		<Card className="flex h-full flex-row rounded-2xl border-none p-0 shadow-sm">
			<CardContent className="w-full p-6">
				<div className="mb-2 flex items-center justify-between">
					<div className="text-lg font-bold">Recent Attendance</div>
				</div>
				{canAccessCheckClock ? (
					<div className="w-full">
						{isLoading ? (
							<div className="flex h-32 items-center justify-center">
								<div className="text-gray-500">Loading...</div>
							</div>
						) : (
							<DataTable table={table} />
						)}
					</div>
				) : (
					<div className="flex w-full flex-col items-center justify-center py-12 text-center">
						<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
							<Crown className="h-8 w-8 text-white" />
						</div>
						<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
							Premium Feature
						</h3>
						<p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
							Unlock attendance table with our Premium plan
						</p>
						<div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-600 hover:to-amber-700">
							<Sparkles className="h-4 w-4" />
							<Link href="/subscription">Upgrade to Premium</Link>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
};
