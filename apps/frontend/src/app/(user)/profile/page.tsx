"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useState, ChangeEvent } from "react";
import UserDocumentList, {
	UserDisplayDocument,
} from "./_components/userDocumentList";

// Mock data for the user profile - replace with actual data fetching later
const initialUserData = {
	name: "John Doe",
	email: "john.doe@example.com",
	profileImage: "/avatars/01.png",
	employeeCode: "EMP00123",
	nik: "1234567890123456",
	gender: "Male",
	placeOfBirth: "Jakarta",
	dateOfBirth: "1990-01-01",
	phone: "081234567890",
	address: "Jl. Sudirman No. 1, Jakarta",
	lastEducation: "Bachelor's Degree",
	bankName: "Bank Central Asia",
	bankAccountHolder: "John Doe",
	bankAccountNumber: "1234567890",
	documents: [
		{
			id: 1,
			name: "Employment Contract.pdf",
			uploadedAt: "2023-01-15",
			fileUrl: "/path/to/contract.pdf",
		},
		{
			id: 2,
			name: "ID Card Scan.jpg",
			uploadedAt: "2023-02-01",
			fileUrl: "/path/to/idcard.jpg",
		},
		{ id: 3, name: "NDA.pdf", uploadedAt: "2023-01-20" }, // Example of a document without a direct URL for now
	] as UserDisplayDocument[],
};

export default function ProfilePage() {
	const [previewImage, setPreviewImage] = useState<string | null>(
		initialUserData.profileImage
	);

	const [name, setName] = useState(initialUserData.name);
	const [email, setEmail] = useState(initialUserData.email);
	const [employeeCode] = useState(initialUserData.employeeCode);

	// Personal Info State
	const [nik, setNik] = useState(initialUserData.nik);
	const [gender, setGender] = useState(initialUserData.gender);
	const [placeOfBirth, setPlaceOfBirth] = useState(
		initialUserData.placeOfBirth
	);
	const [dateOfBirth, setDateOfBirth] = useState(initialUserData.dateOfBirth);
	const [phone, setPhone] = useState(initialUserData.phone);
	const [address, setAddress] = useState(initialUserData.address);
	const [lastEducation, setLastEducation] = useState(
		initialUserData.lastEducation
	);
	const [editPersonal, setEditPersonal] = useState(false);

	// Bank Info State
	const [bankName, setBankName] = useState(initialUserData.bankName);
	const [bankAccountHolder, setBankAccountHolder] = useState(
		initialUserData.bankAccountHolder
	);
	const [bankAccountNumber, setBankAccountNumber] = useState(
		initialUserData.bankAccountNumber
	);
	const [editBank, setEditBank] = useState(false);

	// State for user documents
	const [userDocuments] = useState<UserDisplayDocument[]>(
		initialUserData.documents
	);

	// State for Change Password
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setPreviewImage(URL.createObjectURL(file));
			console.log("New profile image selected:", file.name);
		}
	};

	const handleSavePersonal = () => {
		// Logic to save personal information
		console.log("Saving personal info:", {
			name,
			email,
			nik,
			gender,
			placeOfBirth,
			dateOfBirth,
			phone,
			address,
			lastEducation,
		});
		setEditPersonal(false);
	};

	const handleSaveBank = () => {
		// Logic to save bank information
		console.log("Saving bank info:", {
			bankName,
			bankAccountHolder,
			bankAccountNumber,
		});
		setEditBank(false);
	};

	const handleDownloadUserDocument = (doc: UserDisplayDocument) => {
		// Logic to download user document
		// For now, just log and simulate a download if a URL exists
		console.log("Downloading user document:", doc.name);
		if (doc.fileUrl) {
			// In a real app, you might open the URL or trigger a download via an API endpoint
			window.open(doc.fileUrl, "_blank");
		} else {
			console.warn("No file URL available for this document.");
			// Optionally, show a message to the user
		}
	};

	const handleChangePassword = () => {
		// Basic validation: Check if new password and confirm password match
		if (newPassword !== confirmPassword) {
			// In a real app, show an error message to the user
			console.error("New password and confirm password do not match.");
			// You might want to use a toast notification or display an error message in the UI
			alert("New password and confirm password do not match.");
			return;
		}

		// Basic validation: Check if new password is provided
		if (!newPassword) {
			console.error("New password cannot be empty.");
			alert("New password cannot be empty.");
			return;
		}

		// Logic to change password
		console.log("Changing password with:", {
			currentPassword,
			newPassword,
		});
		// Here you would typically call an API to change the password
		// After successful change, you might want to clear the fields:
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		// And show a success message
		alert("Password change submitted (simulated).");
	};

	return (
		<div className="space-y-6 min-h-screen p-4 bg-slate-50 dark:bg-slate-950">
			<h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
				My Profile
			</h1>

			{/* Profile Overview Card */}
			<Card className="overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
						Profile Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row md:items-center items-start gap-6">
						<div className="relative group flex-shrink-0 mx-auto md:mx-0">
							<Image
								src={previewImage || ""}
								alt="Profile Photo"
								width={120}
								height={120}
								className="rounded-full object-cover border-4 border-slate-200 dark:border-slate-700 shadow-md w-[120px] h-[120px]"
							/>
							<label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<Pencil className="h-6 w-6 text-white" />
								<Input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleProfileImageChange}
								/>
							</label>
						</div>
						<div className="flex-1">
							{/* Name item */}
							<div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
								<Label
									htmlFor="profileName"
									className="text-sm font-semibold text-slate-600 dark:text-slate-400"
								>
									Name
								</Label>
								<Input
									id="profileName"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="text-2xl font-bold text-slate-800 dark:text-slate-100 bg-transparent border-0 p-0 focus-visible:ring-0 h-auto text-right"
									readOnly={!editPersonal} // Example: Link editing name to personal info edit state
								/>
							</div>
							{/* Email item */}
							<div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
								<Label
									htmlFor="profileEmail"
									className="text-sm font-semibold text-slate-600 dark:text-slate-400"
								>
									Email
								</Label>
								<Input
									id="profileEmail"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="text-slate-700 dark:text-slate-300 bg-transparent border-0 p-0 focus-visible:ring-0 h-auto text-right"
									readOnly={!editPersonal}
								/>
							</div>
							{/* Employee Code item */}
							<div className="flex items-center justify-between py-3">
								{" "}
								{/* No border on last item */}
								<Label
									htmlFor="profileEmployeeCode"
									className="text-sm font-semibold text-slate-600 dark:text-slate-400"
								>
									Employee Code
								</Label>
								<Input
									id="profileEmployeeCode"
									value={employeeCode}
									className="text-slate-700 dark:text-slate-300 bg-transparent border-0 p-0 focus-visible:ring-0 h-auto text-right"
									readOnly={true}
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Personal and Bank Information Wrapper */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Personal Information Card */}
				<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
							Personal Information
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setEditPersonal(!editPersonal)}
							className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md px-4 py-2 transition-colors duration-150"
						>
							<Pencil className="h-4 w-4 mr-2" />
							{editPersonal ? "Cancel" : "Edit"}
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<Label
									htmlFor="nik"
									className="text-slate-600 dark:text-slate-400"
								>
									NIK
								</Label>
								<Input
									id="nik"
									value={nik}
									onChange={(e) => setNik(e.target.value)}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div>
								<Label
									htmlFor="gender"
									className="text-slate-600 dark:text-slate-400"
								>
									Gender
								</Label>
								<Input
									id="gender"
									value={gender}
									onChange={(e) => setGender(e.target.value)}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div>
								<Label
									htmlFor="placeOfBirth"
									className="text-slate-600 dark:text-slate-400"
								>
									Place of Birth
								</Label>
								<Input
									id="placeOfBirth"
									value={placeOfBirth}
									onChange={(e) =>
										setPlaceOfBirth(e.target.value)
									}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div>
								<Label
									htmlFor="dateOfBirth"
									className="text-slate-600 dark:text-slate-400"
								>
									Date of Birth
								</Label>
								<Input
									id="dateOfBirth"
									type="date"
									value={dateOfBirth}
									onChange={(e) =>
										setDateOfBirth(e.target.value)
									}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div>
								<Label
									htmlFor="phone"
									className="text-slate-600 dark:text-slate-400"
								>
									Phone
								</Label>
								<Input
									id="phone"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div>
								<Label
									htmlFor="lastEducation"
									className="text-slate-600 dark:text-slate-400"
								>
									Last Education
								</Label>
								<Input
									id="lastEducation"
									value={lastEducation}
									onChange={(e) =>
										setLastEducation(e.target.value)
									}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div className="md:col-span-2">
								<Label
									htmlFor="address"
									className="text-slate-600 dark:text-slate-400"
								>
									Address
								</Label>
								<Input
									id="address"
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									readOnly={!editPersonal}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
						</div>
						{editPersonal && (
							<div className="text-right">
								<Button
									onClick={handleSavePersonal}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									Save Personal Info
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Bank Account Card */}
				<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
							Bank Account
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setEditBank(!editBank)}
							className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md px-4 py-2 transition-colors duration-150"
						>
							<Pencil className="h-4 w-4 mr-2" />
							{editBank ? "Cancel" : "Edit"}
						</Button>
					</CardHeader>
					<CardContent className="p-6 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label
									htmlFor="bankName"
									className="text-slate-600 dark:text-slate-400"
								>
									Bank Name
								</Label>
								<Input
									id="bankName"
									value={bankName}
									onChange={(e) =>
										setBankName(e.target.value)
									}
									readOnly={!editBank}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div>
								<Label
									htmlFor="bankAccountHolder"
									className="text-slate-600 dark:text-slate-400"
								>
									Account Holder Name
								</Label>
								<Input
									id="bankAccountHolder"
									value={bankAccountHolder}
									onChange={(e) =>
										setBankAccountHolder(e.target.value)
									}
									readOnly={!editBank}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
							<div className="md:col-span-2">
								<Label
									htmlFor="bankAccountNumber"
									className="text-slate-600 dark:text-slate-400"
								>
									Account Number
								</Label>
								<Input
									id="bankAccountNumber"
									value={bankAccountNumber}
									onChange={(e) =>
										setBankAccountNumber(e.target.value)
									}
									readOnly={!editBank}
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
								/>
							</div>
						</div>
						{editBank && (
							<div className="text-right">
								<Button
									onClick={handleSaveBank}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									Save Bank Info
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* User Documents Card */}
			<UserDocumentList
				currentDocuments={userDocuments}
				handleDownloadDocument={handleDownloadUserDocument}
			/>

			{/* Change Password Card */}
			<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
				<CardHeader>
					<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
						Change Password
					</CardTitle>
				</CardHeader>
				<CardContent className="p-6 space-y-4">
					<div>
						<Label
							htmlFor="currentPassword"
							className="text-slate-600 dark:text-slate-400"
						>
							Current Password
						</Label>
						<Input
							id="currentPassword"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
						/>
					</div>
					<div>
						<Label
							htmlFor="newPassword"
							className="text-slate-600 dark:text-slate-400"
						>
							New Password
						</Label>
						<Input
							id="newPassword"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
						/>
					</div>
					<div>
						<Label
							htmlFor="confirmPassword"
							className="text-slate-600 dark:text-slate-400"
						>
							Confirm New Password
						</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
						/>
					</div>
					<div className="text-right">
						<Button
							onClick={handleChangePassword}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							Change Password
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
