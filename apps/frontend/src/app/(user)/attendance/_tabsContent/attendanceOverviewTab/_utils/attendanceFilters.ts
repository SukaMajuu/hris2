import { Attendance } from "@/types/attendance.types";

interface FilterOptions {
	date?: string;
	attendanceStatus?: string;
}

export const filterAttendanceData = (
	data: Attendance[],
	filters: FilterOptions
): Attendance[] =>
	data.filter((item) => {
		if (filters.date) {
			const itemDate = new Date(item.date).toISOString().split("T")[0];
			const filterDate = new Date(filters.date)
				.toISOString()
				.split("T")[0];
			if (itemDate !== filterDate) {
				return false;
			}
		}
		if (filters.attendanceStatus && filters.attendanceStatus !== "all") {
			const statusMapping: { [key: string]: string } = {
				Ontime: "ontime",
				Late: "late",
				"Early Leave": "early_leave",
				Absent: "absent",
				Leave: "leave",
			};

			const statusToMatch =
				statusMapping[filters.attendanceStatus] ||
				filters.attendanceStatus;
			if (item.status !== statusToMatch) {
				return false;
			}
		}

		return true;
	});

export const getFilterSummary = (filters: FilterOptions): string => {
	const activeFilters: string[] = [];

	if (filters.date) {
		activeFilters.push(
			`Date: ${new Date(filters.date).toLocaleDateString()}`
		);
	}

	if (filters.attendanceStatus) {
		activeFilters.push(`Status: ${filters.attendanceStatus}`);
	}

	if (activeFilters.length === 0) {
		return "No filters applied";
	}

	return `Filtered by: ${activeFilters.join(", ")}`;
};
