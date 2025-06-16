import * as XLSX from "xlsx";

import type {
	EmployeeImportData,
	ImportValidationError,
	ImportResult,
} from "./csvImport";

const REQUIRED_FIELDS = ["email", "first_name", "position_name"];
const VALID_GENDERS = ["Male", "Female"];
const VALID_EDUCATION_LEVELS = [
	"SD",
	"SMP",
	"SMA/SMK",
	"D1",
	"D2",
	"D3",
	"S1/D4",
	"S2",
	"S3",
	"Other",
];
const VALID_CONTRACT_TYPES = ["permanent", "contract", "freelance"];
const VALID_TAX_STATUS = [
	"TK/0",
	"TK/1",
	"TK/2",
	"TK/3",
	"K/0",
	"K/1",
	"K/2",
	"K/3",
	"K/I/0",
	"K/I/1",
	"K/I/2",
	"K/I/3",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+[1-9]\d{8,14}$/;
const NIK_REGEX = /^\d{16}$/;
const BANK_ACCOUNT_REGEX = /^\d+$/;

const validateDate = (dateString: string): boolean => {
	if (!dateString) return true; // Optional field
	const date = new Date(dateString);
	return (
		!Number.isNaN(date.getTime()) &&
		!!dateString.match(/^\d{4}-\d{2}-\d{2}$/)
	);
};

const validateAge = (dateOfBirth: string): boolean => {
	if (!dateOfBirth) return true; // Optional field
	const today = new Date();
	const birthDate = new Date(dateOfBirth);
	const age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		return age - 1 >= 16 && age - 1 <= 70;
	}
	return age >= 16 && age <= 70;
};

const normalizeHeader = (header: string): string =>
	header.toLowerCase().trim().replace(/\s+/g, "_");

const convertExcelDate = (excelDate: unknown): string | undefined => {
	if (!excelDate) return undefined;

	// If it's already a string in the right format, return it
	if (typeof excelDate === "string") {
		if (excelDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
			return excelDate;
		}
		// Try to parse other date formats
		const parsed = new Date(excelDate);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed.toISOString().split("T")[0];
		}
		return undefined;
	}

	// If it's a number (Excel date serial)
	if (typeof excelDate === "number") {
		const date = XLSX.SSF.parse_date_code(excelDate);
		if (date) {
			const year = date.y.toString().padStart(4, "0");
			const month = date.m.toString().padStart(2, "0");
			const day = date.d.toString().padStart(2, "0");
			return `${year}-${month}-${day}`;
		}
	}

	// If it's a Date object
	if (excelDate instanceof Date) {
		return excelDate.toISOString().split("T")[0];
	}

	return undefined;
};

const validateRow = (
	row: Record<string, unknown>,
	rowIndex: number
): ImportValidationError[] => {
	const errors: ImportValidationError[] = [];

	// Helper function to safely convert to string
	const toString = (value: unknown): string => {
		if (value === null || value === undefined) return "";
		return String(value);
	};

	// Helper function to safely convert unknown to string | undefined for error values
	const toErrorValue = (value: unknown): string | undefined => {
		if (value === null || value === undefined) return undefined;
		return String(value);
	};

	// Check required fields
	REQUIRED_FIELDS.forEach((field) => {
		const value = toString(row[field]);
		if (!value || value.trim() === "") {
			errors.push({
				row: rowIndex,
				field,
				message: `${field.replace("_", " ")} is required`,
				value: toErrorValue(row[field]),
			});
		}
	});

	// Validate email format
	if (row.email) {
		const emailValue = toString(row.email).trim();
		if (emailValue && !EMAIL_REGEX.test(emailValue)) {
			errors.push({
				row: rowIndex,
				field: "email",
				message: "Invalid email format",
				value: toErrorValue(row.email),
			});
		}
	}

	// Validate phone format
	if (row.phone) {
		const phoneValue = toString(row.phone).trim();
		if (phoneValue && !PHONE_REGEX.test(phoneValue)) {
			let errorMessage = "Phone number format is invalid";

			if (!phoneValue.startsWith("+")) {
				errorMessage =
					"Phone number must start with country code (e.g., +62)";
			} else if (phoneValue.length < 10) {
				errorMessage = "Phone number must be at least 10 digits total";
			} else {
				errorMessage =
					"Phone number format is invalid (e.g., +628123456789)";
			}

			errors.push({
				row: rowIndex,
				field: "phone",
				message: errorMessage,
				value: toErrorValue(row.phone),
			});
		}
	}

	// Validate NIK format
	if (row.nik) {
		const nikValue = toString(row.nik).trim();
		if (nikValue && !NIK_REGEX.test(nikValue)) {
			errors.push({
				row: rowIndex,
				field: "nik",
				message: "NIK must be exactly 16 digits",
				value: toErrorValue(row.nik),
			});
		}
	}

	// Validate gender
	if (row.gender) {
		const genderValue = toString(row.gender).trim();
		if (genderValue && !VALID_GENDERS.includes(genderValue)) {
			errors.push({
				row: rowIndex,
				field: "gender",
				message: `Gender must be one of: ${VALID_GENDERS.join(", ")}`,
				value: toErrorValue(row.gender),
			});
		}
	}

	// Validate education level
	if (row.last_education) {
		const educationValue = toString(row.last_education).trim();
		if (
			educationValue &&
			!VALID_EDUCATION_LEVELS.includes(educationValue)
		) {
			errors.push({
				row: rowIndex,
				field: "last_education",
				message: `Education level must be one of: ${VALID_EDUCATION_LEVELS.join(
					", "
				)}`,
				value: toErrorValue(row.last_education),
			});
		}
	}

	// Validate contract type
	if (row.contract_type) {
		const contractValue = toString(row.contract_type).trim();
		if (contractValue && !VALID_CONTRACT_TYPES.includes(contractValue)) {
			errors.push({
				row: rowIndex,
				field: "contract_type",
				message: `Contract type must be one of: ${VALID_CONTRACT_TYPES.join(
					", "
				)}`,
				value: toErrorValue(row.contract_type),
			});
		}
	}

	// Validate tax status
	if (row.tax_status) {
		const taxValue = toString(row.tax_status).trim();
		if (taxValue && !VALID_TAX_STATUS.includes(taxValue)) {
			errors.push({
				row: rowIndex,
				field: "tax_status",
				message: `Tax status must be one of: ${VALID_TAX_STATUS.join(
					", "
				)}`,
				value: toErrorValue(row.tax_status),
			});
		}
	}

	// Convert and validate dates
	const convertedDateOfBirth = convertExcelDate(row.date_of_birth);
	if (row.date_of_birth && !convertedDateOfBirth) {
		errors.push({
			row: rowIndex,
			field: "date_of_birth",
			message: "Date of birth must be a valid date",
			value: toErrorValue(row.date_of_birth),
		});
	} else if (convertedDateOfBirth && !validateDate(convertedDateOfBirth)) {
		errors.push({
			row: rowIndex,
			field: "date_of_birth",
			message: "Date of birth must be in YYYY-MM-DD format",
			value: convertedDateOfBirth,
		});
	}

	const convertedHireDate = convertExcelDate(row.hire_date);
	if (row.hire_date && !convertedHireDate) {
		errors.push({
			row: rowIndex,
			field: "hire_date",
			message: "Hire date must be a valid date",
			value: toErrorValue(row.hire_date),
		});
	} else if (convertedHireDate && !validateDate(convertedHireDate)) {
		errors.push({
			row: rowIndex,
			field: "hire_date",
			message: "Hire date must be in YYYY-MM-DD format",
			value: convertedHireDate,
		});
	}

	// Validate age
	if (convertedDateOfBirth && !validateAge(convertedDateOfBirth)) {
		errors.push({
			row: rowIndex,
			field: "date_of_birth",
			message: "Age must be between 16 and 70 years",
			value: convertedDateOfBirth,
		});
	}

	// Validate bank account number format
	if (row.bank_account_number) {
		const bankAccountValue = toString(row.bank_account_number).trim();
		if (bankAccountValue && !BANK_ACCOUNT_REGEX.test(bankAccountValue)) {
			errors.push({
				row: rowIndex,
				field: "bank_account_number",
				message: "Bank account number must only contain numbers",
				value: toErrorValue(row.bank_account_number),
			});
		}
	}

	return errors;
};

const checkDuplicates = (
	data: EmployeeImportData[]
): {
	emails: string[];
	niks: string[];
	employeeCodes: string[];
} => {
	const emails = new Set<string>();
	const niks = new Set<string>();
	const employeeCodes = new Set<string>();

	const duplicateEmails = new Set<string>();
	const duplicateNiks = new Set<string>();
	const duplicateEmployeeCodes = new Set<string>();

	data.forEach((row) => {
		if (row.email) {
			if (emails.has(row.email.toLowerCase())) {
				duplicateEmails.add(row.email.toLowerCase());
			} else {
				emails.add(row.email.toLowerCase());
			}
		}

		if (row.nik) {
			if (niks.has(row.nik)) {
				duplicateNiks.add(row.nik);
			} else {
				niks.add(row.nik);
			}
		}

		if (row.employee_code) {
			if (employeeCodes.has(row.employee_code)) {
				duplicateEmployeeCodes.add(row.employee_code);
			} else {
				employeeCodes.add(row.employee_code);
			}
		}
	});

	return {
		emails: Array.from(duplicateEmails),
		niks: Array.from(duplicateNiks),
		employeeCodes: Array.from(duplicateEmployeeCodes),
	};
};

const parseEmployeeExcel = (file: File): Promise<ImportResult> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				if (!e.target || !e.target.result) {
					reject(new Error("Failed to read file content"));
					return;
				}

				const arrayBuffer = e.target.result as ArrayBuffer;
				const workbook = XLSX.read(arrayBuffer, { type: "array" });

				// Get first worksheet
				const sheetName = workbook.SheetNames[0];
				if (!sheetName) {
					reject(new Error("Excel file contains no worksheets"));
					return;
				}

				const worksheet = workbook.Sheets[sheetName];
				if (!worksheet) {
					reject(new Error("Failed to access worksheet"));
					return;
				}

				const jsonData = XLSX.utils.sheet_to_json(worksheet, {
					header: 1,
				});

				if (jsonData.length === 0) {
					reject(new Error("Excel file is empty"));
					return;
				}

				// Get headers and normalize them
				const headerRow = jsonData[0] as string[];
				const headers = headerRow.map(normalizeHeader);
				const dataRows = jsonData.slice(1) as unknown[][];

				const errors: ImportValidationError[] = [];
				const validData: EmployeeImportData[] = [];

				dataRows.forEach((row, index) => {
					// Skip empty rows
					if (
						!row ||
						row.every(
							(cell) => !cell || cell.toString().trim() === ""
						)
					) {
						return;
					}

					const rowData: Record<string, unknown> = {};
					headers.forEach((header, i) => {
						rowData[header] = row[i] ?? "";
					});

					const rowErrors = validateRow(rowData, index + 2); // +2 because Excel rows start from 2 (after header)
					errors.push(...rowErrors);

					if (rowErrors.length === 0) {
						// Helper function to safely convert to string with fallback
						const safeString = (value: unknown): string => {
							if (value === null || value === undefined)
								return "";
							return String(value).trim();
						};

						// Helper function to safely convert to optional string
						const safeOptionalString = (
							value: unknown
						): string | undefined => {
							if (value === null || value === undefined)
								return undefined;
							const str = String(value).trim();
							return str === "" ? undefined : str;
						};

						// Clean and normalize data
						const cleanRow: EmployeeImportData = {
							email:
								safeString(rowData.email).toLowerCase() || "",
							first_name: safeString(rowData.first_name) || "",
							last_name: safeOptionalString(rowData.last_name),
							position_name:
								safeString(rowData.position_name) || "",
							employee_code: safeOptionalString(
								rowData.employee_code
							),
							branch: safeOptionalString(rowData.branch),
							gender:
								(safeOptionalString(rowData.gender) as
									| "Male"
									| "Female") || undefined,
							phone: safeOptionalString(rowData.phone),
							nik: safeOptionalString(rowData.nik),
							place_of_birth: safeOptionalString(
								rowData.place_of_birth
							),
							date_of_birth: convertExcelDate(
								rowData.date_of_birth
							),
							last_education: safeOptionalString(
								rowData.last_education
							),
							grade: safeOptionalString(rowData.grade),
							contract_type:
								(safeOptionalString(rowData.contract_type) as
									| "permanent"
									| "contract"
									| "freelance") || undefined,
							hire_date: convertExcelDate(rowData.hire_date),
							tax_status: safeOptionalString(rowData.tax_status),
							bank_name: safeOptionalString(rowData.bank_name),
							bank_account_number: safeOptionalString(
								rowData.bank_account_number
							),
							bank_account_holder_name: safeOptionalString(
								rowData.bank_account_holder_name
							),
						};

						validData.push(cleanRow);
					}
				});

				const duplicates = checkDuplicates(validData);

				resolve({
					data: validData,
					errors,
					duplicates,
				});
			} catch (error) {
				reject(error);
			}
		};

		reader.onerror = () => {
			reject(new Error("Failed to read Excel file"));
		};

		reader.readAsArrayBuffer(file);
	});

const generateEmployeeExcelTemplate = (): Blob => {
	const headers = [
		"email",
		"first_name",
		"last_name",
		"position_name",
		"employee_code",
		"branch",
		"gender",
		"phone",
		"nik",
		"place_of_birth",
		"date_of_birth",
		"last_education",
		"grade",
		"contract_type",
		"hire_date",
		"tax_status",
		"bank_name",
		"bank_account_number",
		"bank_account_holder_name",
	];

	const sampleData = [
		"john.doe@company.com",
		"John",
		"Doe",
		"Software Engineer",
		"EMP001",
		"Jakarta Branch",
		"Male",
		"+628123456789",
		"1234567890123456",
		"Jakarta",
		"1990-01-15",
		"S1/D4",
		"Senior",
		"permanent",
		"2024-01-15",
		"TK/0",
		"Bank BCA",
		"1234567890",
		"John Doe",
	];

	const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleData]);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

	const excelBuffer = XLSX.write(workbook, {
		bookType: "xlsx",
		type: "array",
	});
	return new Blob([excelBuffer], {
		type:
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
};

const downloadExcelTemplate = () => {
	const blob = generateEmployeeExcelTemplate();
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "employee_template.xlsx";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

export {
	validateDate,
	validateAge,
	normalizeHeader,
	convertExcelDate,
	validateRow,
	parseEmployeeExcel,
	generateEmployeeExcelTemplate,
	downloadExcelTemplate,
};
