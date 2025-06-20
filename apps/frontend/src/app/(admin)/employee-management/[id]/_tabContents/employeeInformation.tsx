import { Pencil, KeyRound, CheckCircle, XCircle, Loader2 } from "lucide-react";
import React, { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectItem,
	SelectContent,
} from "@/components/ui/select";

interface ValidationState {
	isValidating: boolean;
	isValid: boolean | null;
	message: string;
}

interface EmployeeInformationProps {
	nik: string;
	setNik: (value: string) => void;
	email: string;
	setEmail: (value: string) => void;
	gender: string;
	setGender: (value: string) => void;
	placeOfBirth: string;
	setPlaceOfBirth: (value: string) => void;
	dateOfBirth: string;
	setDateOfBirth: (value: string) => void;
	phone: string;
	setPhone: (value: string) => void;
	lastEducation: string;
	setLastEducation: (value: string) => void;
	taxStatus: string;
	setTaxStatus: (value: string) => void;
	editPersonal: boolean;
	setEditPersonal: (value: boolean) => void;
	handleSavePersonal: () => void;
	handleCancelPersonalEdit: () => void;
	bankName: string;
	setBankName: (value: string) => void;
	bankAccountHolder: string;
	setBankAccountHolder: (value: string) => void;
	bankAccountNumber: string;
	setBankAccountNumber: (value: string) => void;
	editBank: boolean;
	setEditBank: (value: boolean) => void;
	handleSaveBank: () => void;
	handleResetPassword: () => void;
	firstName: string;
	setFirstName: (value: string) => void;
	lastName: string;
	setLastName: (value: string) => void;
	// Validation props
	validationStates: {
		email: ValidationState;
		nik: ValidationState;
		employee_code: ValidationState;
		phone: ValidationState;
	};
	hasValidationErrors: () => boolean;
	validateDateOfBirth: (date: string) => boolean;
	// Reset password loading state
	isResettingPassword?: boolean;
	onResetPasswordComplete?: () => void;
}

const EmployeeInformation: React.FC<EmployeeInformationProps> = ({
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
	lastEducation,
	setLastEducation,
	taxStatus,
	setTaxStatus,
	editPersonal,
	setEditPersonal,
	handleSavePersonal,
	handleCancelPersonalEdit,
	bankName,
	setBankName,
	bankAccountHolder,
	setBankAccountHolder,
	bankAccountNumber,
	setBankAccountNumber,
	editBank,
	setEditBank,
	handleSaveBank,
	handleResetPassword,
	firstName,
	setFirstName,
	lastName,
	setLastName,
	validationStates,
	hasValidationErrors,
	validateDateOfBirth,
	isResettingPassword,
	onResetPasswordComplete,
}) => {
	const [isConfirmingReset, setIsConfirmingReset] = useState(false);

	const handleConfirmResetPassword = async () => {
		setIsConfirmingReset(false);
		await handleResetPassword();
		if (onResetPasswordComplete) {
			onResetPasswordComplete();
		}
	};

	const handleResetPasswordClick = () => {
		if (!email) {
			// Show error toast instead of opening dialog
			return;
		}
		setIsConfirmingReset(true);
	};

	return (
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
			<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
				<CardHeader className="flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700">
					<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
						Personal Information
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() =>
							editPersonal
								? handleCancelPersonalEdit()
								: setEditPersonal(true)
						}
						className="cursor-pointer rounded-md px-4 py-2 text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300"
					>
						<Pencil className="mr-2 h-4 w-4" />
						{editPersonal ? "Cancel" : "Edit"}
					</Button>
				</CardHeader>
				<CardContent className="space-y-4 p-6">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label
								htmlFor="firstName"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								First Name
							</Label>
							<Input
								id="firstName"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								disabled={!editPersonal}
								className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
							/>
						</div>
						<div>
							<Label
								htmlFor="lastName"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Last Name
							</Label>
							<Input
								id="lastName"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								disabled={!editPersonal}
								className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label
								htmlFor="nik"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								NIK
							</Label>
							<div className="relative">
								<Input
									id="nik"
									value={nik}
									onChange={(e) => {
										const { value } = e.target;
										// Only allow numbers and maximum 16 digits
										if (
											/^\d*$/.test(value) &&
											value.length <= 16
										) {
											setNik(value);
										}
									}}
									disabled={!editPersonal}
									placeholder="Enter 16-digit NIK"
									maxLength={16}
									className={(() => {
										const baseClasses =
											"mt-1 border-slate-300 bg-slate-50 pr-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800";
										if (
											editPersonal &&
											validationStates.nik.isValid ===
												false
										) {
											return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500`;
										}
										if (
											editPersonal &&
											validationStates.nik.isValid ===
												true
										) {
											return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-green-500`;
										}
										return baseClasses;
									})()}
								/>
								{editPersonal && (
									<div className="absolute inset-y-0 right-0 flex items-center pr-3">
										{(() => {
											if (
												validationStates.nik
													.isValidating
											) {
												return (
													<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
												);
											}
											if (
												validationStates.nik.isValid ===
												true
											) {
												return (
													<CheckCircle className="h-4 w-4 text-green-500" />
												);
											}
											if (
												validationStates.nik.isValid ===
												false
											) {
												return (
													<XCircle className="h-4 w-4 text-red-500" />
												);
											}
											return null;
										})()}
									</div>
								)}
							</div>
							{editPersonal && validationStates.nik.message && (
								<p className="mt-1 text-xs text-red-500">
									{validationStates.nik.message}
								</p>
							)}
							{editPersonal &&
								!validationStates.nik.message &&
								nik.length > 0 && (
									<p className="mt-1 text-xs text-slate-500">
										{nik.length}/16 digits
									</p>
								)}
						</div>
						<div>
							<Label
								htmlFor="gender"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Gender
							</Label>
							<Select
								value={gender}
								onValueChange={(value) => setGender(value)}
								disabled={!editPersonal}
							>
								<SelectTrigger
									id="gender"
									className="mt-1 w-full cursor-pointer border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
								>
									<SelectValue placeholder="Select gender" />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-slate-800">
									<SelectItem value="Male">Male</SelectItem>
									<SelectItem value="Female">
										Female
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div>
						<Label
							htmlFor="email"
							className="text-sm font-medium text-slate-600 dark:text-slate-400"
						>
							Email
						</Label>
						<div className="relative">
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={!editPersonal}
								className={(() => {
									const baseClasses =
										"mt-1 border-slate-300 bg-slate-50 pr-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800";
									if (
										editPersonal &&
										validationStates.email.isValid === false
									) {
										return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500`;
									}
									if (
										editPersonal &&
										validationStates.email.isValid === true
									) {
										return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-green-500`;
									}
									return baseClasses;
								})()}
							/>
							{editPersonal && (
								<div className="absolute inset-y-0 right-0 flex items-center pr-3">
									{(() => {
										if (
											validationStates.email.isValidating
										) {
											return (
												<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
											);
										}
										if (
											validationStates.email.isValid ===
											true
										) {
											return (
												<CheckCircle className="h-4 w-4 text-green-500" />
											);
										}
										if (
											validationStates.email.isValid ===
											false
										) {
											return (
												<XCircle className="h-4 w-4 text-red-500" />
											);
										}
										return null;
									})()}
								</div>
							)}
						</div>
						{editPersonal && validationStates.email.message && (
							<p className="mt-1 text-xs text-red-500">
								{validationStates.email.message}
							</p>
						)}
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label
								htmlFor="placeOfBirth"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Place of Birth
							</Label>
							<Input
								id="placeOfBirth"
								value={placeOfBirth}
								onChange={(e) =>
									setPlaceOfBirth(e.target.value)
								}
								disabled={!editPersonal}
								className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
							/>
						</div>
						<div>
							<Label
								htmlFor="dateOfBirth"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Date of Birth
							</Label>
							<Input
								id="dateOfBirth"
								type="date"
								value={dateOfBirth}
								onChange={(e) => {
									const { value } = e.target;
									if (value && editPersonal) {
										if (!validateDateOfBirth(value)) {
											return;
										}
									}
									setDateOfBirth(value);
								}}
								disabled={!editPersonal}
								max={
									new Date(
										new Date().setFullYear(
											new Date().getFullYear() - 16
										)
									)
										.toISOString()
										.split("T")[0]
								}
								min={
									new Date(
										new Date().setFullYear(
											new Date().getFullYear() - 100
										)
									)
										.toISOString()
										.split("T")[0]
								}
								className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
							/>
							{/* {editPersonal && (
                <p className='mt-1 text-xs text-slate-500'>
                  Employee must be valid
                </p>
              )} */}
						</div>
					</div>
					<div>
						<Label
							htmlFor="phone"
							className="text-sm font-medium text-slate-600 dark:text-slate-400"
						>
							Phone Number
						</Label>
						<div className="relative">
							<Input
								id="phone"
								value={phone}
								onChange={(e) => {
									const { value } = e.target;
									// Only allow numbers and + symbol, + only at the beginning
									if (/^(\+?\d*)$/.test(value)) {
										setPhone(value);
									}
								}}
								disabled={!editPersonal}
								placeholder="e.g., +628123456789"
								className={(() => {
									const baseClasses =
										"mt-1 border-slate-300 bg-slate-50 pr-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800";
									if (
										editPersonal &&
										validationStates.phone.isValid === false
									) {
										return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-red-500`;
									}
									if (
										editPersonal &&
										validationStates.phone.isValid === true
									) {
										return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-green-500`;
									}
									return baseClasses;
								})()}
							/>
							{editPersonal && (
								<div className="absolute inset-y-0 right-0 flex items-center pr-3">
									{(() => {
										if (
											validationStates.phone.isValidating
										) {
											return (
												<Loader2 className="h-4 w-4 animate-spin text-blue-500" />
											);
										}
										if (
											validationStates.phone.isValid ===
											true
										) {
											return (
												<CheckCircle className="h-4 w-4 text-green-500" />
											);
										}
										if (
											validationStates.phone.isValid ===
											false
										) {
											return (
												<XCircle className="h-4 w-4 text-red-500" />
											);
										}
										return null;
									})()}
								</div>
							)}
						</div>
						{editPersonal && validationStates.phone.message && (
							<p className="mt-1 text-xs text-red-500">
								{validationStates.phone.message}
							</p>
						)}
						{editPersonal && !validationStates.phone.message && (
							<p className="mt-1 text-xs text-slate-500">
								Phone number must start with country code (e.g.,
								+62) and be at least 10 digits
							</p>
						)}
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label
								htmlFor="taxStatus"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Tax Status
							</Label>
							<Select
								value={taxStatus}
								onValueChange={(value) => setTaxStatus(value)}
								disabled={!editPersonal}
							>
								<SelectTrigger
									id="taxStatus"
									className="mt-1 w-full cursor-pointer border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
								>
									<SelectValue placeholder="Select tax status" />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-slate-800">
									<SelectItem value="TK/0">TK/0</SelectItem>
									<SelectItem value="TK/1">TK/1</SelectItem>
									<SelectItem value="TK/2">TK/2</SelectItem>
									<SelectItem value="TK/3">TK/3</SelectItem>
									<SelectItem value="K/0">K/0</SelectItem>
									<SelectItem value="K/1">K/1</SelectItem>
									<SelectItem value="K/2">K/2</SelectItem>
									<SelectItem value="K/3">K/3</SelectItem>
									<SelectItem value="K/I/0">K/I/0</SelectItem>
									<SelectItem value="K/I/1">K/I/1</SelectItem>
									<SelectItem value="K/I/2">K/I/2</SelectItem>
									<SelectItem value="K/I/3">K/I/3</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label
								htmlFor="lastEducation"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Last Education
							</Label>
							<Select
								value={lastEducation}
								onValueChange={(value) =>
									setLastEducation(value)
								}
								disabled={!editPersonal}
							>
								<SelectTrigger
									id="lastEducation"
									className="mt-1 w-full cursor-pointer border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
								>
									<SelectValue placeholder="Select education level" />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-slate-800">
									<SelectItem value="SD">SD</SelectItem>
									<SelectItem value="SMP">SMP</SelectItem>
									<SelectItem value="SMA/SMK">
										SMA/SMK
									</SelectItem>
									<SelectItem value="D1">D1</SelectItem>
									<SelectItem value="D2">D2</SelectItem>
									<SelectItem value="D3">D3</SelectItem>
									<SelectItem value="S1/D4">S1/D4</SelectItem>
									<SelectItem value="S2">S2</SelectItem>
									<SelectItem value="S3">S3</SelectItem>
									<SelectItem value="Other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{editPersonal && (
						<div className="text-right">
							<Button
								onClick={handleSavePersonal}
								disabled={hasValidationErrors()}
								className={`cursor-pointer ${
									hasValidationErrors()
										? "cursor-not-allowed bg-slate-400 text-slate-600"
										: "bg-blue-600 text-white hover:bg-blue-700"
								}`}
							>
								Save Changes
							</Button>
							{hasValidationErrors() && (
								<p className="mt-2 text-xs text-red-500">
									Please fix validation errors before saving
								</p>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<div className="flex flex-col gap-6">
				<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700">
						<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
							Bank Information
						</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setEditBank(!editBank)}
							className="cursor-pointer rounded-md px-4 py-2 text-blue-600 transition-colors duration-150 hover:bg-slate-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-slate-700/50 dark:hover:text-blue-300"
						>
							<Pencil className="mr-2 h-4 w-4" />
							{editBank ? "Cancel" : "Edit"}
						</Button>
					</CardHeader>
					<CardContent className="space-y-4 p-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<Label
									htmlFor="bankName"
									className="text-sm font-medium text-slate-600 dark:text-slate-400"
								>
									Bank Name
								</Label>
								<Input
									id="bankName"
									value={bankName}
									onChange={(e) =>
										setBankName(e.target.value)
									}
									disabled={!editBank}
									className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
								/>
							</div>
							<div>
								<Label
									htmlFor="bankAccountHolder"
									className="text-sm font-medium text-slate-600 dark:text-slate-400"
								>
									Account Holder Name
								</Label>
								<Input
									id="bankAccountHolder"
									value={bankAccountHolder}
									onChange={(e) =>
										setBankAccountHolder(e.target.value)
									}
									disabled={!editBank}
									className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
								/>
							</div>
							<div className="sm:col-span-2">
								<Label
									htmlFor="bankAccountNumber"
									className="text-sm font-medium text-slate-600 dark:text-slate-400"
								>
									Account Number
								</Label>
								<Input
									id="bankAccountNumber"
									value={bankAccountNumber}
									onChange={(e) =>
										setBankAccountNumber(e.target.value)
									}
									disabled={!editBank}
									className="mt-1 border-slate-300 bg-slate-50 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-70 dark:border-slate-600 dark:bg-slate-800"
								/>
							</div>
						</div>
						{editBank && (
							<div className="text-right">
								<Button
									onClick={handleSaveBank}
									className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
								>
									Save Changes
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Account Actions Card */}
				<Card className="border border-slate-100 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between border-b pb-3 dark:border-slate-700">
						<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
							Account Actions
						</CardTitle>
					</CardHeader>
					<CardContent className="flex justify-start p-6">
						<Button
							variant="destructive"
							onClick={handleResetPasswordClick}
							disabled={isResettingPassword || !email}
							className="cursor-pointer"
							title={
								!email
									? "Employee must have an email address to reset password"
									: "Reset password for this employee"
							}
						>
							{isResettingPassword ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<KeyRound className="mr-2 h-4 w-4" />
							)}
							{isResettingPassword
								? "Sending..."
								: "Reset Password"}
						</Button>
						{!email && (
							<p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
								Employee must have an email address to reset
								password
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{isConfirmingReset && (
				<AlertDialog
					open={isConfirmingReset}
					onOpenChange={setIsConfirmingReset}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Confirm Reset Password
							</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to reset the password for{" "}
								<strong>
									{firstName} {lastName}
								</strong>
								?
								<br />A password reset email will be sent to{" "}
								<strong>{email}</strong>.
								<br />
								<br />
								This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={isResettingPassword}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleConfirmResetPassword}
								disabled={isResettingPassword}
								className="bg-red-600 hover:bg-red-700"
							>
								{isResettingPassword ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Sending...
									</>
								) : (
									"Send Reset Email"
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</div>
	);
};

export default EmployeeInformation;
