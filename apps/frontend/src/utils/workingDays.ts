/**
 * Calculate the total number of working days (Monday-Friday) in a given month
 * @param monthString - String in format "YYYY-MM" (e.g., "2024-06")
 * @returns Number of working days in the month
 */
const calculateWorkingDaysInMonth = (monthString: string): number => {
	// Parse the month string to get year and month
	const [year, monthIndex] = monthString.split("-").map(Number);

	// Validate input
	if (!year || !monthIndex || monthIndex < 1 || monthIndex > 12) {
		return 0;
	}

	const daysInMonth = new Date(year, monthIndex, 0).getDate();
	let workingDaysCount = 0;

	// Count only weekdays (Monday to Friday)
	for (let day = 1; day <= daysInMonth; day += 1) {
		const date = new Date(year, monthIndex - 1, day);
		const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

		// Only count Monday (1) to Friday (5)
		if (dayOfWeek >= 1 && dayOfWeek <= 5) {
			workingDaysCount += 1;
		}
	}

	return workingDaysCount;
};

/**
 * Month names array for consistent date parsing
 */
const MONTH_NAMES: string[] = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

/**
 * Parse date label from chart format to Date object
 * @param label - String in format "Jun 2" or similar
 * @param year - Optional year, defaults to current year
 * @returns Date object
 */
const parseDateLabel = (label: string, year?: number): Date => {
	const parts = label.split(" ");
	const monthShort = parts[0] || "";
	const day = parseInt(parts[1] || "1", 10);
	const currentYear = year || new Date().getFullYear();

	const monthIndex = MONTH_NAMES.indexOf(monthShort);

	return new Date(
		currentYear,
		monthIndex !== -1 ? monthIndex : new Date().getMonth(),
		day
	);
};

/**
 * Get current month string in YYYY-MM format
 * @returns Current month string
 */
const getCurrentMonthString = (): string => {
	const now = new Date();
	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, "0");
	return `${year}-${month}`;
};

export {
	calculateWorkingDaysInMonth,
	MONTH_NAMES,
	parseDateLabel,
	getCurrentMonthString,
};
