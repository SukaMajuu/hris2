import { z } from "zod";

// Enum untuk hari kerja
const WorkDayEnum = z.enum([
	"MONDAY",
	"TUESDAY",
	"WEDNESDAY",
	"THURSDAY",
	"FRIDAY",
	"SATURDAY",
	"SUNDAY",
]);

// Enum untuk tipe kerja anak
const WorkTypeChildrenEnum = z.enum(["WFO", "WFA"]);

/**
 * =================================
 * SCHEMA LOKASI (DIPERBARUI)
 * =================================
 */
export const LocationSchema = z.object({
	id: z.string().optional(), // Asumsi ID bisa berupa string (misalnya UUID) atau nomor
	locationName: z
		.string({ required_error: "Nama lokasi wajib diisi." })
		.min(1, "Nama lokasi wajib diisi."),
	addressDetails: z.string().optional(), // Detail alamat, opsional
	radius: z
		.number({
			required_error: "Radius wajib diisi.",
			invalid_type_error: "Radius harus berupa angka.",
		})
		.positive("Radius harus bernilai positif."),
	latitude: z.number({
		required_error:
			'Silakan pilih titik di peta atau tekan tombol "Use Current Location".',
		invalid_type_error:
			'Silakan pilih titik di peta atau tekan tombol "Use Current Location".',
	}),
	longitude: z.number({
		required_error:
			'Silakan pilih titik di peta atau tekan tombol "Use Current Location".',
		invalid_type_error:
			'Silakan pilih titik di peta atau tekan tombol "Use Current Location".',
	}),
});

export type LocationInput = z.infer<typeof LocationSchema>;

/**
 * =================================
 * SCHEMA DETAIL JADWAL KERJA
 * =================================
 */
export const WorkScheduleDetailSchema = z
	.object({
		id: z.string().optional(),
		workTypeChildren: WorkTypeChildrenEnum,
		workDays: z.array(WorkDayEnum).min(1, "Minimal pilih satu hari kerja."),
		checkInStart: z
			.string({ required_error: "Jam mulai check-in wajib diisi." })
			.regex(
				/^([01]\d|2[0-3]):([0-5]\d)$/,
				"Format jam tidak valid (HH:MM)."
			),
		checkInEnd: z
			.string({ required_error: "Jam akhir check-in wajib diisi." })
			.regex(
				/^([01]\d|2[0-3]):([0-5]\d)$/,
				"Format jam tidak valid (HH:MM)."
			),
		breakStart: z
			.string()
			.regex(
				/^([01]\d|2[0-3]):([0-5]\d)$/,
				"Format jam tidak valid (HH:MM)."
			)
			.optional()
			.or(z.literal("")),
		breakEnd: z
			.string()
			.regex(
				/^([01]\d|2[0-3]):([0-5]\d)$/,
				"Format jam tidak valid (HH:MM)."
			)
			.optional()
			.or(z.literal("")),
		checkOutStart: z
			.string({ required_error: "Jam mulai check-out wajib diisi." })
			.regex(
				/^([01]\d|2[0-3]):([0-5]\d)$/,
				"Format jam tidak valid (HH:MM)."
			),
		checkOutEnd: z
			.string({ required_error: "Jam akhir check-out wajib diisi." })
			.regex(
				/^([01]\d|2[0-3]):([0-5]\d)$/,
				"Format jam tidak valid (HH:MM)."
			),
		locationId: z.string().optional(),
		// locationData hanya untuk frontend, tidak dikirim jika WFA
		// Menggunakan Partial karena LocationInput sekarang punya field yang required
		// tapi di sini location bersifat opsional dan mungkin tidak lengkap saat di form detail.
		location: LocationSchema.partial().optional(),
	})
	.superRefine((data, ctx) => {
		// Validasi jam
		if (
			new Date(`1970-01-01T${data.checkInStart}:00`) >=
			new Date(`1970-01-01T${data.checkInEnd}:00`)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Jam akhir check-in harus setelah jam mulai check-in.",
				path: ["checkInEnd"],
			});
		}
		if (
			data.breakStart &&
			data.breakEnd &&
			new Date(`1970-01-01T${data.breakStart}:00`) >=
				new Date(`1970-01-01T${data.breakEnd}:00`)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Jam akhir istirahat harus setelah jam mulai istirahat.",
				path: ["breakEnd"],
			});
		}
		if (
			new Date(`1970-01-01T${data.checkOutStart}:00`) >=
			new Date(`1970-01-01T${data.checkOutEnd}:00`)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Jam akhir check-out harus setelah jam mulai check-out.",
				path: ["checkOutEnd"],
			});
		}

		// Validasi urutan jam
		if (
			data.breakStart &&
			new Date(`1970-01-01T${data.checkInEnd}:00`) >=
				new Date(`1970-01-01T${data.breakStart}:00`)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Jam mulai istirahat harus setelah jam akhir check-in.",
				path: ["breakStart"],
			});
		}
		if (
			data.breakEnd &&
			new Date(`1970-01-01T${data.breakEnd}:00`) >=
				new Date(`1970-01-01T${data.checkOutStart}:00`)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Jam mulai check-out harus setelah jam akhir istirahat.",
				path: ["checkOutStart"],
			});
		}
		if (
			!data.breakStart &&
			!data.breakEnd &&
			new Date(`1970-01-01T${data.checkInEnd}:00`) >=
				new Date(`1970-01-01T${data.checkOutStart}:00`)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Jam mulai check-out harus setelah jam akhir check-in jika tidak ada jam istirahat.",
				path: ["checkOutStart"],
			});
		}

		// Validasi lokasi berdasarkan workTypeChildren
		if (data.workTypeChildren === "WFO") {
			if (!data.locationId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Lokasi wajib diisi untuk tipe WFO.",
					path: ["locationId"],
				});
			}
		} else if (data.workTypeChildren === "WFA") {
			if (data.locationId) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Lokasi tidak boleh diisi untuk tipe WFA.",
					path: ["locationId"],
				});
			}
		}
	});

export type WorkScheduleDetailInput = z.infer<typeof WorkScheduleDetailSchema>;

/**
 * =================================
 * SCHEMA JADWAL KERJA
 * =================================
 */
export const WorkScheduleSchema = z.object({
	id: z.string().optional(),
	name: z
		.string({ required_error: "Nama jadwal kerja wajib diisi." })
		.min(1, "Nama jadwal kerja wajib diisi."),
	workScheduleDetails: z
		.array(WorkScheduleDetailSchema)
		.min(1, "Minimal ada satu detail jadwal kerja."),
});

export type WorkScheduleInput = z.infer<typeof WorkScheduleSchema>;

/**
 * Transformasi untuk menghapus data lokasi jika WFA sebelum dikirim ke backend
 */
export const transformWorkScheduleForBackend = (
	data: WorkScheduleInput
): Omit<WorkScheduleInput, "workScheduleDetails"> & {
	workScheduleDetails: Omit<WorkScheduleDetailInput, "location">[];
} => ({
		...data,
		workScheduleDetails: data.workScheduleDetails.map((detail) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { location, ...restOfDetail } = detail; // Hapus field 'location' (objek detail lokasi)
			if (detail.workTypeChildren === "WFA") {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { locationId, ...restWithoutLocationId } = restOfDetail; // Hapus juga locationId
				return restWithoutLocationId as Omit<
					WorkScheduleDetailInput,
					"location" | "locationId"
				> & {
					locationId?: undefined;
				};
			}
			// Untuk WFO, pastikan locationId ada (sudah divalidasi)
			// dan hanya kirim locationId, bukan objek location utuh.
			return { ...restOfDetail }; // restOfDetail sudah termasuk locationId jika WFO
		}),
	});

/**
 * =================================
 * SCHEMA UNTUK CHECKCLOCK SETTINGS (EMPLOYEE-WORKSCHEDULE ASSIGNMENT)
 * =================================
 */
export const CheckclockSettingsSchema = z.object({
	id: z.number().optional(),
	employee_id: z.number({
		required_error: "Employee is required",
		invalid_type_error: "Employee ID must be a number",
	}),
	work_schedule_id: z.number({
		required_error: "Work schedule is required",
		invalid_type_error: "Work schedule ID must be a number",
	}),
});

export type CheckclockSettingsInput = z.infer<typeof CheckclockSettingsSchema>;
