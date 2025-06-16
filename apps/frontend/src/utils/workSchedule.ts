import { WorkScheduleDetailItem } from "@/types/work-schedule.types";

export interface FlattenedDetail extends WorkScheduleDetailItem {
	singleDay: string;
}

const dayOrder = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

/**
 * Flattens work schedule details by expanding work_days array into individual records
 * and sorts them by day order (Monday to Sunday)
 *
 * @param details - Array of WorkScheduleDetailItem to flatten
 * @returns Array of FlattenedDetail sorted by day order
 */
export const flattenDetails = (
	details: WorkScheduleDetailItem[]
): FlattenedDetail[] => {
	const result: FlattenedDetail[] = [];

	details.forEach((detail) => {
		const workDays = detail.work_days || [];

		if (workDays.length > 0) {
			workDays.forEach((day) => {
				result.push({ ...detail, singleDay: day });
			});
		} else {
			result.push({ ...detail, singleDay: "-" });
		}
	});

	return result.sort((a, b) => {
		const dayIndexA = dayOrder.indexOf(a.singleDay);
		const dayIndexB = dayOrder.indexOf(b.singleDay);

		if (dayIndexA === -1 && dayIndexB === -1) return 0;
		if (dayIndexA === -1) return 1;
		if (dayIndexB === -1) return -1;

		return dayIndexA - dayIndexB;
	});
};
