"use client";

import { useState, Fragment, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function AddEmployeePage() {
	const [activeStep, setActiveStep] = useState(1);
	const [formData, setFormData] = useState<{
		firstName: string;
		lastName: string;
		nik: string;
		phoneNumber: string;
		gender: string;
		lastEducation: string;
		placeOfBirth: string;
		dateOfBirth: string;
		employeeId: string;
		branch: string;
		position: string;
		grade: string;
		profilePhoto: File | null;
		profilePhotoPreview: string | null;
		bankName: string;
		bankAccountHolder: string;
		bankAccountNumber: string;
		zzz: string;
	}>({
		firstName: "",
		lastName: "",
		nik: "",
		phoneNumber: "",
		gender: "",
		lastEducation: "",
		placeOfBirth: "",
		dateOfBirth: "",
		employeeId: "",
		branch: "",
		position: "",
		grade: "",
		profilePhoto: null,
		profilePhotoPreview: null,
		bankName: "",
		bankAccountHolder: "",
		bankAccountNumber: "",
		zzz: "",
	});

	const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, files } = e.target;
		if (type === "file") {
			setFormData((prev) => ({
				...prev,
				[name]: files && files[0] ? files[0] : null,
				[`${name}Preview`]:
					files && files[0] ? URL.createObjectURL(files[0]) : null,
			}));
			if (name === "profilePhoto" && (!files || !files[0])) {
				if (profilePhotoInputRef.current)
					profilePhotoInputRef.current.value = "";
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const steps = [
		{ label: "Personal Information" },
		{ label: "Employee Information" },
		{ label: "Bank Information" },
		{ label: "Review & Submit" },
	];

	const handleNextStep = () => {
		if (activeStep < steps.length) {
			setActiveStep((prev) => prev + 1);
		}
	};

	const handleBackStep = () => {
		if (activeStep > 1) {
			setActiveStep((prev) => prev - 1);
		}
	};

	const handleRemovePhoto = () => {
		setFormData((prev) => ({
			...prev,
			profilePhoto: null,
			profilePhotoPreview: null,
		}));
		if (profilePhotoInputRef.current)
			profilePhotoInputRef.current.value = "";
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form Submitted:", formData);
		alert("Employee data submitted! (Check console for data)");
	};

	return (
		<div className="max-w-auto mx-auto">
			<div className="mb-6 flex items-center justify-between">
				<Link href="/employee-management">
					<Button
						variant="outline"
						className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Employee List
					</Button>
				</Link>
			</div>
			<Card className="bg-white dark:bg-slate-900 shadow-xl rounded-lg mb-6 border border-slate-200 dark:border-slate-700 p-0">
				<div className="px-4 py-5 sm:px-6 border-b border-slate-200 dark:border-slate-700">
					<h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						Add Employee Data
					</h1>
				</div>

				<div className="p-6 sm:p-8">
					<div className="mb-8 flex w-full items-center">
						{steps.map((step, idx) => (
							<Fragment key={step.label}>
								<div className="flex flex-col items-center">
									<button
										type="button"
										onClick={() => setActiveStep(idx + 1)}
										className={cn(
											"flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-150 hover:cursor-pointer text-sm",
											activeStep === idx + 1
												? "bg-primary border-primary text-white"
												: "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary"
										)}
									>
										{idx + 1}
									</button>
									<span
										className={cn(
											"mt-2 text-center text-xs font-medium",
											activeStep === idx + 1
												? "text-primary dark:text-primary-foreground"
												: "text-slate-500 dark:text-slate-400"
										)}
									>
										{step.label}
									</span>
								</div>

								{idx < steps.length - 1 && (
									<div className="mt-5 h-0.5 flex-1 self-start bg-slate-300 dark:bg-slate-700 mx-2" />
								)}
							</Fragment>
						))}
					</div>

					<div className="mt-8">
						{activeStep === 1 && (
							<>
								<h2 className="text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
									Personal Information
								</h2>
								<Separator
									orientation="horizontal"
									className="mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700"
								/>
								<form>
									<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
										<div>
											<label
												htmlFor="firstName"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												First Name
											</label>
											<Input
												id="firstName"
												name="firstName"
												value={formData.firstName}
												onChange={handleInputChange}
												placeholder="Enter first name"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="lastName"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Last Name
											</label>
											<Input
												id="lastName"
												name="lastName"
												value={formData.lastName}
												onChange={handleInputChange}
												placeholder="Enter last name"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="nik"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												NIK
											</label>
											<Input
												id="nik"
												name="nik"
												value={formData.nik}
												onChange={handleInputChange}
												placeholder="Enter NIK"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="phoneNumber"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Phone Number
											</label>
											<Input
												id="phoneNumber"
												name="phoneNumber"
												value={formData.phoneNumber}
												onChange={handleInputChange}
												placeholder="Enter phone number"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="gender"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Gender
											</label>
											<Select
												value={formData.gender}
												onValueChange={(v) =>
													handleSelectChange(
														"gender",
														v
													)
												}
											>
												<SelectTrigger
													id="gender"
													className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
												>
													<SelectValue placeholder="Choose gender" />
												</SelectTrigger>
												<SelectContent className="bg-white dark:bg-slate-800">
													<SelectItem value="male">
														Male
													</SelectItem>
													<SelectItem value="female">
														Female
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div>
											<label
												htmlFor="lastEducation"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Last Education
											</label>
											<Select
												value={formData.lastEducation}
												onValueChange={(v) =>
													handleSelectChange(
														"lastEducation",
														v
													)
												}
											>
												<SelectTrigger
													id="lastEducation"
													className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
												>
													<SelectValue placeholder="Choose education" />
												</SelectTrigger>
												<SelectContent className="bg-white dark:bg-slate-800">
													<SelectItem value="sma">
														SMA/SMK
													</SelectItem>
													<SelectItem value="d3">
														D3
													</SelectItem>
													<SelectItem value="s1">
														S1
													</SelectItem>
													<SelectItem value="s2">
														S2
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div>
											<label
												htmlFor="placeOfBirth"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Place of Birth
											</label>
											<Input
												id="placeOfBirth"
												name="placeOfBirth"
												value={formData.placeOfBirth}
												onChange={handleInputChange}
												placeholder="Enter place of birth"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="dateOfBirth"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Date of Birth
											</label>
											<Input
												id="dateOfBirth"
												name="dateOfBirth"
												type="date"
												value={formData.dateOfBirth}
												onChange={handleInputChange}
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
									</div>
								</form>
							</>
						)}
						{activeStep === 2 && (
							<>
								<h2 className="text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
									Employee Information
								</h2>
								<Separator
									orientation="horizontal"
									className="mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700"
								/>
								<form>
									<div className="mb-6 flex flex-col items-center">
										<label
											htmlFor="profilePhoto"
											className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400"
										>
											Profile Photo
										</label>
										<Input
											id="profilePhoto"
											type="file"
											name="profilePhoto"
											accept="image/*"
											className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full max-w-xs file:mr-4 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
											onChange={handleInputChange}
											ref={profilePhotoInputRef}
										/>
										{formData.profilePhotoPreview && (
											<>
												<Image
													src={
														formData.profilePhotoPreview
													}
													alt="Profile Preview"
													width={128}
													height={128}
													className="mt-4 h-32 w-32 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md"
												/>
												{formData.profilePhoto && (
													<span className="block mt-2 text-xs text-slate-500 dark:text-slate-400">
														File:{" "}
														{
															formData
																.profilePhoto
																.name
														}
													</span>
												)}
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="mt-3 text-red-600 border-red-500 hover:bg-red-50 dark:border-red-500 dark:hover:bg-red-700/20 dark:text-red-400 dark:hover:text-red-300"
													onClick={handleRemovePhoto}
												>
													Remove Photo
												</Button>
											</>
										)}
									</div>
									<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
										<div>
											<label
												htmlFor="employeeId"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Employee ID
											</label>
											<Input
												id="employeeId"
												name="employeeId"
												value={formData.employeeId}
												onChange={handleInputChange}
												placeholder="Enter employee ID"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="branch"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Branch
											</label>
											<Input
												id="branch"
												name="branch"
												value={formData.branch}
												onChange={handleInputChange}
												placeholder="Enter branch"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="position"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Position
											</label>
											<Input
												id="position"
												name="position"
												value={formData.position}
												onChange={handleInputChange}
												placeholder="Enter position"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="grade"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Grade
											</label>
											<Input
												id="grade"
												name="grade"
												value={formData.grade}
												onChange={handleInputChange}
												placeholder="Enter grade"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
									</div>
								</form>
							</>
						)}
						{activeStep === 3 && (
							<>
								<h2 className="text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
									Bank Information
								</h2>
								<Separator
									orientation="horizontal"
									className="mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700"
								/>
								<form>
									<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
										<div>
											<label
												htmlFor="bankName"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Bank Name
											</label>
											<Input
												id="bankName"
												name="bankName"
												value={formData.bankName}
												onChange={handleInputChange}
												placeholder="Enter bank name"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div>
											<label
												htmlFor="bankAccountHolder"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Account Holder Name
											</label>
											<Input
												id="bankAccountHolder"
												name="bankAccountHolder"
												value={
													formData.bankAccountHolder
												}
												onChange={handleInputChange}
												placeholder="Enter account holder name"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
										<div className="md:col-span-2">
											<label
												htmlFor="bankAccountNumber"
												className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400"
											>
												Account Number
											</label>
											<Input
												id="bankAccountNumber"
												name="bankAccountNumber"
												value={
													formData.bankAccountNumber
												}
												onChange={handleInputChange}
												placeholder="Enter account number"
												className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full"
											/>
										</div>
									</div>
								</form>
							</>
						)}
						{activeStep === 4 && (
							<>
								<h2 className="text-center text-xl font-semibold text-slate-800 dark:text-slate-100">
									Review & Submit
								</h2>
								<Separator
									orientation="horizontal"
									className="mx-auto my-6 w-48 bg-slate-300 dark:bg-slate-700"
								/>
								<div className="space-y-6">
									{/* Personal Information Review */}
									<div>
										<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
											Personal Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
											<ReviewItem
												label="First Name"
												value={formData.firstName}
											/>
											<ReviewItem
												label="Last Name"
												value={formData.lastName}
											/>
											<ReviewItem
												label="NIK"
												value={formData.nik}
											/>
											<ReviewItem
												label="Phone Number"
												value={formData.phoneNumber}
											/>
											<ReviewItem
												label="Gender"
												value={formData.gender}
											/>
											<ReviewItem
												label="Last Education"
												value={formData.lastEducation}
											/>
											<ReviewItem
												label="Place of Birth"
												value={formData.placeOfBirth}
											/>
											<ReviewItem
												label="Date of Birth"
												value={formData.dateOfBirth}
											/>
										</div>
									</div>

									{/* Employee Information Review */}
									<div>
										<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
											Employee Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
											<ReviewItem
												label="Employee ID"
												value={formData.employeeId}
											/>
											<ReviewItem
												label="Branch"
												value={formData.branch}
											/>
											<ReviewItem
												label="Position"
												value={formData.position}
											/>
											<ReviewItem
												label="Grade"
												value={formData.grade}
											/>
											{formData.profilePhotoPreview && (
												<div className="md:col-span-2 mt-2">
													<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
														Profile Photo:
													</p>
													<Image
														src={
															formData.profilePhotoPreview
														}
														alt="Profile Preview"
														width={100}
														height={100}
														className="mt-1 rounded-md object-cover border border-slate-200 dark:border-slate-700"
													/>
												</div>
											)}
										</div>
									</div>

									{/* Bank Information Review */}
									<div>
										<h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
											Bank Information
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
											<ReviewItem
												label="Bank Name"
												value={formData.bankName}
											/>
											<ReviewItem
												label="Account Holder Name"
												value={
													formData.bankAccountHolder
												}
											/>
											<ReviewItem
												label="Account Number"
												value={
													formData.bankAccountNumber
												}
											/>
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					<div className="mt-8 flex justify-end gap-3">
						{activeStep > 1 && (
							<Button
								type="button"
								variant={"outline"}
								onClick={handleBackStep}
								className="border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
							>
								Back
							</Button>
						)}
						{activeStep < steps.length ? (
							<Button
								type="button"
								onClick={handleNextStep}
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								Next
							</Button>
						) : (
							<Button
								type="submit"
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
								onClick={handleSubmit}
							>
								Submit
							</Button>
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}

const ReviewItem = ({
	label,
	value,
}: {
	label: string;
	value: string | undefined | null;
}) => (
	<div>
		<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
			{label}
		</p>
		<p className="text-slate-700 dark:text-slate-300">{value || "-"}</p>
	</div>
);
