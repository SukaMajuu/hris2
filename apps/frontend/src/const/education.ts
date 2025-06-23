export const EDUCATION_LEVEL = {
	SD: "SD",
	SMP: "SMP",
	SMA_SMK: "SMA/SMK",
	D1: "D1",
	D2: "D2",
	D3: "D3",
	S1_D4: "S1/D4",
	S2: "S2",
	S3: "S3",
	OTHER: "Other",
} as const;

export type EducationLevel = typeof EDUCATION_LEVEL[keyof typeof EDUCATION_LEVEL];

// Array for validation and select options
export const EDUCATION_LEVELS = Object.values(EDUCATION_LEVEL);
