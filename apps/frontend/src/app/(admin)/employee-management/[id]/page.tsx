"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, ArrowLeft } from "lucide-react";
import DocumentManagement from "./_tabContents/documentManagement";
import EmployeeInformation from "./_tabContents/employeeInformation";
import { useDetailEmployee } from "./_hooks/useDetailEmployee";

export default function Page() {
	const params = useParams();
	const id = Number(params.id);

	const {
		initialEmployeeData: employee,
		isLoading,
		error,
		profileImage,
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
		handleProfileImageChange,
		handleAddNewDocument,
		handleDeleteDocument,
		handleDownloadDocument,
		handleSaveJob,
		handleSavePersonal,
		handleSaveBank,
		handleResetPassword,
	} = useDetailEmployee(id);

	const [activeTab, setActiveTab] = useState<"personal" | "document">(
		"personal"
	);

	if (isLoading) {
		return (
			<div className="p-6 text-center text-slate-500 dark:text-slate-400">
				Loading employee data...
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 text-center text-red-500 dark:text-red-400">
				Error: {error}
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="p-6 text-center text-slate-500 dark:text-slate-400">
				Employee not found.
			</div>
		);
	}

	return (
		<div className="space-y-6 min-h-screen p-4 md:p-6 bg-slate-50 dark:bg-slate-950">
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
								src={
									profileImage ||
									"https://github.com/shadcn.png"
								}
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
					<EmployeeInformation
						name={name}
						setName={setName}
						nik={nik}
						setNik={setNik}
						email={email}
						setEmail={setEmail}
						gender={gender}
						setGender={setGender}
						placeOfBirth={placeOfBirth}
						setPlaceOfBirth={setPlaceOfBirth}
						dateOfBirth={dateOfBirth}
						setDateOfBirth={setDateOfBirth}
						phone={phone}
						setPhone={setPhone}
						address={address}
						setAddress={setAddress}
						lastEducation={lastEducation}
						setLastEducation={setLastEducation}
						editPersonal={editPersonal}
						setEditPersonal={setEditPersonal}
						handleSavePersonal={handleSavePersonal}
						bankName={bankName}
						setBankName={setBankName}
						bankAccountHolder={bankAccountHolder}
						setBankAccountHolder={setBankAccountHolder}
						bankAccountNumber={bankAccountNumber}
						setBankAccountNumber={setBankAccountNumber}
						editBank={editBank}
						setEditBank={setEditBank}
						handleSaveBank={handleSaveBank}
						handleResetPassword={handleResetPassword}
					/>
				</TabsContent>

				<TabsContent value="document" className="mt-6">
					<DocumentManagement
						currentDocuments={currentDocuments}
						handleAddNewDocument={handleAddNewDocument}
						handleDeleteDocument={handleDeleteDocument}
						handleDownloadDocument={handleDownloadDocument}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
