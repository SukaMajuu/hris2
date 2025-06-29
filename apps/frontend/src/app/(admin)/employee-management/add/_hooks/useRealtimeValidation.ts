import { useState, useCallback, useMemo } from "react";

import { EmployeeService } from "@/services/employee.service";
import { debounce } from "@/utils/debounce";

interface ValidationState {
	isValidating: boolean;
	isValid: boolean | null;
	message: string;
}

interface UseRealtimeValidationReturn {
	validationStates: {
		email: ValidationState;
		nik: ValidationState;
		employee_code: ValidationState;
		phone: ValidationState;
	};
	validateField: (
		field: "email" | "nik" | "employee_code" | "phone",
		value: string
	) => void;
	clearValidation: (
		field: "email" | "nik" | "employee_code" | "phone"
	) => void;
	hasValidationErrors: () => boolean;
}

const employeeService = new EmployeeService();

// Validation regex patterns from Zod schema
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+[1-9]\d{8,14}$/;
const NIK_REGEX = /^\d{16}$/;

export const useRealtimeValidation = (): UseRealtimeValidationReturn => {
	const [validationStates, setValidationStates] = useState({
		email: { isValidating: false, isValid: null, message: "" },
		nik: { isValidating: false, isValid: null, message: "" },
		employee_code: { isValidating: false, isValid: null, message: "" },
		phone: { isValidating: false, isValid: null, message: "" },
	});

	// Create debounced validation function using useMemo
	const debouncedValidateField = useMemo(
		() =>
			debounce(
				async (
					field: "email" | "nik" | "employee_code" | "phone",
					value: string
				) => {
					if (!value || value.trim() === "") {
						setValidationStates((prev) => ({
							...prev,
							[field]: {
								isValidating: false,
								isValid: null,
								message: "",
							},
						}));
						return;
					}

					// Format validation first
					let formatError = "";
					switch (field) {
						case "email":
							if (!EMAIL_REGEX.test(value)) {
								formatError =
									"Please enter a valid email address";
							}
							break;
						case "nik":
							if (!NIK_REGEX.test(value)) {
								formatError = "NIK must be exactly 16 digits";
							}
							break;
						case "phone":
							if (!PHONE_REGEX.test(value)) {
								if (!value.startsWith("+")) {
									formatError =
										"Phone number must start with country code (e.g., +62)";
								} else if (value.length < 10) {
									formatError =
										"Phone number must be at least 10 digits total";
								} else {
									formatError =
										"Phone number format is invalid (e.g., +628123456789)";
								}
							}
							break;
						case "employee_code":
							// Employee code doesn't have specific format requirements
							break;
						default:
							break;
					}

					if (formatError) {
						setValidationStates((prev) => ({
							...prev,
							[field]: {
								isValidating: false,
								isValid: false,
								message: formatError,
							},
						}));
						return;
					}

					// If format is valid, clear any previous error and start uniqueness check
					setValidationStates((prev) => ({
						...prev,
						[field]: {
							isValidating: true,
							isValid: null,
							message: "",
						},
					}));

					try {
						const result = await employeeService.validateUniqueField(
							field,
							value
						);

						setValidationStates((prev) => ({
							...prev,
							[field]: {
								isValidating: false,
								isValid: !result.exists,
								message: result.exists
									? result.message ||
									  `${field} already exists`
									: "",
							},
						}));
					} catch (error) {
						console.error("Error validating field:", error);
						setValidationStates((prev) => ({
							...prev,
							[field]: {
								isValidating: false,
								isValid: null,
								message: "Error validating field",
							},
						}));
					}
				},
				500
			),
		[]
	);

	const validateFieldImmediate = useCallback(
		(field: "email" | "nik" | "employee_code" | "phone", value: string) => {
			if (!value || value.trim() === "") {
				setValidationStates((prev) => ({
					...prev,
					[field]: {
						isValidating: false,
						isValid: null,
						message: "",
					},
				}));
				return;
			}

			// Format validation
			let formatError = "";
			switch (field) {
				case "email":
					if (!EMAIL_REGEX.test(value)) {
						formatError = "Please enter a valid email address";
					}
					break;
				case "nik":
					if (!NIK_REGEX.test(value)) {
						formatError = "NIK must be exactly 16 digits";
					}
					break;
				case "phone":
					if (!PHONE_REGEX.test(value)) {
						if (!value.startsWith("+")) {
							formatError =
								"Phone number must start with country code (e.g., +62)";
						} else if (value.length < 10) {
							formatError =
								"Phone number must be at least 10 digits total";
						} else {
							formatError =
								"Phone number format is invalid (e.g., +628123456789)";
						}
					}
					break;
				case "employee_code":
					// Employee code doesn't have specific format requirements
					break;
				default:
					break;
			}

			if (formatError) {
				setValidationStates((prev) => ({
					...prev,
					[field]: {
						isValidating: false,
						isValid: false,
						message: formatError,
					},
				}));
				return;
			}

			// If format is valid, trigger debounced validation for uniqueness
			debouncedValidateField(field, value);
		},
		[debouncedValidateField]
	);

	const validateField = useCallback(
		(field: "email" | "nik" | "employee_code" | "phone", value: string) => {
			// First do immediate format validation
			validateFieldImmediate(field, value);
		},
		[validateFieldImmediate]
	);

	const clearValidation = useCallback(
		(field: "email" | "nik" | "employee_code" | "phone") => {
			setValidationStates((prev) => ({
				...prev,
				[field]: { isValidating: false, isValid: null, message: "" },
			}));
		},
		[]
	);

	const hasValidationErrors = useCallback(
		() =>
			Object.values(validationStates).some(
				(state) => state.isValid === false
			),
		[validationStates]
	);

	return {
		validationStates,
		validateField,
		clearValidation,
		hasValidationErrors,
	};
};
