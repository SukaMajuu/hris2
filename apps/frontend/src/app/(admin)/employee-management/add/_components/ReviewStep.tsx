"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import type { EmployeeFormData } from "../_hooks/useAddEmployeeForm";

interface ReviewStepProps {
	formData: EmployeeFormData;
}

interface ReviewItemProps {
	label: string;
	value: string | undefined | null;
}

function ReviewItem({ label, value }: ReviewItemProps) {
	return (
		<div>
			<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
				{label}
			</p>
			<p className="text-slate-700 dark:text-slate-300">{value || "-"}</p>
		</div>
	);
}

export function ReviewStep({ formData }: ReviewStepProps) {
	return (
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
					<h3 className="mb-3 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
						Personal Information
					</h3>
					<div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
						<ReviewItem
							label="First Name"
							value={formData.firstName}
						/>
						<ReviewItem
							label="Last Name"
							value={formData.lastName}
						/>
						<ReviewItem label="Email" value={formData.email} />
						<ReviewItem label="NIK" value={formData.nik} />
						<ReviewItem
							label="Phone Number"
							value={formData.phoneNumber}
						/>
						<ReviewItem label="Gender" value={formData.gender} />
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
						<ReviewItem
							label="Tax Status"
							value={formData.taxStatus}
						/>
					</div>
				</div>

				{/* Employee Information Review */}
				<div>
					<h3 className="mb-3 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
						Employee Information
					</h3>
					<div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
						<ReviewItem
							label="Employee ID"
							value={formData.employeeId}
						/>
						<ReviewItem label="Branch" value={formData.branch} />
						<ReviewItem
							label="Position"
							value={formData.position}
						/>
						<ReviewItem label="Grade" value={formData.grade} />
						<ReviewItem
							label="Contract Type"
							value={formData.contractType}
						/>
						<ReviewItem
							label="Hire Date"
							value={formData.hireDate}
						/>
						{formData.profilePhotoPreview && (
							<div className="mt-2 md:col-span-2">
								<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
									Profile Photo:
								</p>
								<Image
									src={formData.profilePhotoPreview}
									alt="Profile Preview"
									width={100}
									height={100}
									className="mt-1 rounded-md border border-slate-200 object-cover dark:border-slate-700"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Bank Information Review */}
				<div>
					<h3 className="mb-3 border-b border-slate-200 pb-2 text-lg font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
						Bank Information
					</h3>
					<div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm md:grid-cols-2">
						<ReviewItem
							label="Bank Name"
							value={formData.bankName}
						/>
						<ReviewItem
							label="Account Holder Name"
							value={formData.bankAccountHolder}
						/>
						<ReviewItem
							label="Account Number"
							value={formData.bankAccountNumber}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
