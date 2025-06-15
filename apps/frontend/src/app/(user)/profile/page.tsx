"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Pencil,
	CheckCircle,
	XCircle,
	Loader2,
	Eye,
	EyeOff,
} from "lucide-react";
import UserDocumentList from "./_components/userDocumentList";
import { useProfile } from "./_hooks/useProfile";
import { useState } from "react";

export default function ProfilePage() {
	const {
		// Data
		employee,
		isLoading,
		error,
		currentDocuments,

		// Profile image
		profileImage,

		// Personal information
		firstName,
		setFirstName,
		lastName,
		setLastName,
		email,
		setEmail,
		employeeCode,
		nik,
		setNik,
		gender,
		setGender,
		placeOfBirth,
		setPlaceOfBirth,
		dateOfBirth,
		setDateOfBirth,
		phone,
		setPhone,
		lastEducation,
		setLastEducation,
		editPersonal,
		setEditPersonal,

		// Bank information
		bankName,
		setBankName,
		bankAccountHolder,
		setBankAccountHolder,
		bankAccountNumber,
		setBankAccountNumber,
		editBank,
		setEditBank,

		// Password change
		currentPassword,
		setCurrentPassword,
		newPassword,
		setNewPassword,
		confirmPassword,
		setConfirmPassword,

		// Phone validation
		phoneValidation,

		// Password validation
		passwordValidation,
		confirmPasswordValidation,
		isChangingPassword,

		// Handlers
		handleProfileImageChange,
		handleDownloadDocument,
		handleCancelEdit,
		handleSavePersonal,
		handleSaveBank,
		handleChangePassword,

		// Form validation
		isPersonalFormValid,
		validateDateOfBirth,
	} = useProfile();

	// Password visibility states
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [
		isConfirmingPasswordChange,
		setIsConfirmingPasswordChange,
	] = useState(false);

	if (isLoading) {
		return (
			<div className="p-6 text-center text-slate-500 dark:text-slate-400">
				Loading profile data...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center text-red-500 dark:text-red-400">
				Error loading profile: {error.message}
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="p-6 text-center text-slate-500 dark:text-slate-400">
				Profile not found.
			</div>
		);
	}

	const fullName = [firstName, lastName].filter(Boolean).join(" ");

	return (
		<div className="min-h-screen space-y-4 bg-slate-50 p-3 md:space-y-6 md:p-4 dark:bg-slate-950">
			<h1 className="text-xl font-semibold text-slate-800 md:text-2xl dark:text-slate-100">
				My Profile
			</h1>

			{/* Profile Overview Card */}
			<Card className="overflow-hidden border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
				<CardHeader className="pb-4">
					<CardTitle className="text-base font-semibold text-slate-800 md:text-lg dark:text-slate-100">
						Profile Overview
					</CardTitle>
				</CardHeader>
				<CardContent className="pb-6">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
						{/* Profile Image */}
						<div className="group relative mx-auto flex-shrink-0 cursor-pointer md:mx-0">
							<Image
								src={profileImage || "/logo.png"}
								alt="Profile Photo"
								width={100}
								height={100}
								className="h-[80px] w-[80px] rounded-full border-4 border-slate-200 object-cover shadow-md md:h-[120px] md:w-[120px] dark:border-slate-700"
							/>
							<label className="bg-opacity-50 absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-100">
								<Pencil className="h-4 w-4 text-white md:h-6 md:w-6" />
								<Input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleProfileImageChange}
								/>
							</label>
						</div>

						{/* Profile Info */}
						<div className="flex-1 space-y-3">
							{/* Name item */}
							<div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
								<Label
									htmlFor="profileName"
									className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400"
								>
									Name
								</Label>
								<div className="text-lg font-bold text-slate-800 sm:text-right sm:text-xl md:text-2xl dark:text-slate-100">
									{fullName}
								</div>
							</div>

							{/* Email item */}
							<div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
								<Label
									htmlFor="profileEmail"
									className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400"
								>
									Email
								</Label>
								<div className="text-sm text-slate-700 sm:text-right sm:text-base dark:text-slate-300">
									{email}
								</div>
							</div>

							{/* Employee Code item */}
							<div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
								<Label
									htmlFor="profileEmployeeCode"
									className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400"
								>
									Employee Code
								</Label>
								<div className="text-sm text-slate-700 sm:text-right sm:text-base dark:text-slate-300">
									{employeeCode}
								</div>
							</div>

							{/* Branch item */}
							<div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
								<Label
									htmlFor="profileBranch"
									className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400"
								>
									Branch
								</Label>
								<div className="text-sm text-slate-700 sm:text-right sm:text-base dark:text-slate-300">
									{employee?.branch || "Not assigned"}
								</div>
							</div>

							{/* Position item */}
							<div className="flex flex-col gap-1 pb-0 sm:flex-row sm:items-center sm:justify-between">
								<Label
									htmlFor="profilePosition"
									className="text-xs font-semibold text-slate-600 sm:text-sm dark:text-slate-400"
								>
									Position
								</Label>
								<div className="text-sm text-slate-700 sm:text-right sm:text-base dark:text-slate-300">
									{employee?.position_name || "Not assigned"}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Personal and Bank Information Wrapper */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
				{/* Personal Information Card */}
				<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between pb-4">
						<CardTitle className="text-base font-semibold text-slate-800 md:text-lg dark:text-slate-100">
							Personal Information
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								editPersonal
									? handleCancelEdit()
									: setEditPersonal(true)
							}
							className="cursor-pointer rounded-md px-3 py-2 text-xs text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 md:px-4 md:text-sm dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300"
						>
							<Pencil className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
							{editPersonal ? "Cancel" : "Edit"}
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
							<div>
								<Label
									htmlFor="firstName"
									className="text-slate-600 dark:text-slate-400"
								>
									First Name
								</Label>
								<Input
									id="firstName"
									value={firstName}
									onChange={(e) =>
										setFirstName(e.target.value)
									}
									readOnly={!editPersonal}
									className={`mt-1 ${
										editPersonal
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
								/>
							</div>
							<div>
								<Label
									htmlFor="lastName"
									className="text-slate-600 dark:text-slate-400"
								>
									Last Name
								</Label>
								<Input
									id="lastName"
									value={lastName}
									onChange={(e) =>
										setLastName(e.target.value)
									}
									readOnly={!editPersonal}
									className={`mt-1 ${
										editPersonal
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
								/>
							</div>
							<div>
								<Label
									htmlFor="email"
									className="text-slate-600 dark:text-slate-400"
								>
									Email
								</Label>
								<Input
									id="email"
									type="email"
									value={email}
									readOnly={true}
									className="mt-1 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
								/>
							</div>
							<div>
								<Label
									htmlFor="phone"
									className="text-slate-600 dark:text-slate-400"
								>
									Phone
								</Label>
								<div className="relative">
									<Input
										id="phone"
										type="tel"
										value={phone}
										onChange={(e) => {
											const value = e.target.value;
											if (/^(\+?\d*)$/.test(value)) {
												setPhone(value);
											}
										}}
										readOnly={!editPersonal}
										placeholder="e.g., +628123456789"
										inputMode="tel"
										className={`mt-1 ${
											editPersonal
												? `border-slate-300 bg-white pr-10 text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 ${
														phoneValidation.isValid ===
														false
															? "border-red-500 focus:border-red-500"
															: phoneValidation.isValid ===
															  true
															? "border-green-500 focus:border-green-500"
															: ""
												  }`
												: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
										}`}
									/>
									{editPersonal && (
										<div className="absolute top-1/2 right-3 -translate-y-1/2">
											{phoneValidation.isValidating && (
												<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
											)}
											{!phoneValidation.isValidating &&
												phoneValidation.isValid ===
													true && (
													<CheckCircle className="h-4 w-4 text-green-500" />
												)}
											{!phoneValidation.isValidating &&
												phoneValidation.isValid ===
													false && (
													<XCircle className="h-4 w-4 text-red-500" />
												)}
										</div>
									)}
								</div>
								{editPersonal && phoneValidation.message && (
									<p className="mt-1 text-sm text-red-500">
										{phoneValidation.message}
									</p>
								)}
								{editPersonal && !phoneValidation.message && (
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										Phone number must start with country
										code (e.g., +62) and be at least 10
										digits
									</p>
								)}
							</div>
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
									readOnly={true}
									className="mt-1 cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
								/>
							</div>
							<div>
								<Label
									htmlFor="gender"
									className="text-slate-600 dark:text-slate-400"
								>
									Gender
								</Label>
								{editPersonal ? (
									<Select
										value={gender}
										onValueChange={setGender}
									>
										<SelectTrigger className="mt-1 cursor-pointer border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
											<SelectValue placeholder="Select gender" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Male">
												Male
											</SelectItem>
											<SelectItem value="Female">
												Female
											</SelectItem>
										</SelectContent>
									</Select>
								) : (
									<Input
										id="gender"
										value={gender}
										readOnly={true}
										className="mt-1 border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									/>
								)}
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
									className={`mt-1 ${
										editPersonal
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
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
									onChange={(e) => {
										const value = e.target.value;
										if (value && editPersonal) {
											if (!validateDateOfBirth(value)) {
												return;
											}
										}
										setDateOfBirth(value);
									}}
									readOnly={!editPersonal}
									max={
										editPersonal
											? new Date(
													new Date().setFullYear(
														new Date().getFullYear() -
															16
													)
											  )
													.toISOString()
													.split("T")[0]
											: undefined
									}
									min={
										editPersonal
											? new Date(
													new Date().setFullYear(
														new Date().getFullYear() -
															100
													)
											  )
													.toISOString()
													.split("T")[0]
											: undefined
									}
									className={`mt-1 ${
										editPersonal
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
								/>
							</div>
							<div className="sm:col-span-2">
								<Label
									htmlFor="lastEducation"
									className="text-slate-600 dark:text-slate-400"
								>
									Last Education
								</Label>
								{editPersonal ? (
									<Select
										value={lastEducation}
										onValueChange={setLastEducation}
									>
										<SelectTrigger className="mt-1 cursor-pointer border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100">
											<SelectValue placeholder="Select education level" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="SD">
												SD (Elementary School)
											</SelectItem>
											<SelectItem value="SMP">
												SMP (Junior High School)
											</SelectItem>
											<SelectItem value="SMA/SMK">
												SMA/SMK (Senior High School)
											</SelectItem>
											<SelectItem value="D1">
												D1 (Diploma 1)
											</SelectItem>
											<SelectItem value="D2">
												D2 (Diploma 2)
											</SelectItem>
											<SelectItem value="D3">
												D3 (Diploma 3)
											</SelectItem>
											<SelectItem value="S1/D4">
												S1/D4 (Bachelor Degree)
											</SelectItem>
											<SelectItem value="S2">
												S2 (Master Degree)
											</SelectItem>
											<SelectItem value="S3">
												S3 (Doctorate)
											</SelectItem>
											<SelectItem value="Other">
												Other
											</SelectItem>
										</SelectContent>
									</Select>
								) : (
									<Input
										id="lastEducation"
										value={lastEducation}
										readOnly={true}
										className="mt-1 border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									/>
								)}
							</div>
						</div>
						{editPersonal && (
							<div className="text-right">
								<Button
									onClick={handleSavePersonal}
									disabled={!isPersonalFormValid()}
									className={`cursor-pointer text-white ${
										isPersonalFormValid()
											? "bg-blue-600 hover:bg-blue-700"
											: "cursor-not-allowed bg-gray-400 hover:bg-gray-400"
									}`}
								>
									Save Personal Info
								</Button>
								{!isPersonalFormValid() && (
									<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
										{phoneValidation.isValidating
											? "Validating phone number..."
											: phoneValidation.isValid === false
											? "Please fix phone number error"
											: !firstName.trim()
											? "First name is required"
											: "Please complete all required fields"}
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Bank Account Card */}
				<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between pb-4">
						<CardTitle className="text-base font-semibold text-slate-800 md:text-lg dark:text-slate-100">
							Bank Account
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setEditBank(!editBank)}
							className="cursor-pointer rounded-md px-3 py-2 text-xs text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 md:px-4 md:text-sm dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300"
						>
							<Pencil className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
							{editBank ? "Cancel" : "Edit"}
						</Button>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
									className={`mt-1 ${
										editBank
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
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
									className={`mt-1 ${
										editBank
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
								/>
							</div>
							<div className="sm:col-span-2">
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
									className={`mt-1 ${
										editBank
											? "border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
											: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
									}`}
								/>
							</div>
						</div>
						{editBank && (
							<div className="text-right">
								<Button
									onClick={handleSaveBank}
									className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
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
				currentDocuments={currentDocuments}
				handleDownloadDocument={handleDownloadDocument}
			/>

			{/* Change Password Card */}
			<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
				<CardHeader className="pb-4">
					<CardTitle className="text-base font-semibold text-slate-800 md:text-lg dark:text-slate-100">
						Change Password
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label
							htmlFor="currentPassword"
							className="text-slate-600 dark:text-slate-400"
						>
							Current Password
						</Label>
						<div className="relative">
							<Input
								id="currentPassword"
								type={showCurrentPassword ? "text" : "password"}
								value={currentPassword}
								onChange={(e) =>
									setCurrentPassword(e.target.value)
								}
								className="mt-1 border-slate-300 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
								placeholder="Enter your current password"
							/>
							<button
								type="button"
								onClick={() =>
									setShowCurrentPassword(!showCurrentPassword)
								}
								className="absolute inset-y-0 right-0 flex items-center pt-1 pr-3"
							>
								{showCurrentPassword ? (
									<EyeOff className="h-4 w-4 text-slate-500" />
								) : (
									<Eye className="h-4 w-4 text-slate-500" />
								)}
							</button>
						</div>
					</div>

					<div>
						<Label
							htmlFor="newPassword"
							className="text-slate-600 dark:text-slate-400"
						>
							New Password
						</Label>
						<div className="relative">
							<Input
								id="newPassword"
								type={showNewPassword ? "text" : "password"}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className={`mt-1 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
									passwordValidation.isValid === false
										? "border-red-500 focus:border-red-500 focus:ring-red-500"
										: passwordValidation.isValid === true
										? "border-green-500 focus:border-green-500 focus:ring-green-500"
										: "border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600"
								}`}
								placeholder="Enter your new password"
							/>
							{/* Eye toggle button */}
							<button
								type="button"
								onClick={() =>
									setShowNewPassword(!showNewPassword)
								}
								className="absolute inset-y-0 right-0 flex items-center pt-1 pr-3"
							>
								{showNewPassword ? (
									<EyeOff className="h-4 w-4 text-slate-500" />
								) : (
									<Eye className="h-4 w-4 text-slate-500" />
								)}
							</button>
							{/* Validation icon */}
							{newPassword && (
								<div className="absolute inset-y-0 right-10 flex items-center pt-1">
									{passwordValidation.isValid === true ? (
										<CheckCircle className="h-4 w-4 text-green-500" />
									) : passwordValidation.isValid === false ? (
										<XCircle className="h-4 w-4 text-red-500" />
									) : null}
								</div>
							)}
						</div>
						{/* Password requirements */}
						{newPassword && (
							<div className="mt-2 space-y-1">
								<p className="text-xs text-slate-600 dark:text-slate-400">
									Password requirements:
								</p>
								<ul className="space-y-1 text-xs">
									<li
										className={`flex items-center ${
											newPassword.length >= 8
												? "text-green-600"
												: "text-red-500"
										}`}
									>
										{newPassword.length >= 8 ? "✓" : "✗"} At
										least 8 characters
									</li>
									<li
										className={`flex items-center ${
											/(?=.*[A-Z])/.test(newPassword)
												? "text-green-600"
												: "text-red-500"
										}`}
									>
										{/(?=.*[A-Z])/.test(newPassword)
											? "✓"
											: "✗"}{" "}
										One uppercase letter
									</li>
									<li
										className={`flex items-center ${
											/(?=.*[a-z])/.test(newPassword)
												? "text-green-600"
												: "text-red-500"
										}`}
									>
										{/(?=.*[a-z])/.test(newPassword)
											? "✓"
											: "✗"}{" "}
										One lowercase letter
									</li>
									<li
										className={`flex items-center ${
											/(?=.*\d)/.test(newPassword)
												? "text-green-600"
												: "text-red-500"
										}`}
									>
										{/(?=.*\d)/.test(newPassword)
											? "✓"
											: "✗"}{" "}
										One number
									</li>
								</ul>
							</div>
						)}
					</div>

					<div>
						<Label
							htmlFor="confirmPassword"
							className="text-slate-600 dark:text-slate-400"
						>
							Confirm New Password
						</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								className={`mt-1 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus:ring-2 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${
									confirmPasswordValidation.isValid === false
										? "border-red-500 focus:border-red-500 focus:ring-red-500"
										: confirmPasswordValidation.isValid ===
										  true
										? "border-green-500 focus:border-green-500 focus:ring-green-500"
										: "border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600"
								}`}
								placeholder="Confirm your new password"
							/>
							{/* Eye toggle button */}
							<button
								type="button"
								onClick={() =>
									setShowConfirmPassword(!showConfirmPassword)
								}
								className="absolute inset-y-0 right-0 flex items-center pt-1 pr-3"
							>
								{showConfirmPassword ? (
									<EyeOff className="h-4 w-4 text-slate-500" />
								) : (
									<Eye className="h-4 w-4 text-slate-500" />
								)}
							</button>
							{/* Validation icon */}
							{confirmPassword && (
								<div className="absolute inset-y-0 right-10 flex items-center pt-1">
									{confirmPasswordValidation.isValid ===
									true ? (
										<CheckCircle className="h-4 w-4 text-green-500" />
									) : confirmPasswordValidation.isValid ===
									  false ? (
										<XCircle className="h-4 w-4 text-red-500" />
									) : null}
								</div>
							)}
						</div>
						{confirmPasswordValidation.message && (
							<p className="mt-1 text-xs text-red-500">
								{confirmPasswordValidation.message}
							</p>
						)}
					</div>

					<div className="text-right">
						<Button
							onClick={() => setIsConfirmingPasswordChange(true)}
							disabled={
								isChangingPassword ||
								!currentPassword ||
								!newPassword ||
								!confirmPassword ||
								passwordValidation.isValid !== true ||
								confirmPasswordValidation.isValid !== true
							}
							className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isChangingPassword ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Changing...
								</>
							) : (
								"Change Password"
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Password Change Confirmation Dialog */}
			{isConfirmingPasswordChange && (
				<AlertDialog
					open={isConfirmingPasswordChange}
					onOpenChange={setIsConfirmingPasswordChange}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Confirm Password Change
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to change your password?
								This action will log you out from all devices
								and you&apos;ll need to log in again with your
								new password.
								<br />
								<br />
								This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								disabled={isChangingPassword}
								onClick={() =>
									setIsConfirmingPasswordChange(false)
								}
							>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									await handleChangePassword();
									setIsConfirmingPasswordChange(false);
								}}
								disabled={isChangingPassword}
								className="bg-blue-600 text-white hover:bg-blue-700"
							>
								{isChangingPassword ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Changing...
									</>
								) : (
									"Change Password"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
}
