"use client";

import { useParams } from "next/navigation";
import { useEmployeeManagement } from "../_hooks/useEmployeeManagement";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Pencil,
	Trash2,
	Download,
	PlusCircle,
	UploadCloud,
	ArrowLeft,
	KeyRound,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { Employee } from "../_types/employee";

interface ClientDocument {
	name: string;
	file: File | null;
	url?: string;
	uploadedAt?: string;
}

export default function Page() {
	const params = useParams();
	const id = Number(params.id);

	const { employees } = useEmployeeManagement();
	const [employee, setEmployee] = useState<Employee | undefined>(undefined);

	const [name, setName] = useState("");
	const [employeeCode, setEmployeeCode] = useState("");
	const [nik, setNik] = useState("");
	const [email, setEmail] = useState("");
	const [gender, setGender] = useState("");
	const [placeOfBirth, setPlaceOfBirth] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [phone, setPhone] = useState("");
	const [address, setAddress] = useState("");
	const [branch, setBranch] = useState("");
	const [position, setPosition] = useState("");
	const [employmentStatus, setEmploymentStatus] = useState("");
	const [department, setDepartment] = useState("");
	const [grade, setGrade] = useState("");
	const [joinDate, setJoinDate] = useState("");
	const [bankName, setBankName] = useState("");
	const [bankAccountHolder, setBankAccountHolder] = useState("");
	const [bankAccountNumber, setBankAccountNumber] = useState("");
	const [lastEducation, setLastEducation] = useState("");
	const [contractType, setContractType] = useState("");
	const [sp, setSp] = useState("");

	const [activeTab, setActiveTab] = useState<"personal" | "document">(
		"personal"
	);
	const [editPersonal, setEditPersonal] = useState(false);
	const [editJob, setEditJob] = useState(false);
	const [editBank, setEditBank] = useState(false);

	const [currentDocuments, setCurrentDocuments] = useState<ClientDocument[]>(
		[]
	);
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [profileFile, setProfileFile] = useState<File | null>(null);

	useEffect(() => {
		const foundEmployee = employees.find((e) => e.id === id);
		setEmployee(foundEmployee);
	}, [employees, id]);

	useEffect(() => {
		if (employee) {
			setName(employee.name || "");
			setEmployeeCode(employee.employeeCode || "");
			setNik(employee.nik || "");
			setEmail(employee.email || "");
			setGender(employee.gender || "");
			setPlaceOfBirth(employee.placeOfBirth || "");
			setDateOfBirth(employee.dateOfBirth || "");
			setPhone(employee.phone || "");
			setAddress(employee.address || "");
			setBranch(employee.branch || "");
			setPosition(employee.position || "");
			setEmploymentStatus(employee.employmentStatus || "");
			setDepartment(employee.department || "");
			setGrade(employee.grade || "");
			setJoinDate(employee.joinDate || "");
			setBankName(employee.bankName || "");
			setBankAccountHolder(employee.bankAccountHolder || "");
			setBankAccountNumber(employee.bankAccountNumber || "");
			setProfileImage(employee.profilePicture || "/logo.png");
			setLastEducation(employee.lastEducation || "");
			setContractType(employee.contractType || "");
			setSp(employee.sp || "");
			setCurrentDocuments(
				employee.documentMetadata?.map((doc) => ({
					name: doc.name,
					file: null,
					url: doc.url,
					uploadedAt: doc.uploadedAt,
				})) || []
			);
		}
	}, [employee]);

	if (!employee) {
		return (
			<div className="p-6 text-center text-slate-500 dark:text-slate-400">
				Loading employee data or employee not found.
			</div>
		);
	}

	const handleProfileImageChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			setProfileFile(file);
			const reader = new FileReader();
			reader.onload = (ev) => {
				setProfileImage(ev.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleAddNewDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
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
	};

	const handleDeleteDocument = (index: number) => {
		setCurrentDocuments(currentDocuments.filter((_, i) => i !== index));
	};

	const handleDownloadDocument = (doc: ClientDocument) => {
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
	};

	const handleSavePersonal = () => {
		console.log("Saving personal info...");
		console.log("New profile image file:", profileFile);
		setEditPersonal(false);
	};
	const handleSaveJob = () => {
		console.log("Saving job info...");
		setEditJob(false);
	};
	const handleSaveBank = () => {
		console.log("Saving bank info...");
		setEditBank(false);
	};

	const handleResetPassword = () => {
		// Placeholder: Add actual password reset logic here
		// For now, generate a random string and log it
		const newPassword = Math.random().toString(36).slice(-8);
		console.log(
			`Password reset requested for employee ${employee?.id}. New temporary password: ${newPassword}`
		);
		// Ideally, show a confirmation to the user
		alert(
			`Password has been reset. New temporary password: ${newPassword}`
		);
	};

	return (
		<div className="space-y-6 p-4 md:p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
			<div className="mb-6">
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

			<Card className="overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
				<CardHeader className="flex flex-row items-center justify-between pb-3 border-b dark:border-slate-700 ">
					<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
						Employee Overview
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setEditJob(!editJob)}
						className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md px-4 py-2 transition-colors duration-150"
					>
						<Pencil className="h-4 w-4 mr-2" />
						{editJob ? "Cancel Job Edit" : "Edit Job Info"}
					</Button>
				</CardHeader>
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row md:items-center items-start gap-6">
						<div className="relative group flex-shrink-0 mx-auto md:mx-0">
							<Image
								src={profileImage || "/logo.png"}
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
						<div className="flex-1 space-y-4">
							<div>
								<Label
									htmlFor="employeeNameTop"
									className="text-xs font-medium text-slate-500"
								>
									Name
								</Label>
								<p
									id="employeeNameTop"
									className="text-2xl font-bold text-slate-800 dark:text-slate-100"
								>
									{name}
								</p>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
								<div>
									<Label
										htmlFor="employeeCodeTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Employee Code:
									</Label>
									{editJob ? (
										<Input
											id="employeeCodeTop"
											value={employeeCode}
											onChange={(e) =>
												setEmployeeCode(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{employeeCode}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="positionTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Position
									</Label>
									{editJob ? (
										<Input
											id="positionTop"
											value={position}
											onChange={(e) =>
												setPosition(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{position}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="branchTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Branch
									</Label>
									{editJob ? (
										<Input
											id="branchTop"
											value={branch}
											onChange={(e) =>
												setBranch(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{branch}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="employmentStatusTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Employment Status
									</Label>
									{editJob ? (
										<Input
											id="employmentStatusTop"
											value={employmentStatus}
											onChange={(e) =>
												setEmploymentStatus(
													e.target.value
												)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{employmentStatus}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="joinDateTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Join Date
									</Label>
									{editJob ? (
										<Input
											id="joinDateTop"
											type="date"
											value={joinDate}
											onChange={(e) =>
												setJoinDate(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{joinDate}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="departmentTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Department
									</Label>
									{editJob ? (
										<Input
											id="departmentTop"
											value={department}
											onChange={(e) =>
												setDepartment(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{department}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="gradeTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Grade
									</Label>
									{editJob ? (
										<Input
											id="gradeTop"
											value={grade}
											onChange={(e) =>
												setGrade(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{grade}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="contractTypeTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Contract Type
									</Label>
									{editJob ? (
										<Input
											id="contractTypeTop"
											value={contractType}
											onChange={(e) =>
												setContractType(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{contractType}
										</p>
									)}
								</div>
								<div>
									<Label
										htmlFor="spTop"
										className="font-semibold text-slate-600 dark:text-slate-400"
									>
										Warning Letter (SP)
									</Label>
									{editJob ? (
										<Input
											id="spTop"
											value={sp}
											onChange={(e) =>
												setSp(e.target.value)
											}
											className="mt-1 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500"
										/>
									) : (
										<p className="text-slate-700 dark:text-slate-300">
											{sp}
										</p>
									)}
								</div>
							</div>
							{editJob && (
								<div className="mt-4 text-right">
									<Button
										onClick={handleSaveJob}
										className="bg-blue-600 hover:bg-blue-700 text-white"
									>
										Save Job Info
									</Button>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<Tabs
				value={activeTab}
				onValueChange={(value) =>
					setActiveTab(value as "personal" | "document")
				}
				className="w-full"
			>
				<TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:w-auto md:inline-flex bg-white dark:bg-slate-800 shadow-md rounded-lg p-1 border border-slate-200 dark:border-slate-700 h-12">
					<TabsTrigger
						value="personal"
						className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md px-4 py-2 transition-colors duration-150"
					>
						Employee Information
					</TabsTrigger>
					<TabsTrigger
						value="document"
						className="data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:text-slate-50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md px-4 py-2 transition-colors duration-150"
					>
						Employee Document
					</TabsTrigger>
				</TabsList>

				<TabsContent value="personal" className="mt-6">
					<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
						<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
							<CardHeader className="flex flex-row items-center justify-between pb-3 border-b dark:border-slate-700">
								<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
									Personal Information
								</CardTitle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() =>
										setEditPersonal(!editPersonal)
									}
									className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md px-4 py-2 transition-colors duration-150"
								>
									<Pencil className="h-4 w-4 mr-2" />
									{editPersonal ? "Cancel" : "Edit"}
								</Button>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div>
										<Label
											htmlFor="name"
											className="text-sm font-medium text-slate-600 dark:text-slate-400"
										>
											Name
										</Label>
										<Input
											id="name"
											value={name}
											onChange={(e) =>
												setName(e.target.value)
											}
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
											onChange={(e) =>
												setNik(e.target.value)
											}
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
										onChange={(e) =>
											setEmail(e.target.value)
										}
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
										onValueChange={(value) =>
											setGender(value)
										}
										disabled={!editPersonal}
									>
										<SelectTrigger
											id="gender"
											className="mt-1 w-full bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
										>
											<SelectValue placeholder="Select gender" />
										</SelectTrigger>
										<SelectContent className="bg-white dark:bg-slate-800">
											<SelectItem value="Male">
												Male
											</SelectItem>
											<SelectItem value="Female">
												Female
											</SelectItem>
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
										onChange={(e) =>
											setPlaceOfBirth(e.target.value)
										}
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
										onChange={(e) =>
											setDateOfBirth(e.target.value)
										}
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
										onChange={(e) =>
											setPhone(e.target.value)
										}
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
										onChange={(e) =>
											setLastEducation(e.target.value)
										}
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
										onChange={(e) =>
											setAddress(e.target.value)
										}
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

						<div className="flex flex-col gap-4">
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
													setBankAccountHolder(
														e.target.value
													)
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
													setBankAccountNumber(
														e.target.value
													)
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
								<CardContent className="flex justify-start">
									<Button
										variant="destructive"
										onClick={handleResetPassword}
										className="bg-red-600 hover:bg-red-700 text-white"
									>
										<KeyRound className="h-4 w-4 mr-2" />
										Reset Password
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="document" className="mt-6">
					<Card className="shadow-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
						<CardHeader className="flex flex-row items-center justify-between pb-3 border-b dark:border-slate-700">
							<CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">
								Documents
							</CardTitle>
							<div>
								<label
									htmlFor="add-document-input"
									className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-offset-slate-900"
								>
									<UploadCloud className="h-4 w-4 mr-2" />
									Upload New
								</label>
								<Input
									id="add-document-input"
									type="file"
									className="hidden"
									onChange={handleAddNewDocument}
								/>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							{currentDocuments.length === 0 ? (
								<div className="text-center py-10">
									<PlusCircle className="mx-auto h-12 w-12 text-slate-400" />
									<p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
										No documents uploaded yet.
									</p>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow className="border-slate-200 dark:border-slate-700">
											<TableHead className="text-slate-700 dark:text-slate-300">
												No.
											</TableHead>
											<TableHead className="text-slate-700 dark:text-slate-300">
												Document Name
											</TableHead>
											<TableHead className="text-slate-700 dark:text-slate-300">
												Uploaded At
											</TableHead>
											<TableHead className="text-right text-slate-700 dark:text-slate-300">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{currentDocuments.map((doc, idx) => (
											<TableRow
												key={idx}
												className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
											>
												<TableCell className="text-slate-600 dark:text-slate-400">
													{idx + 1}
												</TableCell>
												<TableCell className="font-medium text-slate-800 dark:text-slate-200">
													{doc.name}
												</TableCell>
												<TableCell className="text-slate-600 dark:text-slate-400">
													{doc.uploadedAt
														? new Date(
																doc.uploadedAt
														  ).toLocaleDateString()
														: doc.file
														? "New Upload"
														: "N/A"}
												</TableCell>
												<TableCell className="text-right space-x-2">
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															handleDownloadDocument(
																doc
															)
														}
														className="text-blue-600 hover:text-blue-700 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:border-blue-500 dark:hover:bg-slate-700"
													>
														<Download className="h-4 w-4" />
													</Button>
													<Button
														variant="outline"
														size="icon"
														onClick={() =>
															handleDeleteDocument(
																idx
															)
														}
														className="text-red-600 hover:text-red-700 border-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:border-red-500 dark:hover:bg-slate-700"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
