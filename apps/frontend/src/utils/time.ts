/**
 * Utility functions for time formatting
 */

import { utcToLocal, getCurrentLocalTime } from "./timezone";

/**
 * Format work hours as decimal to hours and minutes display
 * @param hours - Work hours as decimal (e.g., 8.5 = 8 hours 30 minutes)
 * @returns Formatted string like "8h 30m" or "-" if no hours
 */
export const formatWorkHours = (hours: number | null | undefined): string => {
	if (!hours || hours <= 0) return "-";

	const wholeHours = Math.floor(hours);
	const minutes = Math.round((hours - wholeHours) * 60);

	if (minutes === 0) {
		return `${wholeHours}h`;
	}

	return `${wholeHours}h ${minutes}m`;
};

/**
 * Format time string to HH:MM format
 * @param timeString - Time in various formats
 * @returns Formatted time string as HH:MM
 */
export const formatTime = (timeString: string | null): string => {
	if (!timeString) return "-";

	// Handle HH:MM:SS format
	if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
		return timeString.substring(0, 5);
	}

	try {
		const time = new Date(timeString);
		return time.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	} catch {
		return timeString.substring(0, 5);
	}
};

/**
 * Format time range from start and end times
 * @param start - Start time string in UTC format
 * @param end - End time string in UTC format
 * @returns Formatted time range like "08:00 - 17:00" or "-" if both are empty
 */
export const formatTimeRange = (
	start?: string | null,
	end?: string | null
): string => {
	if (!start && !end) return "-";

	// Convert UTC time strings to local time
	const formatSingleTime = (timeString: string | null): string => {
		if (!timeString) return "--:--";

		// Create a full UTC datetime string for today with the given time
		const today = new Date().toISOString().split("T")[0];
		const fullUtcDateTime = `${today}T${timeString}Z`;

		// Convert to local time and return in HH:MM format
		return utcToLocal(fullUtcDateTime, "time");
	};

	const startLocal = formatSingleTime(start || null);
	const endLocal = formatSingleTime(end || null);

	return `${startLocal} - ${endLocal}`;
};

/**
 * Format time string to HH:MM format with validation
 * @param timeString - Time string in various formats
 * @returns Formatted time string as HH:MM or null if invalid
 */
export const formatTimeToHHMM = (timeString: string | null): string | null => {
	if (!timeString) return null;

	// If it's already in HH:MM format, return as is
	if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeString)) {
		return timeString;
	}

	// If it's in HH:MM:SS format, extract HH:MM
	if (/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(timeString)) {
		return timeString.substring(0, 5);
	}

	// Try to parse and format
	try {
		const date = new Date(`2000-01-01T${timeString}`);
		if (!Number.isNaN(date.getTime())) {
			return date.toTimeString().substring(0, 5);
		}
	} catch {
		// Remove unused error variable
		console.error("Could not parse time:", timeString);
	}

	return timeString;
};

/**
 * Check if current time is within check-in window
 * @param checkinStartUTC - Check-in start time in UTC
 * @param checkinEndUTC - Check-in end time in UTC
 * @returns Boolean indicating if current time is within check-in window
 */
export const isWithinCheckInTime = (
	checkinStartUTC?: string | null,
	checkinEndUTC?: string | null
): boolean => {
	if (!checkinStartUTC || !checkinEndUTC) return true;

	const currentTime = `${getCurrentLocalTime()}:00`; // Convert HH:MM to HH:MM:SS for comparison

	// Convert UTC schedule times to local time for comparison using utility
	const today = new Date().toISOString().split("T")[0];
	const checkinStartLocal = utcToLocal(
		`${today}T${checkinStartUTC}Z`,
		"time-with-seconds"
	);
	const checkinEndLocal = utcToLocal(
		`${today}T${checkinEndUTC}Z`,
		"time-with-seconds"
	);

	return currentTime >= checkinStartLocal && currentTime <= checkinEndLocal;
};
