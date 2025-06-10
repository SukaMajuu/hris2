/**
 * Utility functions for time formatting
 */

/**
 * Format work hours as decimal to hours and minutes display
 * @param hours - Work hours as decimal (e.g., 8.5 = 8 hours 30 minutes)
 * @returns Formatted string like "8h 30m" or "-" if no hours
 */
export function formatWorkHours(hours: number | null | undefined): string {
    if (!hours || hours <= 0) return "-";

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
        return `${wholeHours}h`;
    }

    return `${wholeHours}h ${minutes}m`;
}

/**
 * Format time string to HH:MM format
 * @param timeString - Time in various formats
 * @returns Formatted time string as HH:MM
 */
export function formatTime(timeString: string | null): string {
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
}
