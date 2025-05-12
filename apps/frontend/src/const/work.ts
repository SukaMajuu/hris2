export const WORK_TYPES = {
	WFO: "WFO",
	WFA: "WFA",
	WFH: "WFH",
	Hybrid: "Hybrid",
} as const;

export type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];
