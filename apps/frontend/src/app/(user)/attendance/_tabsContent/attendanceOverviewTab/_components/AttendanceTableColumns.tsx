import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

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

export const DateColumn = ({ row }: { row: { original: Attendance } }) => {
	const dateStr = row.original.date;
	// Use the date field directly, or clock_in if available
	const dateToUse = row.original.clock_in || dateStr;
	const date = new Date(dateToUse);

	// Check if the date is valid
	if (Number.isNaN(date.getTime())) {
		return (
			<div className="text-center">
				{ATTENDANCE_UI_MESSAGES.INVALID_DATE}
			</div>
		);
	}

	return (
		<div className="text-center">
			{date.toLocaleDateString(
				"en-US",
				ATTENDANCE_UI_CONFIG.DATE_FORMAT_OPTIONS
			)}
		</div>
	);
};

export const ClockInColumn = ({ row }: { row: { original: Attendance } }) => (
	<div className="text-center">
		{getClockInTimeDisplay(row.original.clock_in)}
	</div>
);

export const ClockOutColumn = ({ row }: { row: { original: Attendance } }) => (
	<div className="text-center">
		{utcToLocal(row.original.clock_out, "time-with-seconds")}
	</div>
);

export const LocationColumn = ({ row }: { row: { original: Attendance } }) => {
	const { clock_in_lat, clock_in_long } = row.original;
	return (
		<div className="text-center">
			{clock_in_lat && clock_in_long
				? `${clock_in_lat}, ${clock_in_long}`
				: ATTENDANCE_UI_MESSAGES.NO_LOCATION}
		</div>
	);
};

export const WorkHoursColumn = ({ row }: { row: { original: Attendance } }) => (
	<div className="text-center">
		{row.original.work_hours
			? formatDecimalHoursToTime(row.original.work_hours)
			: ATTENDANCE_UI_MESSAGES.NO_LOCATION}
	</div>
);

export const StatusColumn = ({ row }: { row: { original: Attendance } }) => {
	const formattedStatus = formatAttendanceStatus(row.original.status);
	const badgeClasses = getAttendanceStatusBadgeClasses(row.original.status);

	return (
		<div className="flex justify-center">
			<Badge className={badgeClasses}>{formattedStatus}</Badge>
		</div>
	);
};

export const DetailsColumn = ({
	row,
	onViewDetails,
}: {
	row: { original: Attendance };
	onViewDetails: (id: number) => void;
}) => (
	<div className="flex justify-center">
		<Button
			variant="default"
			size="sm"
			className="bg-blue-500 px-6 text-white hover:bg-blue-600"
			onClick={() => onViewDetails(Number(row.original.id))}
		>
			<Eye className="mr-1 h-4 w-4" />
			View
		</Button>
	</div>
);

export const createAttendanceColumns = (
	currentPage: number,
	pageSize: number,
	onViewDetails: (id: number) => void
): ColumnDef<Attendance>[] => [
	{
		header: ATTENDANCE_TABLE_HEADERS.NUMBER,
		cell: ({ row }) => (
			<NoColumn row={row} currentPage={currentPage} pageSize={pageSize} />
		),
		meta: {
			className: "max-w-[80px]",
		},
		enableSorting: false,
		enableColumnFilter: false,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.DATE,
		accessorKey: "date",
		cell: ({ row }) => <DateColumn row={row} />,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.CLOCK_IN,
		accessorKey: "clock_in",
		cell: ({ row }) => <ClockInColumn row={row} />,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.CLOCK_OUT,
		accessorKey: "clock_out",
		cell: ({ row }) => <ClockOutColumn row={row} />,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.LOCATION,
		cell: ({ row }) => <LocationColumn row={row} />,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.WORK_HOURS,
		accessorKey: "work_hours",
		cell: ({ row }) => <WorkHoursColumn row={row} />,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.STATUS,
		accessorKey: "status",
		cell: ({ row }) => <StatusColumn row={row} />,
	},
	{
		header: ATTENDANCE_TABLE_HEADERS.DETAILS,
		accessorKey: "id",
		cell: ({ row }) => (
			<DetailsColumn row={row} onViewDetails={onViewDetails} />
		),
		enableSorting: false,
		enableColumnFilter: false,
	},
];
