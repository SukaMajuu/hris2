import { useCallback } from "react";

import {
	LEAVE_FILE_VALIDATION,
	LEAVE_FORM_VALIDATION,
	LEAVE_ERROR_MESSAGES,
	LEAVE_TYPE,
	type LeaveType,
} from "@/const/leave";

export const useLeaveRequestForm = () => {
	// Date validation function
	const validateDateRange = useCallback(
		(startDate: string, endDate: string): string | null => {
			if (!startDate || !endDate) {
				return null; // Let required validation handle empty dates
			}

			const start = new Date(startDate);
			const end = new Date(endDate);
			if (end < start) {
				return LEAVE_ERROR_MESSAGES.INVALID_DATE_RANGE;
			}

			return null;
		},
		[]
	);

	// File validation function
	const validateFileUpload = useCallback((file: File | null): string | null => {
		if (!file) {
			return null; // No file selected, validation passes (file is optional)
		}

		// Check file size
		if (file.size > LEAVE_FILE_VALIDATION.MAX_FILE_SIZE) {
			return LEAVE_ERROR_MESSAGES.FILE_TOO_LARGE;
		}

		// Check file extension
		const fileName = file.name.toLowerCase();
		const hasValidExtension = LEAVE_FILE_VALIDATION.ALLOWED_EXTENSIONS.some(
			(ext) => fileName.endsWith(ext)
		);

		if (!hasValidExtension) {
			return LEAVE_ERROR_MESSAGES.INVALID_FILE_TYPE;
		}

		// Check MIME type
		const allowedTypes = LEAVE_FILE_VALIDATION.ALLOWED_FILE_TYPES as readonly string[];
		if (!allowedTypes.includes(file.type)) {
			return LEAVE_ERROR_MESSAGES.INVALID_FILE_TYPE;
		}

		return null; // Validation passed
	}, []);

	// Map attendance types to LeaveType enum
	const mapAttendanceTypeToLeaveType = useCallback(
		(attendanceType: string): LeaveType => {
			switch (attendanceType) {
				case "sick_leave":
					return LEAVE_TYPE.SICK_LEAVE;
				case "compassionate_leave":
					return LEAVE_TYPE.COMPASSIONATE_LEAVE;
				case "maternity_leave":
					return LEAVE_TYPE.MATERNITY_LEAVE;
				case "annual_leave":
					return LEAVE_TYPE.ANNUAL_LEAVE;
				case "marriage_leave":
					return LEAVE_TYPE.MARRIAGE_LEAVE;
				default:
					return LEAVE_TYPE.SICK_LEAVE;
			}
		},
		[]
	);

	// Form validation rules
	const getValidationRules = useCallback(() => ({
		start_date: {
			required: LEAVE_ERROR_MESSAGES.START_DATE_REQUIRED,
		},
		end_date: {
			required: LEAVE_ERROR_MESSAGES.END_DATE_REQUIRED,
		},
		employee_note: {
			required: LEAVE_ERROR_MESSAGES.NOTE_REQUIRED,
			minLength: {
				value: LEAVE_FORM_VALIDATION.MIN_NOTE_LENGTH,
				message: LEAVE_ERROR_MESSAGES.NOTE_TOO_SHORT,
			},
		},
		attachment: {
			validate: (files: File | null) => {
				const error = validateFileUpload(files);
				return error || true;
			},
		},
	}), [validateFileUpload]);

	return {
		// Validation functions
		validateDateRange,
		validateFileUpload,
		mapAttendanceTypeToLeaveType,
		getValidationRules,

		// Constants
		DEBOUNCE_DELAY: LEAVE_FORM_VALIDATION.DEBOUNCE_DELAY,
		MIN_NOTE_LENGTH: LEAVE_FORM_VALIDATION.MIN_NOTE_LENGTH,
		MAX_FILE_SIZE: LEAVE_FILE_VALIDATION.MAX_FILE_SIZE,
		ALLOWED_FILE_TYPES: LEAVE_FILE_VALIDATION.ALLOWED_FILE_TYPES,
		ALLOWED_EXTENSIONS: LEAVE_FILE_VALIDATION.ALLOWED_EXTENSIONS,

		// Error messages
		ERROR_MESSAGES: LEAVE_ERROR_MESSAGES,
	};
};
