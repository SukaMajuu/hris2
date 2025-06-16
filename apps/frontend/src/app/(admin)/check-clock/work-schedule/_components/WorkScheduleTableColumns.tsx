import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { WorkSchedule } from "@/types/work-schedule.types";

export const NoColumn = ({
	row,
	currentPage,
	pageSize,
}: {
	row: { index: number };
	currentPage: number;
	pageSize: number;
}) => (
	<div className="flex items-center justify-center text-center">
		{(currentPage - 1) * pageSize + row.index + 1}
	</div>
);

export const NameColumn = ({ row }: { row: { original: WorkSchedule } }) => (
	<div className="flex items-center justify-center">
		<div className="max-w-[120px] truncate text-center text-xs md:max-w-[200px] md:text-sm">
			{row.original.name}
		</div>
	</div>
);

export const WorkTypeColumn = ({
	row,
}: {
	row: { original: WorkSchedule };
}) => (
	<div className="flex items-center justify-center">
		<WorkTypeBadge workType={row.original.work_type as WorkType} />
	</div>
);

export const ActionsColumn = ({
	row,
	onView,
	onEdit,
	onDelete,
}: {
	row: { original: WorkSchedule };
	onView: (schedule: WorkSchedule) => void;
	onEdit: (schedule: WorkSchedule) => void;
	onDelete: (schedule: WorkSchedule) => void;
}) => (
	<div className="flex flex-col justify-center gap-1 md:flex-row">
		<Button
			variant="default"
			size="sm"
			className="h-7 w-full cursor-pointer bg-blue-500 px-1 text-xs hover:cursor-pointer hover:bg-blue-600 md:h-8 md:w-auto md:px-2"
			onClick={(e) => {
				e.stopPropagation();
				onView(row.original);
			}}
		>
			<Eye className="mr-0 h-3 w-3 md:mr-1" />
			<span className="hidden md:inline">View</span>
		</Button>
		<Button
			size="sm"
			variant="outline"
			className="h-7 w-full cursor-pointer bg-[#FFA500] px-1 text-xs hover:cursor-pointer hover:bg-[#E69500] border-none text-white md:h-8 md:w-auto md:px-2"
			onClick={(e) => {
				e.stopPropagation();
				if (row.original.id) {
					onEdit(row.original);
				}
			}}
		>
			<Edit className="mr-0 h-3 w-3 md:mr-1" />
			<span className="hidden md:inline">Edit</span>
		</Button>
		<Button
			size="sm"
			variant="outline"
			className="h-7 w-full cursor-pointer bg-destructive px-1 text-xs hover:cursor-pointer hover:bg-destructive/80 border-none text-white md:h-8 md:w-auto md:px-2"
			onClick={(e) => {
				e.stopPropagation();
				onDelete(row.original);
			}}
		>
			<Trash2 className="mr-0 h-3 w-3 md:mr-1" />
			<span className="hidden md:inline">Delete</span>
		</Button>
	</div>
);

export const createWorkScheduleColumns = (
	currentPage: number,
	pageSize: number,
	onView: (schedule: WorkSchedule) => void,
	onEdit: (schedule: WorkSchedule) => void,
	onDelete: (schedule: WorkSchedule) => void
): ColumnDef<WorkSchedule>[] => [
	{
		header: "No.",
		id: "no",
		cell: ({ row }) => (
			<NoColumn row={row} currentPage={currentPage} pageSize={pageSize} />
		),
		meta: { className: "w-[50px] md:w-[80px] text-center" },
		enableSorting: false,
		enableColumnFilter: false,
	},
	{
		header: "Schedule Name",
		accessorKey: "name",
		cell: ({ row }) => <NameColumn row={row} />,
		meta: { className: "w-[120px] md:w-[200px] text-center" },
	},
	{
		header: "Work Type",
		accessorKey: "work_type",
		cell: ({ row }) => <WorkTypeColumn row={row} />,
		meta: { className: "w-[100px] md:w-[150px] text-center" },
	},
	{
		header: "Action",
		id: "action",
		cell: ({ row }) => (
			<ActionsColumn
				row={row}
				onView={onView}
				onEdit={onEdit}
				onDelete={onDelete}
			/>
		),
		meta: { className: "w-[120px] md:w-[250px] text-center" },
		enableSorting: false,
		enableColumnFilter: false,
	},
];
