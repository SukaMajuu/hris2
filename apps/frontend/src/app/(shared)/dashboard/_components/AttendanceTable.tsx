"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dataTable";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { FEATURE_CODES } from "@/const/features";
import { Crown, Sparkles } from "lucide-react";
import Link from "next/link";

interface AttendanceRecord {
	no: number;
	name: string;
	status: string;
	checkIn: string;
}

interface AttendanceTableProps {
	attendanceData: AttendanceRecord[];
}

export function AttendanceTable({ attendanceData }: AttendanceTableProps) {
	const { hasFeature } = useFeatureAccess();
	const canAccessCheckClock = hasFeature(FEATURE_CODES.CHECK_CLOCK_SYSTEM);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const columns = useMemo<ColumnDef<AttendanceRecord>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row, table }) => {
					const { pageIndex, pageSize } = table.getState().pagination;
					return pageIndex * pageSize + row.index + 1;
				},
				meta: { className: "w-[60px] text-center" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Name",
				accessorKey: "name",
				meta: { className: "w-[200px]" },
			},
			{
				header: "Status",
				accessorKey: "status",
				meta: { className: "w-[120px] text-center" },
				cell: ({ row }) => (
					<Badge
						className={
							row.original.status === "On Time"
								? "bg-[#34d399] text-white"
								: row.original.status === "Leave"
								? "bg-[#fbbf24] text-white"
								: "bg-[#f87171] text-white"
						}
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				header: "Check In",
				accessorKey: "checkIn",
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
					<div className="text-lg font-bold">Attendance</div>
				</div>
				{canAccessCheckClock ? (
					<div className="w-full">
						<DataTable table={table} />
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
}
