export const GENDER = {
	MALE: "Male",
	FEMALE: "Female",
} as const;

export type Gender = typeof GENDER[keyof typeof GENDER];
