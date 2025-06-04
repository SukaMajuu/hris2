import { useState, useCallback, useEffect } from "react";
import { useEmployeeDetailQuery } from "@/api/queries/employee.queries";
import { useUpdateEmployee } from "@/api/mutations/employee.mutations";
import { useDocumentsByEmployee } from "@/api/queries/document.queries";
import {
	useUploadDocumentForEmployee,
	useDeleteDocument,
} from "@/api/mutations/document.mutations";
import { useToast } from "@/components/ui/use-toast";
import type { Document } from "@/services/document.service";

export interface ClientDocument {
	name: string;
	file: File | null;
	url?: string;
	uploadedAt?: string;
	id?: number;
}

export function useDetailEmployee(employeeId: number) {
	const {
		data: employee,
		isLoading,
		error,
		isError,
	} = useEmployeeDetailQuery(employeeId, !!employeeId);

	const updateEmployeeMutation = useUpdateEmployee();
	const { data: documents = [] } = useDocumentsByEmployee(employeeId);
	const uploadDocumentMutation = useUploadDocumentForEmployee();
	const deleteDocumentMutation = useDeleteDocument();
	const { toast } = useToast();

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
			setBranch(employee.branch_name || "");
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
				toast({
					title: "Info",
					description:
						"Please enable edit mode first to change profile photo.",
					variant: "default",
				});
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
		[editJob, toast]
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
					toast({
						title: "Success",
						description: "Document uploaded successfully!",
					});
					// Clear the input
					e.target.value = "";
				} catch (error) {
					console.error("Error uploading document:", error);
					toast({
						title: "Error",
						description:
							"Failed to upload document. Please try again.",
						variant: "destructive",
					});
				}
			}
		},
		[employeeId, uploadDocumentMutation, toast]
	);

	const handleDeleteDocument = useCallback(
		async (index: number) => {
			const doc = currentDocuments[index];
			if (doc && doc.id) {
				try {
					await deleteDocumentMutation.mutateAsync(doc.id);
					toast({
						title: "Success",
						description: "Document deleted successfully!",
					});
				} catch (error) {
					console.error("Error deleting document:", error);
					toast({
						title: "Error",
						description:
							"Failed to delete document. Please try again.",
						variant: "destructive",
					});
				}
			}
		},
		[currentDocuments, deleteDocumentMutation, toast]
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
		setEditJob(false);
	}, [
		profileFile,
		employee?.profile_photo_url,
		setProfileImage,
		setProfileFile,
	]);

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

			toast({
				title: "Success",
				description: "Job information updated successfully!",
			});

			// Reset profile file state after successful save
			setProfileFile(null);
			setEditJob(false);
		} catch (error) {
			console.error("Error updating job info:", error);
			toast({
				title: "Error",
				description:
					"Failed to update job information. Please try again.",
				variant: "destructive",
			});
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
		toast,
		setProfileFile,
	]);

	const handleSavePersonal = useCallback(async () => {
		if (!employee) return;

		try {
			const updateData = {
				first_name: firstName,
				last_name: lastName,
				nik: nik,
				email: email,
				gender: gender,
				place_of_birth: placeOfBirth,
				date_of_birth: dateOfBirth,
				phone: phone,
				last_education: lastEducation,
				tax_status: taxStatus,
			};

			await updateEmployeeMutation.mutateAsync({
				id: employee.id,
				data: updateData,
			});

			toast({
				title: "Success",
				description: "Personal information updated successfully!",
			});

			setEditPersonal(false);
		} catch (error) {
			console.error("Error updating personal info:", error);
			toast({
				title: "Error",
				description:
					"Failed to update personal information. Please try again.",
				variant: "destructive",
			});
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
		toast,
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

			toast({
				title: "Success",
				description: "Bank information updated successfully!",
			});

			setEditBank(false);
		} catch (error) {
			console.error("Error updating bank info:", error);
			toast({
				title: "Error",
				description:
					"Failed to update bank information. Please try again.",
				variant: "destructive",
			});
		}
	}, [
		employee,
		bankName,
		bankAccountHolder,
		bankAccountNumber,
		updateEmployeeMutation,
		toast,
	]);

	const handleResetPassword = useCallback(() => {
		const newPassword = Math.random().toString(36).slice(-8);
		console.log(
			`Password reset requested for employee ${employee?.id}. New temporary password: ${newPassword}`
		);
		alert(
			`Password has been reset. New temporary password: ${newPassword}`
		);
	}, [employee?.id]);

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
		setEmployeeCode,
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

		handleProfileImageChange,
		handleAddNewDocument,
		handleDeleteDocument,
		handleDownloadDocument,
		handleSaveJob,
		handleSavePersonal,
		handleSaveBank,
		handleResetPassword,
		handleCancelEdit,
	};
}
