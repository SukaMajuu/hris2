export interface EmployeeImportData {
	email: string;
	first_name: string;
	last_name?: string;
	position_name: string;
	employee_code?: string;
	branch?: string;
	gender?: "Male" | "Female";
	phone?: string;
	nik?: string;
	place_of_birth?: string;
	date_of_birth?: string;
	last_education?: string;
	grade?: string;
	contract_type?: "permanent" | "contract" | "freelance";
	hire_date?: string;
	tax_status?: string;
	bank_name?: string;
	bank_account_number?: string;
	bank_account_holder_name?: string;
}

export interface ImportValidationError {
	row: number;
	field: string;
	message: string;
	value?: string;
}

export interface ImportResult {
	data: EmployeeImportData[];
	errors: ImportValidationError[];
	duplicates: {
		emails: string[];
		niks: string[];
		employeeCodes: string[];
	};
}

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

const parseCSV = (csvText: string): string[][] => {
	const rows: string[][] = [];
	let currentRow: string[] = [];
	let currentField = "";
	let inQuotes = false;
	let i = 0;

	while (i < csvText.length) {
		const char = csvText[i];
		const nextChar = csvText[i + 1];

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				currentField += '"';
				i += 2;
			} else {
				inQuotes = !inQuotes;
				i += 1;
			}
		} else if (char === "," && !inQuotes) {
			currentRow.push(currentField.trim());
			currentField = "";
			i += 1;
		} else if ((char === "\n" || char === "\r") && !inQuotes) {
			if (currentField || currentRow.length > 0) {
				currentRow.push(currentField.trim());
				if (currentRow.some((field) => field.length > 0)) {
					rows.push(currentRow);
				}
				currentRow = [];
				currentField = "";
			}
			if (char === "\r" && nextChar === "\n") {
				i += 2;
			} else {
				i += 1;
			}
		} else {
			currentField += char;
			i += 1;
		}
	}

	// Add last field and row if not empty
	if (currentField || currentRow.length > 0) {
		currentRow.push(currentField.trim());
		if (currentRow.some((field) => field.length > 0)) {
			rows.push(currentRow);
		}
	}

	return rows;
};

const normalizeHeader = (header: string): string =>
	header.toLowerCase().trim().replace(/\s+/g, "_");

const validateRow = (
	row: Record<string, string>,
	rowIndex: number
): ImportValidationError[] => {
	const errors: ImportValidationError[] = [];

	// Check required fields
	REQUIRED_FIELDS.forEach((field) => {
		if (!row[field] || row[field].toString().trim() === "") {
			errors.push({
				row: rowIndex,
				field,
				message: `${field.replace("_", " ")} is required`,
				value: row[field],
			});
		}
	});

	// Validate email format
	if (row.email && !EMAIL_REGEX.test(row.email.toString().trim())) {
		errors.push({
			row: rowIndex,
			field: "email",
			message: "Invalid email format",
			value: row.email,
		});
	}

	// Validate phone format
	if (row.phone && !PHONE_REGEX.test(row.phone.toString().trim())) {
		const phoneValue = row.phone.toString().trim();
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
			value: row.phone,
		});
	}

	// Validate NIK format
	if (row.nik && !NIK_REGEX.test(row.nik.toString().trim())) {
		errors.push({
			row: rowIndex,
			field: "nik",
			message: "NIK must be exactly 16 digits",
			value: row.nik,
		});
	}

	// Validate gender
	if (row.gender && !VALID_GENDERS.includes(row.gender.toString().trim())) {
		errors.push({
			row: rowIndex,
			field: "gender",
			message: `Gender must be one of: ${VALID_GENDERS.join(", ")}`,
			value: row.gender,
		});
	}

	// Validate education level
	if (
		row.last_education &&
		!VALID_EDUCATION_LEVELS.includes(row.last_education.toString().trim())
	) {
		errors.push({
			row: rowIndex,
			field: "last_education",
			message: `Education level must be one of: ${VALID_EDUCATION_LEVELS.join(
				", "
			)}`,
			value: row.last_education,
		});
	}

	// Validate contract type
	if (
		row.contract_type &&
		!VALID_CONTRACT_TYPES.includes(row.contract_type.toString().trim())
	) {
		errors.push({
			row: rowIndex,
			field: "contract_type",
			message: `Contract type must be one of: ${VALID_CONTRACT_TYPES.join(
				", "
			)}`,
			value: row.contract_type,
		});
	}

	// Validate tax status
	if (
		row.tax_status &&
		!VALID_TAX_STATUS.includes(row.tax_status.toString().trim())
	) {
		errors.push({
			row: rowIndex,
			field: "tax_status",
			message: `Tax status must be one of: ${VALID_TAX_STATUS.join(
				", "
			)}`,
			value: row.tax_status,
		});
	}

	// Validate dates
	if (
		row.date_of_birth &&
		!validateDate(row.date_of_birth.toString().trim())
	) {
		errors.push({
			row: rowIndex,
			field: "date_of_birth",
			message: "Date of birth must be in YYYY-MM-DD format",
			value: row.date_of_birth,
		});
	}

	if (row.hire_date && !validateDate(row.hire_date.toString().trim())) {
		errors.push({
			row: rowIndex,
			field: "hire_date",
			message: "Hire date must be in YYYY-MM-DD format",
			value: row.hire_date,
		});
	}

	// Validate age
	if (
		row.date_of_birth &&
		!validateAge(row.date_of_birth.toString().trim())
	) {
		errors.push({
			row: rowIndex,
			field: "date_of_birth",
			message: "Age must be between 16 and 70 years",
			value: row.date_of_birth,
		});
	}

	// Validate bank account number format
	if (
		row.bank_account_number &&
		!BANK_ACCOUNT_REGEX.test(row.bank_account_number.toString().trim())
	) {
		errors.push({
			row: rowIndex,
			field: "bank_account_number",
			message: "Bank account number must only contain numbers",
			value: row.bank_account_number,
		});
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

const parseEmployeeCSV = (file: File): Promise<ImportResult> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (e) => {
			try {
				if (!e.target || typeof e.target.result !== "string") {
					reject(new Error("Failed to read file content"));
					return;
				}

				const csvText = e.target.result;
				const rows = parseCSV(csvText);

				if (rows.length === 0) {
					reject(new Error("CSV file is empty"));
					return;
				}

				const firstRow = rows[0];
				if (!firstRow) {
					reject(new Error("CSV file has no header row"));
					return;
				}

				const headers = firstRow.map(normalizeHeader);
				const dataRows = rows.slice(1);

				const errors: ImportValidationError[] = [];
				const validData: EmployeeImportData[] = [];

				dataRows.forEach((row, index) => {
					const rowData: Record<string, string> = {};
					headers.forEach((header, i) => {
						rowData[header] = row[i] || "";
					});

					const rowErrors = validateRow(rowData, index + 2); // +2 because CSV rows start from 2 (after header)
					errors.push(...rowErrors);

					if (rowErrors.length === 0) {
						// Clean and normalize data
						const cleanRow: EmployeeImportData = {
							email:
								rowData.email
									?.toString()
									.trim()
									.toLowerCase() || "",
							first_name:
								rowData.first_name?.toString().trim() || "",
							last_name:
								rowData.last_name?.toString().trim() ||
								undefined,
							position_name:
								rowData.position_name?.toString().trim() || "",
							employee_code:
								rowData.employee_code?.toString().trim() ||
								undefined,
							branch:
								rowData.branch?.toString().trim() || undefined,
							gender:
								(rowData.gender?.toString().trim() as
									| "Male"
									| "Female") || undefined,
							phone:
								rowData.phone?.toString().trim() || undefined,
							nik: rowData.nik?.toString().trim() || undefined,
							place_of_birth:
								rowData.place_of_birth?.toString().trim() ||
								undefined,
							date_of_birth:
								rowData.date_of_birth?.toString().trim() ||
								undefined,
							last_education:
								rowData.last_education?.toString().trim() ||
								undefined,
							grade:
								rowData.grade?.toString().trim() || undefined,
							contract_type:
								(rowData.contract_type?.toString().trim() as
									| "permanent"
									| "contract"
									| "freelance") || undefined,
							hire_date:
								rowData.hire_date?.toString().trim() ||
								undefined,
							tax_status:
								rowData.tax_status?.toString().trim() ||
								undefined,
							bank_name:
								rowData.bank_name?.toString().trim() ||
								undefined,
							bank_account_number:
								rowData.bank_account_number
									?.toString()
									.trim() || undefined,
							bank_account_holder_name:
								rowData.bank_account_holder_name
									?.toString()
									.trim() || undefined,
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
			reject(new Error("Failed to read CSV file"));
		};

		reader.readAsText(file);
	});

const generateEmployeeCSVTemplate = (): string => {
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

	return `${headers.join(",")}\n${sampleData.join(",")}`;
};

const downloadCSVTemplate = () => {
	const csvContent = generateEmployeeCSVTemplate();
	const blob = new Blob([csvContent], { type: "text/csv" });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = "employee_template.csv";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

export { parseEmployeeCSV, downloadCSVTemplate };
