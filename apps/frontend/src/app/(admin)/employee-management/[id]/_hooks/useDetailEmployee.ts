import { useState, useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

import {
	useUploadDocumentForEmployee,
	useDeleteDocument,
} from "@/api/mutations/document.mutations";
import {
	useUpdateEmployee,
	useResetEmployeePassword,
} from "@/api/mutations/employee.mutations";
import { useDocumentsByEmployee } from "@/api/queries/document.queries";
import { useEmployeeDetailQuery } from "@/api/queries/employee.queries";
import type { Document } from "@/services/document.service";
import { EmployeeService } from "@/services/employee.service";
import { debounce } from "@/utils/debounce";

interface _ValidationState {
	isValidating: boolean;
	isValid: boolean | null;
	message: string;
}

// Validation regex patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+[1-9]\d{8,14}$/;
const NIK_REGEX = /^\d{16}$/;

const employeeService = new EmployeeService();

export interface ClientDocument {
	name: string;
	file: File | null;
	url?: string;
	uploadedAt?: string;
	id?: number;
}

export const useDetailEmployee = (employeeId: number) => {
	const {
		data: employee,
		isLoading,
		error,
		isError,
	} = useEmployeeDetailQuery(employeeId, !!employeeId);

	const updateEmployeeMutation = useUpdateEmployee();
	const resetEmployeePasswordMutation = useResetEmployeePassword();
	const { data: documents = [] } = useDocumentsByEmployee(employeeId);
	const uploadDocumentMutation = useUploadDocumentForEmployee();
	const deleteDocumentMutation = useDeleteDocument();

	// Profile image states
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [profileFile, setProfileFile] = useState<File | null>(null);

	// Job information states
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [employeeCode, setEmployeeCode] = useState("");
	const [branch, setBranch] = useState("");
	const [position, setPosition] = useState("");
	const [grade, setGrade] = useState("");
	const [joinDate, setJoinDate] = useState("");
	const [contractType, setContractType] = useState("");
	const [editJob, setEditJob] = useState(false);

	// Personal information states
	const [nik, setNik] = useState("");
	const [email, setEmail] = useState("");
	const [gender, setGender] = useState("");
	const [placeOfBirth, setPlaceOfBirth] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [lastEducation, setLastEducation] = useState("");
	const [taxStatus, setTaxStatus] = useState("");
	const [editPersonal, setEditPersonal] = useState(false);

	// Bank information states
	const [bankName, setBankName] = useState("");
	const [bankAccountHolder, setBankAccountHolder] = useState("");
	const [bankAccountNumber, setBankAccountNumber] = useState("");
	const [editBank, setEditBank] = useState(false);

	// Reset password confirmation state
	const [_isConfirmingReset, setIsConfirmingReset] = useState(false);

	// Validation states
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

					// If format is valid, start uniqueness check
					setValidationStates((prev) => ({
						...prev,
						[field]: {
							isValidating: true,
							isValid: null,
							message: "",
						},
					}));

					try {
						// Skip uniqueness check if value is same as current employee's value
						const currentValue =
							employee?.[
								field === "employee_code"
									? "employee_code"
									: field
							];
						if (currentValue === value) {
							setValidationStates((prev) => ({
								...prev,
								[field]: {
									isValidating: false,
									isValid: true,
									message: "",
								},
							}));
							return;
						}

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
					} catch (err) {
						console.error("Error validating field:", err);
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
		[employee]
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

	const validateDateOfBirth = useCallback((value: string): boolean => {
		if (!value) return true; // Allow empty value

		const selectedDate = new Date(value);
		const today = new Date();
		const minDate = new Date();
		minDate.setFullYear(today.getFullYear() - 100);
		const minWorkAge = new Date();
		minWorkAge.setFullYear(today.getFullYear() - 16);

		if (selectedDate > today) {
			toast.error("Date of birth cannot be in the future");
			return false;
		}
		if (selectedDate < minDate) {
			toast.error("Date of birth cannot be more than 100 years ago");
			return false;
		}
		if (selectedDate > minWorkAge) {
			toast.error("Employee must be at least 16 years old");
			return false;
		}

		return true;
	}, []);

	const validateField = useCallback(
		(field: "email" | "nik" | "employee_code" | "phone", value: string) => {
			validateFieldImmediate(field, value);
			debouncedValidateField(field, value);
		},
		[validateFieldImmediate, debouncedValidateField]
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

	// Validation wrapper functions
	const setEmailWithValidation = useCallback(
		(value: string) => {
			setEmail(value);
			validateField("email", value);
		},
		[validateField]
	);

	const setNikWithValidation = useCallback(
		(value: string) => {
			setNik(value);
			validateField("nik", value);
		},
		[validateField]
	);

	const setEmployeeCodeWithValidation = useCallback(
		(value: string) => {
			setEmployeeCode(value);
			validateField("employee_code", value);
		},
		[validateField]
	);

	const setPhoneWithValidation = useCallback(
		(value: string) => {
			setPhone(value);
			validateField("phone", value);
		},
		[validateField]
	);

	// Remove local document state and use API data
	const currentDocuments: ClientDocument[] = (documents || []).map(
		(doc: Document) => ({
			name: doc.name,
			file: null,
			url: doc.url,
			uploadedAt: doc.created_at,
			id: doc.id,
		})
	);

	// Initialize form data when employee data is loaded
	useEffect(() => {
		if (employee) {
			setFirstName(employee.first_name || "");
			setLastName(employee.last_name || "");
			setEmployeeCode(employee.employee_code || "");
			setNik(employee.nik || "");
			setEmail(employee.email || "");
			setGender(employee.gender || "");
			setPlaceOfBirth(employee.place_of_birth || "");
			setDateOfBirth(employee.date_of_birth || "");
			setPhone(employee.phone || "");
			setAddress(""); // Address field not in API response
			setBranch(employee.branch || "");
			setPosition(employee.position_name || "");
			setGrade(employee.grade || "");
			setJoinDate(employee.hire_date || "");
			setBankName(employee.bank_name || "");
			setBankAccountHolder(employee.bank_account_holder_name || "");
			setBankAccountNumber(employee.bank_account_number || "");
			setProfileImage(employee.profile_photo_url || null);
			setLastEducation(employee.last_education || "");
			setTaxStatus(employee.tax_status || "");
			setContractType(employee.contract_type || "");
		}
	}, [employee]);

	const handleProfileImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			// Only allow photo change when in edit mode
			if (!editJob) {
				toast.info(
					"Please enable edit mode first to change profile photo."
				);
				return;
			}

			const file = e.target.files?.[0] || null;
			if (file) {
				setProfileFile(file);
				const reader = new FileReader();
				reader.onload = (ev) => {
					setProfileImage(ev.target?.result as string);
				};
				reader.readAsDataURL(file);
			}
		},
		[editJob]
	);

	const handleAddNewDocument = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file && employeeId) {
				try {
					await uploadDocumentMutation.mutateAsync({
						employeeId,
						file,
					});
					toast.success("Document uploaded successfully!");
					// Clear the input
					e.target.value = "";
				} catch (err) {
					console.error("Error uploading document:", err);
					toast.error("Failed to upload document. Please try again.");
				}
			}
		},
		[employeeId, uploadDocumentMutation]
	);

	const handleDeleteDocument = useCallback(
		async (index: number) => {
			const doc = currentDocuments[index];
			if (doc && doc.id) {
				try {
					await deleteDocumentMutation.mutateAsync(doc.id);
					toast.success("Document deleted successfully!");
				} catch (err) {
					console.error("Error deleting document:", err);
					toast.error("Failed to delete document. Please try again.");
				}
			}
		},
		[currentDocuments, deleteDocumentMutation]
	);

	const handleDownloadDocument = useCallback((doc: ClientDocument) => {
		if (doc.url && !doc.file) {
			const link = document.createElement("a");
			link.href = doc.url;
			link.download = doc.name;
			link.target = "_blank";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else if (doc.file) {
			const url = URL.createObjectURL(doc.file);
			const link = document.createElement("a");
			link.href = url;
			link.download = doc.name;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}
	}, []);

	const handleCancelEdit = useCallback(() => {
		// Reset profile image and file if edit was cancelled
		if (profileFile) {
			setProfileImage(employee?.profile_photo_url || null);
			setProfileFile(null);
		}

		// Reset form values to original employee data
		if (employee) {
			setEmployeeCode(employee.employee_code || "");
			setNik(employee.nik || "");
			setEmail(employee.email || "");
			setPhone(employee.phone || "");
		}

		// Clear all validations
		clearValidation("email");
		clearValidation("nik");
		clearValidation("employee_code");
		clearValidation("phone");

		setEditJob(false);
	}, [profileFile, employee, clearValidation]);

	const handleCancelPersonalEdit = useCallback(() => {
		// Reset personal form values to original employee data
		if (employee) {
			setFirstName(employee.first_name || "");
			setLastName(employee.last_name || "");
			setNik(employee.nik || "");
			setEmail(employee.email || "");
			setGender(employee.gender || "");
			setPlaceOfBirth(employee.place_of_birth || "");
			setDateOfBirth(employee.date_of_birth || "");
			setPhone(employee.phone || "");
			setLastEducation(employee.last_education || "");
			setTaxStatus(employee.tax_status || "");
		}

		// Clear all validations
		clearValidation("email");
		clearValidation("nik");
		clearValidation("phone");

		setEditPersonal(false);
	}, [employee, clearValidation]);

	const handleSaveJob = useCallback(async () => {
		if (!employee) return;

		try {
			const updateData = {
				employee_code: employeeCode,
				branch: branch || undefined,
				position_name: position || undefined,
				grade: grade || undefined,
				hire_date: joinDate,
				contract_type: contractType,
				// Include photo file if user selected a new one
				photo_file: profileFile || undefined,
			};

			await updateEmployeeMutation.mutateAsync({
				id: employee.id,
				data: updateData,
			});

			toast.success("Job information updated successfully!");

			// Reset profile file state after successful save
			setProfileFile(null);
			setEditJob(false);
		} catch (err) {
			console.error("Error updating job info:", err);
			toast.error("Failed to update job information. Please try again.");
		}
	}, [
		employee,
		employeeCode,
		branch,
		position,
		grade,
		joinDate,
		contractType,
		profileFile,
		updateEmployeeMutation,
		setProfileFile,
	]);

	const handleSavePersonal = useCallback(async () => {
		if (!employee) return;

		try {
			const updateData = {
				first_name: firstName,
				last_name: lastName,
				nik,
				email,
				gender,
				place_of_birth: placeOfBirth,
				date_of_birth: dateOfBirth,
				phone,
				last_education: lastEducation,
				tax_status: taxStatus,
			};

			await updateEmployeeMutation.mutateAsync({
				id: employee.id,
				data: updateData,
			});

			toast.success("Personal information updated successfully!");

			setEditPersonal(false);
		} catch (err) {
			console.error("Error updating personal info:", err);
			toast.error(
				"Failed to update personal information. Please try again."
			);
		}
	}, [
		employee,
		firstName,
		lastName,
		nik,
		email,
		gender,
		placeOfBirth,
		dateOfBirth,
		phone,
		lastEducation,
		taxStatus,
		updateEmployeeMutation,
	]);

	const handleSaveBank = useCallback(async () => {
		if (!employee) return;

		try {
			const updateData = {
				bank_name: bankName,
				bank_account_holder_name: bankAccountHolder,
				bank_account_number: bankAccountNumber,
			};

			await updateEmployeeMutation.mutateAsync({
				id: employee.id,
				data: updateData,
			});

			toast.success("Bank information updated successfully!");

			setEditBank(false);
		} catch (err) {
			console.error("Error updating bank info:", err);
			toast.error("Failed to update bank information. Please try again.");
		}
	}, [
		employee,
		bankName,
		bankAccountHolder,
		bankAccountNumber,
		updateEmployeeMutation,
	]);

	const handleResetPassword = useCallback(async () => {
		if (!employee?.id) {
			toast.error("Employee ID not found");
			return;
		}

		if (!employee?.email) {
			toast.error(
				"Employee has no email address associated for password reset"
			);
			return;
		}

		try {
			await resetEmployeePasswordMutation.mutateAsync(employee.id);
			toast.success(`Password reset email sent to ${employee.email}`);
		} catch (err) {
			console.error("Error resetting password:", err);
			toast.error(
				"Failed to send password reset email. Please try again."
			);
		}
	}, [employee?.id, employee?.email, resetEmployeePasswordMutation]);

	return {
		initialEmployeeData: employee,
		isLoading,
		error: isError
			? error?.message || "Failed to load employee data"
			: null,

		profileImage,
		setProfileImage,
		profileFile,
		setProfileFile,
		firstName,
		setFirstName,
		lastName,
		setLastName,
		employeeCode,
		setEmployeeCode: setEmployeeCodeWithValidation,
		branch,
		setBranch,
		position,
		setPosition,
		grade,
		setGrade,
		joinDate,
		setJoinDate,
		contractType,
		setContractType,
		editJob,
		setEditJob,

		nik,
		setNik: setNikWithValidation,
		email,
		setEmail: setEmailWithValidation,
		gender,
		setGender,
		placeOfBirth,
		setPlaceOfBirth,
		dateOfBirth,
		setDateOfBirth,
		phone,
		setPhone: setPhoneWithValidation,
		address,
		setAddress,
		lastEducation,
		setLastEducation,
		taxStatus,
		setTaxStatus,
		editPersonal,
		setEditPersonal,

		bankName,
		setBankName,
		bankAccountHolder,
		setBankAccountHolder,
		bankAccountNumber,
		setBankAccountNumber,
		editBank,
		setEditBank,

		currentDocuments,

		// Validation states and functions
		validationStates,
		validateField,
		clearValidation,
		hasValidationErrors,
		validateDateOfBirth,

		// Reset password loading state
		isResettingPassword: resetEmployeePasswordMutation.isPending,
		onResetPasswordComplete: () => setIsConfirmingReset(false),

		handleProfileImageChange,
		handleAddNewDocument,
		handleDeleteDocument,
		handleDownloadDocument,
		handleSaveJob,
		handleSavePersonal,
		handleSaveBank,
		handleResetPassword,
		handleCancelEdit,
		handleCancelPersonalEdit,
	};
};
