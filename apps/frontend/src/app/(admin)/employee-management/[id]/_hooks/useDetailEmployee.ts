import { useState, useEffect, useCallback } from "react";
import type { Employee } from "../../_types/employee";
import { useEmployeeManagement } from "../../_hooks/useEmployeeManagement";

export interface ClientDocument {
	name: string;
	file: File | null;
	url?: string;
	uploadedAt?: string;
}

export function useDetailEmployee(employeeId: number | null) {
	const { employees } = useEmployeeManagement();

	const [initialEmployeeData, setInitialEmployeeData] = useState<
		Employee | undefined
	>(undefined);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(undefined);

	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [profileFile, setProfileFile] = useState<File | null>(null);
	const [name, setName] = useState("");
	const [employeeCode, setEmployeeCode] = useState("");
	const [branch, setBranch] = useState("");
	const [position, setPosition] = useState("");
	const [employmentStatus, setEmploymentStatus] = useState("");
	const [department, setDepartment] = useState("");
	const [grade, setGrade] = useState("");
	const [joinDate, setJoinDate] = useState("");
	const [contractType, setContractType] = useState("");
	const [sp, setSp] = useState("");
	const [editJob, setEditJob] = useState(false);

	const [nik, setNik] = useState("");
	const [email, setEmail] = useState("");
	const [gender, setGender] = useState("");
	const [placeOfBirth, setPlaceOfBirth] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [lastEducation, setLastEducation] = useState("");
	const [editPersonal, setEditPersonal] = useState(false);

	const [bankName, setBankName] = useState("");
	const [bankAccountHolder, setBankAccountHolder] = useState("");
	const [bankAccountNumber, setBankAccountNumber] = useState("");
	const [editBank, setEditBank] = useState(false);

	const [currentDocuments, setCurrentDocuments] = useState<ClientDocument[]>(
		[]
	);

	useEffect(() => {
		if (employeeId === null || isNaN(employeeId)) {
			setError("Invalid employee ID.");
			setIsLoading(false);
			setInitialEmployeeData(undefined);
			return;
		}

		const foundEmployee = employees.find((e) => e.id === employeeId);
		setInitialEmployeeData(foundEmployee);
		setIsLoading(false);
		if (!foundEmployee) {
			setError("Employee not found.");
		} else {
			setError(undefined);

			setName(foundEmployee.name || "");
			setEmployeeCode(foundEmployee.employeeCode || "");
			setNik(foundEmployee.nik || "");
			setEmail(foundEmployee.email || "");
			setGender(foundEmployee.gender || "");
			setPlaceOfBirth(foundEmployee.placeOfBirth || "");
			setDateOfBirth(foundEmployee.dateOfBirth || "");
			setPhone(foundEmployee.phone || "");
			setAddress(foundEmployee.address || "");
			setBranch(foundEmployee.branch || "");
			setPosition(foundEmployee.position || "");
			setEmploymentStatus(foundEmployee.employmentStatus || "");
			setDepartment(foundEmployee.department || "");
			setGrade(foundEmployee.grade || "");
			setJoinDate(foundEmployee.joinDate || "");
			setBankName(foundEmployee.bankName || "");
			setBankAccountHolder(foundEmployee.bankAccountHolder || "");
			setBankAccountNumber(foundEmployee.bankAccountNumber || "");
			setProfileImage(foundEmployee.profilePicture || "/logo.png");
			setLastEducation(foundEmployee.lastEducation || "");
			setContractType(foundEmployee.contractType || "");
			setSp(foundEmployee.sp || "");
			setCurrentDocuments(
				foundEmployee.documentMetadata?.map((doc) => ({
					name: doc.name,
					file: null,
					url: doc.url,
					uploadedAt: doc.uploadedAt,
				})) || []
			);
		}
	}, [employeeId, employees]);

	const handleProfileImageChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
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
		[]
	);

	const handleAddNewDocument = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				setCurrentDocuments((prevDocs) => [
					...prevDocs,
					{
						name: file.name,
						file: file,
						url: undefined,
						uploadedAt: new Date().toISOString().split("T")[0],
					},
				]);
			}
		},
		[]
	);

	const handleDeleteDocument = useCallback((index: number) => {
		setCurrentDocuments((prevDocs) =>
			prevDocs.filter((_, i) => i !== index)
		);
	}, []);

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

	// Placeholder save functions
	const handleSaveJob = useCallback(() => {
		console.log("Saving job info...", {
			employeeCode,
			branch,
			position,
			employmentStatus,
			department,
			grade,
			joinDate,
			contractType,
			sp,
		});
		// Here you would typically make an API call
		// For now, we'll just update the initialEmployeeData to simulate a refresh
		// and reflect changes if the user navigates away and back (or on a real fetch)
		if (initialEmployeeData) {
			setInitialEmployeeData((prev) =>
				prev
					? {
							...prev,
							employeeCode,
							branch,
							position,
							employmentStatus,
							department,
							grade,
							joinDate,
							contractType,
							sp,
							profilePicture:
								profileImage === null
									? undefined
									: profileImage,
					  }
					: undefined
			);
		}
		setEditJob(false);
	}, [
		employeeCode,
		branch,
		position,
		employmentStatus,
		department,
		grade,
		joinDate,
		contractType,
		sp,
		profileImage,
		initialEmployeeData,
	]);

	const handleSavePersonal = useCallback(() => {
		console.log("Saving personal info...", {
			nik,
			email,
			gender,
			placeOfBirth,
			dateOfBirth,
			phone,
			address,
			lastEducation,
		});
		if (initialEmployeeData) {
			setInitialEmployeeData((prev) =>
				prev
					? {
							...prev,
							nik,
							email,
							gender,
							placeOfBirth,
							dateOfBirth,
							phone,
							address,
							lastEducation,
							name,
					  }
					: undefined
			);
		}
		setEditPersonal(false);
	}, [
		nik,
		email,
		gender,
		placeOfBirth,
		dateOfBirth,
		phone,
		address,
		lastEducation,
		initialEmployeeData,
		name,
	]);

	const handleSaveBank = useCallback(() => {
		console.log("Saving bank info...", {
			bankName,
			bankAccountHolder,
			bankAccountNumber,
		});
		if (initialEmployeeData) {
			setInitialEmployeeData((prev) =>
				prev
					? {
							...prev,
							bankName,
							bankAccountHolder,
							bankAccountNumber,
					  }
					: undefined
			);
		}
		setEditBank(false);
	}, [bankName, bankAccountHolder, bankAccountNumber, initialEmployeeData]);

	const handleResetPassword = useCallback(() => {
		const newPassword = Math.random().toString(36).slice(-8);
		console.log(
			`Password reset requested for employee ${initialEmployeeData?.id}. New temporary password: ${newPassword}`
		);
		alert(
			`Password has been reset. New temporary password: ${newPassword}`
		);
	}, [initialEmployeeData?.id]);

	return {
		initialEmployeeData,
		isLoading,
		error,

		profileImage,
		setProfileImage,
		profileFile,
		setProfileFile,
		name,
		setName,
		employeeCode,
		setEmployeeCode,
		branch,
		setBranch,
		position,
		setPosition,
		employmentStatus,
		setEmploymentStatus,
		department,
		setDepartment,
		grade,
		setGrade,
		joinDate,
		setJoinDate,
		contractType,
		setContractType,
		sp,
		setSp,
		editJob,
		setEditJob,

		nik,
		setNik,
		email,
		setEmail,
		gender,
		setGender,
		placeOfBirth,
		setPlaceOfBirth,
		dateOfBirth,
		setDateOfBirth,
		phone,
		setPhone,
		address,
		setAddress,
		lastEducation,
		setLastEducation,
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
		setCurrentDocuments,

		handleProfileImageChange,
		handleAddNewDocument,
		handleDeleteDocument,
		handleDownloadDocument,
		handleSaveJob,
		handleSavePersonal,
		handleSaveBank,
		handleResetPassword,
	};
}
