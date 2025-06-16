import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeaveRequest } from "@/types/leave-request.types";
import { formatWorkHours, formatTime } from "@/utils/time";

// Combined interface for table display (matching the hook)
// NOTE: Now only handles attendance records, including those auto-created from approved leave requests
interface CombinedAttendanceData {
	id: number;
	employee_id: number;
	employee?: {
		id: number;
		first_name: string;
		last_name?: string;
		employee_code?: string;
		position_name?: string;
	};
	work_schedule_id?: number;
	work_schedule?: {
		id: number;
		name: string;
		work_type: string;
	};
	date: string;
	clock_in: string | null;
	clock_out: string | null;
	clock_in_lat?: number | null;
	clock_in_long?: number | null;
	clock_out_lat?: number | null;
	clock_out_long?: number | null;
	work_hours: number | null;
	status: string;
	created_at: string;
	updated_at: string;
	type: "attendance"; // Only attendance type now
	leave_type?: string;
	originalLeaveRequest?: LeaveRequest;
}

// Define the row type for table cells
interface TableRowProps {
	row: {
		index: number;
		original: CombinedAttendanceData;
	};
}

// Column components
const NoColumn = ({
	row,
	currentPage,
	pageSize,
}: {
	row: TableRowProps["row"];
	currentPage: number;
	pageSize: number;
}) => (
	<div className="flex items-center justify-center text-center">
		<div className="text-xs md:text-sm">
			{(currentPage - 1) * pageSize + row.index + 1}
		</div>
	</div>
);

const NameColumn = ({ row }: TableRowProps) => {
	const { employee } = row.original;
	const fullName = `${employee?.first_name || ""} ${
		employee?.last_name || ""
	}`.trim();
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-[120px] truncate text-center text-xs md:max-w-[180px] md:text-sm">
				{fullName}
			</div>
		</div>
	);
};

const DateColumn = ({ row }: TableRowProps) => {
	const date = new Date(row.original.date);
	const formattedDate = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "2-digit",
	});
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-[100px] truncate text-center text-xs md:max-w-[140px] md:text-sm">
				{formattedDate}
			</div>
		</div>
	);
};

const ClockInColumn = ({ row }: TableRowProps) => {
	const clockIn = formatTime(row.original.clock_in);
	return (
		<div className="flex items-center justify-center">
			<div className="text-center text-xs md:text-sm">{clockIn}</div>
		</div>
	);
};

const ClockOutColumn = ({ row }: TableRowProps) => {
	const clockOut = formatTime(row.original.clock_out);
	return (
		<div className="flex items-center justify-center">
			<div className="text-center text-xs md:text-sm">{clockOut}</div>
		</div>
	);
};

const WorkHoursColumn = ({ row }: TableRowProps) => {
	const workHours = formatWorkHours(row.original.work_hours);
	return (
		<div className="flex items-center justify-center">
			<div className="text-center text-xs md:text-sm">{workHours}</div>
		</div>
	);
};

const StatusColumn = ({ row }: TableRowProps) => {
	const { status } = row.original;
	let badgeVariant: "default" | "secondary" | "destructive" | "outline" =
		"default";
	let badgeText = status;

	if (status === "present") {
		badgeVariant = "default";
		badgeText = "Present";
	} else if (status === "late") {
		badgeVariant = "secondary";
		badgeText = "Late";
	} else if (status === "absent") {
		badgeVariant = "destructive";
		badgeText = "Absent";
	} else if (status === "leave") {
		badgeVariant = "outline";
		badgeText = row.original.leave_type || "Leave";
	}

	return (
		<div className="flex items-center justify-center">
			<Badge variant={badgeVariant} className="text-xs md:text-sm">
				{badgeText}
			</Badge>
		</div>
	);
};

const ActionColumn = ({
	row,
	onView,
}: {
	row: TableRowProps["row"];
	onView: (id: number) => void;
}) => (
	<div className="flex items-center justify-center">
		<Button
			size="sm"
			variant="outline"
			className="h-7 w-full cursor-pointer bg-[#6B9AC4] px-1 text-xs hover:cursor-pointer hover:bg-[#5A89B3] border-none text-white md:h-8 md:w-auto md:px-2"
			onClick={(e) => {
				e.stopPropagation();
				onView(row.original.id);
			}}
		>
			<Eye className="mr-0 h-3 w-3 md:mr-1" />
			<span className="hidden md:inline">View Details</span>
			<span className="md:hidden">View</span>
		</Button>
	</div>
);

const createOverviewColumns = (
	currentPage: number,
	pageSize: number,
	onView: (id: number) => void
): ColumnDef<CombinedAttendanceData, unknown>[] => [
	{
		header: "No.",
		id: "no",
		cell: (props) => (
			<NoColumn
				{...props}
				currentPage={currentPage}
				pageSize={pageSize}
			/>
		),
		meta: { className: "w-[50px] md:w-[80px] text-center" },
		enableSorting: false,
		enableColumnFilter: false,
	},
	{
		header: "Name",
		accessorKey: "employee.name",
		cell: NameColumn,
		meta: { className: "w-[120px] md:w-[180px] text-center" },
	},
	{
		header: "Date",
		accessorKey: "date",
		cell: DateColumn,
		meta: { className: "w-[100px] md:w-[140px] text-center" },
	},
	{
		header: "Clock In",
		accessorKey: "clock_in",
		cell: ClockInColumn,
		meta: { className: "w-[80px] md:w-[100px] text-center" },
	},
	{
		header: "Clock Out",
		accessorKey: "clock_out",
		cell: ClockOutColumn,
		meta: { className: "w-[80px] md:w-[100px] text-center" },
	},
	{
		header: "Work Hours",
		accessorKey: "work_hours",
		cell: WorkHoursColumn,
		meta: { className: "w-[80px] md:w-[120px] text-center" },
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: StatusColumn,
		meta: { className: "w-[80px] md:w-[120px] text-center" },
	},
	{
		header: "Action",
		accessorKey: "id",
		cell: (props) => <ActionColumn {...props} onView={onView} />,
		meta: { className: "w-[90px] md:w-[160px] text-center" },
		enableSorting: false,
		enableColumnFilter: false,
	},
];

export default createOverviewColumns;
