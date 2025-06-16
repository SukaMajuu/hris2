export const CONTRACT_TYPE = {
	PERMANENT: "permanent",
	CONTRACT: "contract",
	FREELANCE: "freelance",
} as const;

export type ContractType = typeof CONTRACT_TYPE[keyof typeof CONTRACT_TYPE];

// Array for validation and select options
export const CONTRACT_TYPES = Object.values(CONTRACT_TYPE);
