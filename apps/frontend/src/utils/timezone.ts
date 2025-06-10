/**
 * Timezone utility functions for converting between UTC and local time
 */

/**
 * Converts UTC datetime string to local time string
 * @param utcString - ISO datetime string in UTC (e.g., "2024-01-15T08:30:00Z")
 * @param format - Optional format for output
 * @returns Local time string
 */
export function utcToLocal(
	utcString: string | null,
	format: "time" | "datetime" | "date" = "time"
): string {
	if (!utcString) return "";

	const date = new Date(utcString);

	switch (format) {
		case "time":
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
		case "date":
			return date.toLocaleDateString();
		case "datetime":
			return date.toLocaleString();
		default:
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});
	}
}

/**
 * Converts local datetime to UTC string for sending to backend
 * @param localDate - Local date
 * @param timeString - Time string in HH:MM format
 * @returns UTC datetime string in ISO format
 */
export function localToUtc(localDate: string, timeString: string): string {
	const [year, month, day] = localDate.split("-").map(Number);
	const [hours, minutes] = timeString.split(":").map(Number);

	// Validate required values
	if (
		!year ||
		!month ||
		!day ||
		hours === undefined ||
		minutes === undefined
	) {
		throw new Error("Invalid date or time format");
	}

	// Create local date
	const localDateTime = new Date(year, month - 1, day, hours, minutes);

	// Convert to UTC ISO string
	return localDateTime.toISOString();
}

/**
 * Gets current local time in HH:MM format
 */
export function getCurrentLocalTime(): string {
	const now = new Date();
	return now.toTimeString().slice(0, 5); // HH:MM
}

/**
 * Gets current local date in YYYY-MM-DD format
 */
export function getCurrentLocalDate(): string {
	const now = new Date();
	return now.toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Converts UTC datetime to just the time portion in local timezone
 * @param utcString - ISO datetime string in UTC
 * @returns Time string in HH:MM:SS format
 */
export function utcToLocalTime(utcString: string | null): string {
	if (!utcString) return "";

	const date = new Date(utcString);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});
}

/**
 * Format duration in hours to readable format
 * @param hours - Duration in hours
 * @returns Formatted string like "8h 30m"
 */
export function formatWorkHours(hours: number | null): string {
	if (!hours) return "0h";

	const wholeHours = Math.floor(hours);
	const minutes = Math.round((hours - wholeHours) * 60);

	if (minutes === 0) {
		return `${wholeHours}h`;
	}

	return `${wholeHours}h ${minutes}m`;
}
