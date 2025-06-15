import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LeaveRequest } from "@/types/leave-request";
import React from "react";

// Define the ApprovalItem interface to match what's used in the component
interface ApprovalItem {
	id: number;
	name: string;
	type: string;
	admin_note: string | null;
	approved: boolean | null;
	status: string;
	leaveRequest?: LeaveRequest;
}

// Define the row type for table cells
interface TableRowProps {
	row: {
		index: number;
		original: ApprovalItem;
	};
	table: {
		getState: () => {
			pagination: {
				pageIndex: number;
				pageSize: number;
			};
		};
	};
}

// Column components
const NoColumn = React.memo(({ row, table }: TableRowProps) => {
	const { pageIndex, pageSize } = table.getState().pagination;
	return (
		<div className="flex items-center justify-center text-center">
			<div className="text-xs md:text-sm">
				{pageIndex * pageSize + row.index + 1}
			</div>
		</div>
	);
});
NoColumn.displayName = "NoColumn";

const NameColumn = React.memo(({ row }: TableRowProps) => {
	const name = row.original.name;
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-[120px] truncate text-center text-xs md:max-w-[180px] md:text-sm">
				{name}
			</div>
		</div>
	);
});
NameColumn.displayName = "NameColumn";

const StartDateColumn = React.memo(({ row }: TableRowProps) => {
	const item = row.original;
	const startDate = item.leaveRequest?.start_date;
	return (
		<div className="flex items-center justify-center">
			<div className="text-xs md:text-sm text-center">
				{startDate ? new Date(startDate).toLocaleDateString() : "-"}
			</div>
		</div>
	);
});
StartDateColumn.displayName = "StartDateColumn";

const EndDateColumn = React.memo(({ row }: TableRowProps) => {
	const item = row.original;
	const endDate = item.leaveRequest?.end_date;
	return (
		<div className="flex items-center justify-center">
			<div className="text-xs md:text-sm text-center">
				{endDate ? new Date(endDate).toLocaleDateString() : "-"}
			</div>
		</div>
	);
});
EndDateColumn.displayName = "EndDateColumn";

const DurationColumn = React.memo(({ row }: TableRowProps) => {
	const item = row.original;
	const startDate = item.leaveRequest?.start_date;
	const endDate = item.leaveRequest?.end_date;

	if (!startDate || !endDate) return <div className="text-center">-</div>;

	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end.getTime() - start.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

	return (
		<div className="flex items-center justify-center">
			<div className="text-xs md:text-sm text-center">
				{diffDays} {diffDays === 1 ? "day" : "days"}
			</div>
		</div>
	);
});
DurationColumn.displayName = "DurationColumn";

const LeaveTypeColumn = React.memo(({ row }: TableRowProps) => {
	const status = row.original.status;
	return (
		<div className="flex items-center justify-center">
			<Badge variant="outline" className="text-xs md:text-sm">
				{status}
			</Badge>
		</div>
	);
});
LeaveTypeColumn.displayName = "LeaveTypeColumn";

const ApprovalColumn = React.memo(
	({
		row,
		onApprove,
	}: {
		row: TableRowProps["row"];
		onApprove: (item: ApprovalItem) => void;
	}) => {
		const item = row.original;

		// Use useCallback to prevent unnecessary re-renders
		const handleApprove = React.useCallback(
			(e: React.MouseEvent) => {
				// Prevent event propagation to avoid any potential issues
				e.stopPropagation();
				// Call the onApprove function with the item
				onApprove(item);
			},
			[onApprove, item]
		);

		if (item.approved === null) {
			return (
				<div className="flex items-center justify-center">
					<Button
						variant="outline"
						size="sm"
						className="text-xs md:text-sm"
						onClick={handleApprove}
					>
						Approve
					</Button>
				</div>
			);
		}

		return (
			<div className="flex items-center justify-center">
				<Badge
					variant={item.approved ? "default" : "destructive"}
					className="text-xs md:text-sm"
				>
					{item.approved ? "Approved" : "Rejected"}
				</Badge>
			</div>
		);
	}
);
ApprovalColumn.displayName = "ApprovalColumn";

const DetailsColumn = React.memo(
	({
		row,
		onViewDetails,
	}: {
		row: TableRowProps["row"];
		onViewDetails: (id: number) => void;
	}) => {
		// Use useCallback to prevent unnecessary re-renders
		const handleViewDetails = React.useCallback(
			(e: React.MouseEvent) => {
				// Prevent event propagation to avoid any potential issues
				e.stopPropagation();
				// Call the onViewDetails function with the item id
				onViewDetails(row.original.id);
			},
			[onViewDetails, row.original.id]
		);

		return (
			<div className="flex items-center justify-center">
				<Button
					size="sm"
					variant="default"
					className="h-7 w-full cursor-pointer bg-blue-500 px-1 text-xs hover:cursor-pointer hover:bg-blue-600 text-white md:h-8 md:w-auto md:px-2"
					onClick={handleViewDetails}
				>
					<span className="hidden md:inline">Details</span>
					<span className="md:hidden">View</span>
				</Button>
			</div>
		);
	}
);
DetailsColumn.displayName = "DetailsColumn";

export function createApprovalColumns(
	onApprove: (item: ApprovalItem) => void,
	onViewDetails?: (id: number) => void
): ColumnDef<ApprovalItem, unknown>[] {
	const columns: ColumnDef<ApprovalItem, unknown>[] = [
		{
			header: "No.",
			id: "no",
			cell: NoColumn,
			meta: { className: "w-[50px] md:w-[80px] text-center" },
			enableSorting: false,
			enableColumnFilter: false,
		},
		{
			header: "Name",
			id: "name",
			cell: NameColumn,
			meta: { className: "w-[120px] md:w-[180px] text-center" },
			enableSorting: true,
			enableColumnFilter: true,
		},
		{
			header: "Start Date",
			id: "start_date",
			cell: StartDateColumn,
			meta: { className: "w-[100px] md:w-[120px] text-center" },
			enableSorting: true,
			enableColumnFilter: false,
		},
		{
			header: "End Date",
			id: "end_date",
			cell: EndDateColumn,
			meta: { className: "w-[100px] md:w-[120px] text-center" },
			enableSorting: true,
			enableColumnFilter: false,
		},
		{
			header: "Duration",
			id: "duration",
			cell: DurationColumn,
			meta: { className: "w-[80px] md:w-[100px] text-center" },
			enableSorting: true,
			enableColumnFilter: false,
		},
		{
			header: "Leave Type",
			id: "leave_type",
			cell: LeaveTypeColumn,
			meta: { className: "w-[100px] md:w-[120px] text-center" },
			enableSorting: true,
			enableColumnFilter: true,
		},
		{
			header: "Approval",
			id: "approval",
			cell: ({ row }) => (
				<ApprovalColumn row={row} onApprove={onApprove} />
			),
			meta: { className: "w-[100px] md:w-[120px] text-center" },
			enableSorting: false,
			enableColumnFilter: false,
		},
	];

	// Add details column if onViewDetails is provided
	if (onViewDetails) {
		columns.push({
			header: "Details",
			id: "details",
			cell: ({ row }) => (
				<DetailsColumn row={row} onViewDetails={onViewDetails} />
			),
			meta: { className: "w-[80px] md:w-[100px] text-center" },
			enableSorting: false,
			enableColumnFilter: false,
		});
	}

	return columns;
}
