import { CheckClockData } from "../_hooks/useAttendance";

interface FilterOptions {
	date?: string;
	attendanceStatus?: string;
}

export function filterAttendanceData(
	data: CheckClockData[],
	filters: FilterOptions
): CheckClockData[] {
	return data.filter((item) => {
		// Date filter
		if (filters.date) {
			const itemDate = new Date(item.date).toISOString().split('T')[0];
			const filterDate = new Date(filters.date).toISOString().split('T')[0];
			if (itemDate !== filterDate) {
				return false;
			}
		}

	// Attendance Status filter
		if (filters.attendanceStatus) {
			// Map "Present" filter value to "On Time" in the data
			const statusToMatch = filters.attendanceStatus === "Present" ? "On Time" : filters.attendanceStatus;
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
		activeFilters.push(`Date: ${new Date(filters.date).toLocaleDateString()}`);
	}
	
	if (filters.attendanceStatus) {
		activeFilters.push(`Status: ${filters.attendanceStatus}`);
	}
	
	if (activeFilters.length === 0) {
		return "No filters applied";
	}
	
	return `Filtered by: ${activeFilters.join(", ")}`;
}