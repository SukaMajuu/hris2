import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Edit, UserPlus } from "lucide-react";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";

// Define the EmployeeWorkScheduleData interface based on the API response
interface EmployeeWorkScheduleData {
	id: number;
	employee: {
		id: number;
		first_name?: string;
		last_name?: string;
		position_name?: string;
		employee_code?: string;
	};
	work_schedule?: {
		id: number;
		name: string;
		work_type: string;
		details?: Array<{
			id: number;
			worktype_detail: string;
			work_days: string[];
			checkin_start: string;
			checkin_end: string;
			break_start: string;
			break_end: string;
			checkout_start: string;
			checkout_end: string;
			location_id: number | null;
			location: {
				id: number;
				name: string;
				address_detail: string;
				latitude: number;
				longitude: number;
				radius_m: number;
			} | null;
			is_active: boolean;
		}>;
	};
	employee_id: number;
	work_schedule_id?: number;
}

// Define the row type for table cells
interface TableRowProps {
	row: {
		index: number;
		original: EmployeeWorkScheduleData;
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
}) => {
	return (
		<div className="flex items-center justify-center text-center">
			<div className="text-xs md:text-sm">
				{(currentPage - 1) * pageSize + row.index + 1}
			</div>
		</div>
	);
};

const NameColumn = ({ row }: TableRowProps) => {
	const employee = row.original.employee;
	if (!employee)
		return (
			<div className="flex items-center justify-center">
				<div className="max-w-[120px] truncate text-center text-xs md:max-w-[180px] md:text-sm">
					Unknown Employee
				</div>
			</div>
		);
	const fullName = `${employee.first_name || ""} ${
		employee.last_name || ""
	}`.trim();
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-[120px] truncate text-center text-xs md:max-w-[180px] md:text-sm">
				{fullName}
			</div>
		</div>
	);
};

const PositionColumn = ({ row }: TableRowProps) => {
	const position = row.original.employee?.position_name || "Unknown Position";
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-[100px] truncate text-center text-xs md:max-w-[150px] md:text-sm">
				{position}
			</div>
		</div>
	);
};

const WorkScheduleColumn = ({ row }: TableRowProps) => {
	const workSchedule = row.original.work_schedule;
	if (!workSchedule) {
		return (
			<div className="flex items-center justify-center">
				<div className="flex items-center gap-1 text-red-600 text-xs md:text-sm">
					<AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
					<span className="font-medium truncate max-w-[80px] md:max-w-[120px]">
						Not Assigned
					</span>
				</div>
			</div>
		);
	}
	return (
		<div className="flex items-center justify-center">
			<div className="max-w-[100px] truncate text-center text-xs md:max-w-[140px] md:text-sm">
				<span className="font-medium text-green-700">
					{workSchedule.name}
				</span>
			</div>
		</div>
	);
};

const WorkTypeColumn = ({ row }: TableRowProps) => {
	const workType = row.original.work_schedule?.work_type;
	if (!workType) {
		return (
			<div className="flex items-center justify-center">
				<span className="text-gray-500 italic text-xs md:text-sm">
					No Schedule
				</span>
			</div>
		);
	}
	return (
		<div className="flex items-center justify-center">
			<WorkTypeBadge workType={workType as WorkType} />
		</div>
	);
};

const ActionColumn = ({
	row,
	onEdit,
}: {
	row: TableRowProps["row"];
	onEdit: (employeeId: number) => void;
}) => {
	const hasWorkSchedule = !!row.original.work_schedule_id;
	return (
		<div className="flex flex-col justify-center gap-1 md:flex-row">
			{hasWorkSchedule ? (
				<Button
					size="sm"
					variant="outline"
					className="h-7 w-full cursor-pointer bg-[#FFA500] px-1 text-xs hover:cursor-pointer hover:bg-[#E69500] border-none text-white md:h-8 md:w-auto md:px-2"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(row.original.employee_id);
					}}
				>
					<Edit className="mr-0 h-3 w-3 md:mr-1" />
					<span className="hidden md:inline">Edit Schedule</span>
					<span className="md:hidden">Edit</span>
				</Button>
			) : (
				<Button
					size="sm"
					variant="outline"
					className="h-7 w-full cursor-pointer bg-[#6B9AC4] px-1 text-xs hover:cursor-pointer hover:bg-[#5A89B3] border-none text-white md:h-8 md:w-auto md:px-2"
					onClick={(e) => {
						e.stopPropagation();
						onEdit(row.original.employee_id);
					}}
				>
					<UserPlus className="mr-0 h-3 w-3 md:mr-1" />
					<span className="hidden md:inline">Assign Schedule</span>
					<span className="md:hidden">Assign</span>
				</Button>
			)}
		</div>
	);
};

export function createEmployeeColumns(
	currentPage: number,
	pageSize: number,
	onEdit: (employeeId: number) => void
): ColumnDef<EmployeeWorkScheduleData, unknown>[] {
	return [
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
			id: "employee_name",
			accessorKey: "employee.first_name",
			enableColumnFilter: true,
			filterFn: "includesString",
			cell: NameColumn,
			meta: { className: "w-[120px] md:w-[180px] text-center" },
		},
		{
			header: "Position",
			accessorKey: "employee.position_name",
			cell: PositionColumn,
			meta: { className: "w-[100px] md:w-[150px] text-center" },
		},
		{
			header: "Work Schedule",
			accessorKey: "work_schedule.name",
			cell: WorkScheduleColumn,
			meta: { className: "w-[100px] md:w-[140px] text-center" },
		},
		{
			header: "Work Type",
			accessorKey: "work_schedule.work_type",
			cell: WorkTypeColumn,
			meta: { className: "w-[80px] md:w-[120px] text-center" },
		},
		{
			header: "Action",
			accessorKey: "id",
			cell: (props) => <ActionColumn {...props} onEdit={onEdit} />,
			meta: { className: "w-[90px] md:w-[160px] text-center" },
			enableSorting: false,
			enableColumnFilter: false,
		},
	];
}
