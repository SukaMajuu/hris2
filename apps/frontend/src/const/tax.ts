export const TAX_STATUS = {
	// Tidak Kawin (Single)
	TK_0: "TK/0", // Tidak Kawin, 0 Tanggungan
	TK_1: "TK/1", // Tidak Kawin, 1 Tanggungan
	TK_2: "TK/2", // Tidak Kawin, 2 Tanggungan
	TK_3: "TK/3", // Tidak Kawin, 3 Tanggungan

	// Kawin (Married)
	K_0: "K/0", // Kawin, 0 Tanggungan
	K_1: "K/1", // Kawin, 1 Tanggungan
	K_2: "K/2", // Kawin, 2 Tanggungan
	K_3: "K/3", // Kawin, 3 Tanggungan

	// Kawin, Istri Bekerja (Married, Working Spouse)
	KI_0: "K/I/0", // Kawin, Istri Bekerja, 0 Tanggungan
	KI_1: "K/I/1", // Kawin, Istri Bekerja, 1 Tanggungan
	KI_2: "K/I/2", // Kawin, Istri Bekerja, 2 Tanggungan
	KI_3: "K/I/3", // Kawin, Istri Bekerja, 3 Tanggungan
} as const;

export type TaxStatus = typeof TAX_STATUS[keyof typeof TAX_STATUS];

// Array for validation and select options
export const TAX_STATUSES = Object.values(TAX_STATUS);
