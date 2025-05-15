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
import { Button } from "@/components/ui/button";
import { Pencil, KeyRound } from "lucide-react";
import React from "react";

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
	address: string;
	setAddress: (value: string) => void;
	lastEducation: string;
	setLastEducation: (value: string) => void;
	editPersonal: boolean;
	setEditPersonal: (value: boolean) => void;
	handleSavePersonal: () => void;
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
	name: string;
	setName: (value: string) => void;
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
	address,
	setAddress,
	lastEducation,
	setLastEducation,
	editPersonal,
	setEditPersonal,
	handleSavePersonal,
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
	name,
	setName,
}) => {
	return (
		<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
			<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
				<CardHeader className="flex flex-row items-center justify-between pb-3 border-b dark:border-slate-700">
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
				<CardContent className="p-6 space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<Label
								htmlFor="employeeCardName"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								Name
							</Label>
							<Input
								id="employeeCardName"
								value={name}
								onChange={(e) => setName(e.target.value)}
								disabled={!editPersonal}
								className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
							/>
						</div>
						<div>
							<Label
								htmlFor="nik"
								className="text-sm font-medium text-slate-600 dark:text-slate-400"
							>
								NIK
							</Label>
							<Input
								id="nik"
								value={nik}
								onChange={(e) => setNik(e.target.value)}
								disabled={!editPersonal}
								className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
							/>
						</div>
					</div>
					<div>
						<Label
							htmlFor="email"
							className="text-sm font-medium text-slate-600 dark:text-slate-400"
						>
							Email
						</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={!editPersonal}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
						/>
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
								className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
							>
								<SelectValue placeholder="Select gender" />
							</SelectTrigger>
							<SelectContent className="bg-white dark:bg-slate-800">
								<SelectItem value="Male">Male</SelectItem>
								<SelectItem value="Female">Female</SelectItem>
							</SelectContent>
						</Select>
					</div>
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
							onChange={(e) => setPlaceOfBirth(e.target.value)}
							disabled={!editPersonal}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
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
							onChange={(e) => setDateOfBirth(e.target.value)}
							disabled={!editPersonal}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
						/>
					</div>
					<div>
						<Label
							htmlFor="phone"
							className="text-sm font-medium text-slate-600 dark:text-slate-400"
						>
							Phone Number
						</Label>
						<Input
							id="phone"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							disabled={!editPersonal}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
						/>
					</div>
					<div>
						<Label
							htmlFor="lastEducation"
							className="text-sm font-medium text-slate-600 dark:text-slate-400"
						>
							Last Education
						</Label>
						<Input
							id="lastEducation"
							value={lastEducation}
							onChange={(e) => setLastEducation(e.target.value)}
							disabled={!editPersonal}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
						/>
					</div>
					<div className="sm:col-span-2">
						<Label
							htmlFor="address"
							className="text-sm font-medium text-slate-600 dark:text-slate-400"
						>
							Address
						</Label>
						<Input
							id="address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							disabled={!editPersonal}
							className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
						/>
					</div>
					{editPersonal && (
						<div className="sm:col-span-2 text-right">
							<Button
								onClick={handleSavePersonal}
								className="bg-blue-600 hover:bg-blue-700 text-white"
							>
								Save Changes
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="flex flex-col gap-6">
				<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
					<CardHeader className="flex flex-row items-center justify-between pb-3 border-b dark:border-slate-700">
						<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
							Bank Information
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
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
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
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
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
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
								/>
							</div>
						</div>
						{editBank && (
							<div className="sm:col-span-2 text-right">
								<Button
									onClick={handleSaveBank}
									className="bg-blue-600 hover:bg-blue-700 text-white"
								>
									Save Changes
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Account Actions Card */}
				<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 xl:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between pb-3 border-b dark:border-slate-700">
						<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
							Account Actions
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6 flex justify-start">
						<Button
							variant="destructive"
							onClick={handleResetPassword}
						>
							<KeyRound className="h-4 w-4 mr-2" />
							Reset Password
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default EmployeeInformation;
