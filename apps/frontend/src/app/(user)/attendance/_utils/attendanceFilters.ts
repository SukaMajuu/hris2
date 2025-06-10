import { Attendance } from "@/types/attendance";

interface FilterOptions {
	date?: string;
	attendanceStatus?: string;
}

export function filterAttendanceData(
	data: Attendance[],
	filters: FilterOptions
): Attendance[] {
	return data.filter((item) => {
		// Date filter
		if (filters.date) {
			const itemDate = new Date(item.date).toISOString().split("T")[0];
			const filterDate = new Date(filters.date)
				.toISOString()
				.split("T")[0];
			if (itemDate !== filterDate) {
				return false;
			}
		}
		// Attendance Status filter
		if (filters.attendanceStatus && filters.attendanceStatus !== "all") {
			// Map filter values to data values
			const statusMapping: { [key: string]: string } = {
				"Present": "on_time",
				"Late": "late", 
				"Absent": "absent",
				"On Leave": "leave"
			};
			
			const statusToMatch = statusMapping[filters.attendanceStatus] || filters.attendanceStatus;
			if (item.status !== statusToMatch) {
				return false;
			}
		}

		return true;
	});
}

export function getFilterSummary(filters: FilterOptions): string {
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
}
