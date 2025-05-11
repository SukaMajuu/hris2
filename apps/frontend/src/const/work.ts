export const WORK_TYPES = {
	WFO: "WFO",
	WFA: "WFA",
	WFH: "WFH",
} as const;

export type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];
