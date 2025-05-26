"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DialogFormData {
	attendanceType: string;
	checkIn: string;
	checkOut: string;
	latitude: string;
	longitude: string;
	permitEndDate: string;
	evidence: FileList | null;
}

interface PermitDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dialogTitle: string;
	formMethods: UseFormReturn<DialogFormData>;
	onSubmit: (data: DialogFormData) => void;
	currentAttendanceType: string;
}

export function PermitDialog({
	open,
	onOpenChange,
	dialogTitle,
	formMethods,
	onSubmit,
	currentAttendanceType,
}: PermitDialogProps) {
	const { register, handleSubmit } = formMethods;

	const permitRelatedLeaveTypes = [
		"sick leave",
		"compassionate leave",
		"maternity leave",
		"annual leave",
		"marriage leave",
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] bg-slate-50 dark:bg-slate-900 p-0">
				<DialogHeader className="px-6 py-4 border-b dark:border-slate-700">
					<DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						{dialogTitle}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
						Please fill in the details for your permit or leave
						request.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-220px)]">
						{/* Section 1: Attendance Type & Permit Duration */}
						<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
							<div className="space-y-2">
								<Label
									htmlFor="attendanceType"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Permit / Leave Type
								</Label>
								<select
									id="attendanceType"
									className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-50 ring-offset-white dark:ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									{...register("attendanceType", {
										required: true,
									})}
								>
									<option value="sick leave">
										Sick Leave
									</option>
									<option value="compassionate leave">
										Compassionate Leave
									</option>
									<option value="maternity leave">
										Maternity Leave
									</option>
									<option value="annual leave">
										Annual Leave
									</option>
									<option value="marriage leave">
										Marriage Leave
									</option>
								</select>
							</div>

							{permitRelatedLeaveTypes.includes(
								currentAttendanceType
							) && (
								<div className="space-y-2 mt-4">
									<Label
										htmlFor="permitEndDate"
										className="text-sm font-medium text-slate-700 dark:text-slate-300"
									>
										Permit Duration (End Date)
									</Label>
									<Input
										id="permitEndDate"
										type="date"
										className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-50"
										{...register("permitEndDate", {
											required: true,
										})}
									/>
								</div>
							)}
						</div>

						{/* Section 2: Upload Evidence (Only for Permit) */}
						{permitRelatedLeaveTypes.includes(
							currentAttendanceType
						) && (
							<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
								<Label
									htmlFor="evidence"
									className="block text-base font-semibold mb-2 text-slate-800 dark:text-slate-200"
								>
									Upload Support Evidence
								</Label>
								<Input
									id="evidence"
									type="file"
									accept="image/*,application/pdf"
									className="mt-1 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-primary focus:border-primary w-full max-w-xs file:mr-4 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
									{...register("evidence")}
								/>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
									Upload relevant documents (image or PDF) for
									your leave request.
								</p>
							</div>
						)}
					</div>
					<DialogFooter className="px-6 py-4 border-t dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 rounded-b-lg">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
						>
							Submit Request
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
