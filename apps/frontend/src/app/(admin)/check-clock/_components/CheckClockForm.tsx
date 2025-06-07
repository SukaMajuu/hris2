"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import WorkTypeBadge from "@/components/workTypeBadge";
import { Clock, User } from "lucide-react";
import { toast } from "sonner";
import { WorkType } from "@/const/work";
import type { Employee } from "@/types/employee";
import type {
	WorkSchedule,
	WorkScheduleDetailItem,
} from "@/types/work-schedule.types";

interface WorkScheduleAssignmentData {
	employee_id: number;
	work_schedule_id: number;
}

interface CheckClockFormProps {
	// For assignment mode - single employee with current assignment
	employee: Employee;
	currentAssignment?: {
		employee_id: number;
		work_schedule_id?: number;
	};
	onSubmit: (data: WorkScheduleAssignmentData) => void;
	workSchedules: WorkSchedule[];
	isLoading?: boolean;
}

export function CheckClockForm({
	employee,
	currentAssignment,
	onSubmit,
	workSchedules = [],
	isLoading = false,
}: CheckClockFormProps) {
	const router = useRouter();

	const [workScheduleType, setWorkScheduleType] = useState<string>(
		currentAssignment?.work_schedule_id?.toString() || ""
	);
	const [workScheduleDetails, setWorkScheduleDetails] = useState<
		WorkScheduleDetailItem[]
	>([]);

	// Flatten work schedule details for table display
	interface FlattenedDetail extends WorkScheduleDetailItem {
		singleDay: string;
	}

	const dayOrder = [
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
		"Sunday",
	];

	const flattenDetails = (
		details: WorkScheduleDetailItem[]
	): FlattenedDetail[] => {
		const result: FlattenedDetail[] = [];

		details.forEach((detail) => {
			const workDays = detail.work_days || [];

			if (workDays.length > 0) {
				workDays.forEach((day) => {
					result.push({ ...detail, singleDay: day });
				});
			} else {
				result.push({ ...detail, singleDay: "-" });
			}
		});

		return result.sort((a, b) => {
			const dayIndexA = dayOrder.indexOf(a.singleDay);
			const dayIndexB = dayOrder.indexOf(b.singleDay);

			if (dayIndexA === -1 && dayIndexB === -1) return 0;
			if (dayIndexA === -1) return 1;
			if (dayIndexB === -1) return -1;

			return dayIndexA - dayIndexB;
		});
	};

	const flattenedDetails = flattenDetails(workScheduleDetails);

	// Helper functions to match WorkScheduleDetail component
	const formatTimeRange = (
		start?: string | null,
		end?: string | null
	): string => {
		if (!start && !end) return "-";
		return `${start || "--:--"} - ${end || "--:--"}`;
	};

	const getLocationName = (detail: WorkScheduleDetailItem): string => {
		return detail.location?.name || "-";
	};

	// Check if we should show location column (hide for WFA work types)
	const shouldShowLocation = flattenedDetails.some(
		(detail) => detail.worktype_detail !== "WFA"
	);

	// Update state when currentAssignment changes (but not during form submission)
	useEffect(() => {
		if (currentAssignment?.work_schedule_id && !isLoading) {
			setWorkScheduleType(currentAssignment.work_schedule_id.toString());
		}
	}, [currentAssignment, isLoading]);

	// Generate work schedule details when work schedule type changes
	useEffect(() => {
		if (workScheduleType) {
			const selectedSchedule = workSchedules.find(
				(ws) => ws.id?.toString() === workScheduleType
			);

			if (selectedSchedule && selectedSchedule.details) {
				setWorkScheduleDetails(selectedSchedule.details);
			} else {
				setWorkScheduleDetails([]);
			}
		} else {
			setWorkScheduleDetails([]);
		}
	}, [workScheduleType, workSchedules]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate required fields
		if (!workScheduleType) {
			toast.error("Please select a Work Schedule");
			return;
		}

		// Convert to the expected format
		const formData: WorkScheduleAssignmentData = {
			employee_id: employee.id,
			work_schedule_id: parseInt(workScheduleType),
		};

		onSubmit(formData);
	};

	const selectedWorkSchedule = workSchedules.find(
		(ws) => ws.id?.toString() === workScheduleType
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Grid */}
			<div className="flex flex-col lg:flex-row max-w-[1200px] mx-auto gap-8">
				{/* Left Column - Employee Profile (Always shown) */}
				<div className="w-full lg:w-2/6">
					<Card className="border-none shadow-sm">
						<CardContent className="p-6">
							<div className="flex flex-col items-center text-center mb-4">
								<div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
									{employee.profile_photo_url ? (
										<img
											src={employee.profile_photo_url}
											alt={`${employee.first_name} ${employee.last_name}`}
											className="w-full h-full rounded-full object-cover"
										/>
									) : (
										<User className="h-10 w-10 text-gray-500" />
									)}
								</div>
								<h3 className="text-xl font-semibold text-gray-800">
									{`${employee.first_name || ""} ${
										employee.last_name || ""
									}`.trim()}
								</h3>
								<p className="text-sm text-gray-500">
									{employee.position_name || "N/A"}
								</p>
								<div className="mt-2 text-xs text-gray-400">
									Employee ID:{" "}
									{employee.employee_code || employee.id}
								</div>

								{/* Current Assignment Status */}
								<div className="mt-3 px-3 py-1 rounded-full text-xs font-medium">
									{currentAssignment?.work_schedule_id ? (
										<span className="bg-green-100 text-green-800">
											Has Work Schedule
										</span>
									) : (
										<span className="bg-red-100 text-red-800">
											No Work Schedule Assigned
										</span>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Work Schedule Assignment */}
				<div className="w-full lg:w-2/3 space-y-6">
					{/* Work Schedule Selection */}
					<Card className="border-none shadow-sm">
						<CardContent className="p-6">
							<div className="flex items-center gap-2 mb-4">
								<Clock className="h-5 w-5 text-gray-500" />
								<h3 className="font-semibold text-lg text-gray-800">
									Work Schedule Assignment
								</h3>
							</div>

							<div>
								<Label className="block text-sm font-medium text-gray-700 mb-1.5">
									Select Work Schedule
								</Label>
								<Select
									value={workScheduleType}
									onValueChange={setWorkScheduleType}
									disabled={isLoading}
								>
									<SelectTrigger className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400">
										<SelectValue placeholder="Choose a work schedule for this employee" />
									</SelectTrigger>
									<SelectContent>
										{workSchedules.map((schedule) => (
											<SelectItem
												key={schedule.id}
												value={schedule.id!.toString()}
											>
												<div className="flex items-center gap-2">
													<span className="font-medium">
														{schedule.name}
													</span>
													<span className="text-sm text-gray-500">
														({schedule.work_type})
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{workScheduleType && selectedWorkSchedule && (
									<p className="mt-2 text-sm text-gray-600">
										Selected:{" "}
										<span className="font-medium">
											{selectedWorkSchedule.name}
										</span>{" "}
										- {selectedWorkSchedule.work_type}{" "}
										Schedule
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Work Schedule Detail Table */}
					{workScheduleType && workScheduleDetails.length > 0 && (
						<Card className="border-none shadow-sm">
							<CardContent className="p-6">
								<div className="mb-4">
									<h3 className="font-semibold text-lg text-gray-800">
										Work Schedule Details
									</h3>
									<p className="text-sm text-gray-500">
										Preview of the selected work schedule
									</p>
								</div>

								<div className="border-none shadow-sm py-0">
									<div className="rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-auto">
										<table className="w-full text-sm">
											<colgroup>
												<col className="w-24" />
												<col className="w-28" />
												<col className="w-32" />
												<col className="w-32" />
												<col className="w-32" />
												{shouldShowLocation && (
													<col className="w-40" />
												)}
											</colgroup>
											<thead>
												<tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
													<th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-3 px-4 h-12">
														Day
													</th>
													<th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-3 px-4 h-12">
														Work Type
													</th>
													<th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-3 px-4 h-12">
														Check-in
													</th>
													<th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-3 px-4 h-12">
														Break
													</th>
													<th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-3 px-4 h-12">
														Check-out
													</th>
													{shouldShowLocation && (
														<th className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-3 px-4 h-12">
															Location
														</th>
													)}
												</tr>
											</thead>
											<tbody>
												{flattenedDetails.length ===
												0 ? (
													<tr>
														<td
															colSpan={
																shouldShowLocation
																	? 6
																	: 5
															}
															className="h-24 text-center text-slate-500 dark:text-slate-400"
														>
															No schedule details
															available.
														</td>
													</tr>
												) : (
													flattenedDetails.map(
														(detail, index) => (
															<tr
																key={`${detail.id}-${detail.singleDay}-${index}`}
																className="border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 last:border-b-0"
															>
																<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
																	{
																		detail.singleDay
																	}
																</td>
																<td className="text-center py-3 px-4 text-sm">
																	<div className="flex justify-center">
																		<WorkTypeBadge
																			workType={
																				detail.worktype_detail as WorkType
																			}
																		/>
																	</div>
																</td>
																<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
																	{formatTimeRange(
																		detail.checkin_start,
																		detail.checkin_end
																	)}
																</td>
																<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
																	{formatTimeRange(
																		detail.break_start,
																		detail.break_end
																	)}
																</td>
																<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
																	{formatTimeRange(
																		detail.checkout_start,
																		detail.checkout_end
																	)}
																</td>
																{shouldShowLocation && (
																	<td
																		className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300 max-w-[10rem] truncate"
																		title={getLocationName(
																			detail
																		)}
																	>
																		{getLocationName(
																			detail
																		)}
																	</td>
																)}
															</tr>
														)
													)
												)}
											</tbody>
										</table>
									</div>
								</div>
								<p className="text-sm text-gray-500 text-center mt-2">
									Weekly work schedule
								</p>
							</CardContent>
						</Card>
					)}

					{/* Action Buttons */}
					<div className="flex justify-end space-x-3 pt-4 mb-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							className="px-6 py-2 hover:text-gray-700 text-sm border-gray-300 hover:bg-gray-100"
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="default"
							className="px-6 py-2 text-sm bg-[#6B9AC4] hover:bg-[#5a89b3]"
							disabled={isLoading || !workScheduleType}
						>
							{isLoading
								? "Assigning..."
								: "Assign Work Schedule"}
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
