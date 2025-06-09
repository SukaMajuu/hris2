import { z } from "zod";

// Work days enum to match the backend
const WorkDayEnum = z.enum([
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
]);

// Work type enum
const WorkTypeEnum = z.enum(["WFO", "WFA"]);
const MainWorkTypeEnum = z.enum(["WFO", "WFA", "Hybrid"]);

// Location schema for the nested location object
const LocationSchema = z.object({
	id: z.number(),
	name: z.string(),
	address_detail: z.string(),
	latitude: z.number(),
	longitude: z.number(),
	radius_m: z.number(),
});

// Work schedule detail schema
const WorkScheduleDetailSchema = z
	.object({
		id: z.number().optional(),
		worktype_detail: WorkTypeEnum,
		work_days: z
			.array(WorkDayEnum)
			.min(1, "At least one work day is required"),
		checkin_start: z.string().nullable(),
		checkin_end: z.string().nullable(),
		break_start: z.string().nullable(),
		break_end: z.string().nullable(),
		checkout_start: z.string().nullable(),
		checkout_end: z.string().nullable(),
		location_id: z.number().nullable(),
		location: LocationSchema.nullable(),
		is_active: z.boolean().optional().default(true),
	})
	.superRefine((data, ctx) => {
		// Validate times are in correct format
		const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

		if (data.checkin_start && !timeRegex.test(data.checkin_start)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Check-in start time must be in HH:MM format",
				path: ["checkin_start"],
			});
		}

		if (data.checkin_end && !timeRegex.test(data.checkin_end)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Check-in end time must be in HH:MM format",
				path: ["checkin_end"],
			});
		}

		if (data.break_start && !timeRegex.test(data.break_start)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Break start time must be in HH:MM format",
				path: ["break_start"],
			});
		}

		if (data.break_end && !timeRegex.test(data.break_end)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Break end time must be in HH:MM format",
				path: ["break_end"],
			});
		}

		if (data.checkout_start && !timeRegex.test(data.checkout_start)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Check-out start time must be in HH:MM format",
				path: ["checkout_start"],
			});
		}

		if (data.checkout_end && !timeRegex.test(data.checkout_end)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Check-out end time must be in HH:MM format",
				path: ["checkout_end"],
			});
		}

		// Validate time logic
		if (data.checkin_start && data.checkin_end) {
			if (data.checkin_start >= data.checkin_end) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Check-in end time must be after check-in start time",
					path: ["checkin_end"],
				});
			}
		}

		if (data.break_start && data.break_end) {
			if (data.break_start >= data.break_end) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Break end time must be after break start time",
					path: ["break_end"],
				});
			}
		}

		if (data.checkout_start && data.checkout_end) {
			if (data.checkout_start >= data.checkout_end) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Check-out end time must be after check-out start time",
					path: ["checkout_end"],
				});
			}
		}

		// Validate location requirement for WFO
		if (data.worktype_detail === "WFO" && !data.location_id) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Location is required for WFO work type",
				path: ["location_id"],
			});
		}

		// Validate location requirement for WFO (must have valid location object)
		if (
			data.worktype_detail === "WFO" &&
			(!data.location || !data.location.name)
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Valid location is required for WFO work type",
				path: ["location"],
			});
		}

		// Ensure WFA doesn't have location
		if (data.worktype_detail === "WFA" && data.location_id) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Location should not be set for WFA work type",
				path: ["location_id"],
			});
		}

		// Ensure WFA has null location
		if (data.worktype_detail === "WFA" && data.location !== null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Location should be null for WFA work type",
				path: ["location"],
			});
		}
	});

// Main work schedule schema
export const workScheduleSchema = z
	.object({
		id: z.number().optional(),
		name: z.string().min(1, "Schedule name is required"),
		work_type: MainWorkTypeEnum,
		details: z
			.array(WorkScheduleDetailSchema)
			.min(1, "At least one work schedule detail is required"),
	})
	.superRefine((data, ctx) => {
		// Hybrid-specific validations
		if (data.work_type === "Hybrid") {
			if (data.details.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Hybrid work type requires at least 2 work schedule details",
					path: ["details"],
				});
			}

			const hasWFO = data.details.some(
				(detail) => detail.worktype_detail === "WFO"
			);
			const hasWFA = data.details.some(
				(detail) => detail.worktype_detail === "WFA"
			);

			if (!hasWFO || !hasWFA) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"Hybrid work type must have at least one WFO and one WFA detail",
					path: ["details"],
				});
			}
		}

		// WFO work type validation - all details must be WFO
		if (data.work_type === "WFO") {
			const hasNonWFO = data.details.some(
				(detail) => detail.worktype_detail !== "WFO"
			);
			if (hasNonWFO) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"All work schedule details must be WFO when main work type is WFO",
					path: ["details"],
				});
			}
		}

		// WFA work type validation - all details must be WFA
		if (data.work_type === "WFA") {
			const hasNonWFA = data.details.some(
				(detail) => detail.worktype_detail !== "WFA"
			);
			if (hasNonWFA) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message:
						"All work schedule details must be WFA when main work type is WFA",
					path: ["details"],
				});
			}
		}
	});

// Export types
export type WorkScheduleFormData = z.infer<typeof workScheduleSchema>;
export type WorkScheduleDetailFormData = z.infer<
	typeof WorkScheduleDetailSchema
>;
