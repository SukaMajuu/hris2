export const ROLES = {
	admin: "admin",
	user: "user",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
