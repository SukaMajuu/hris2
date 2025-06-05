"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import WorkTypeBadge from "@/components/workTypeBadge";
import { Check, ChevronsUpDown, Clock, User } from "lucide-react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { WorkType } from "@/const/work";
import type { Employee } from "@/types/employee";
import type { WorkSchedule, WorkScheduleDetailItem } from "@/types/work-schedule.types";
import {
	type CheckclockSettingsInput,
} from "@/schemas/checkclock.schema";

interface CheckClockFormProps {
	initialData?: Partial<CheckclockSettingsInput>;
	onSubmit: (data: CheckclockSettingsInput) => void;
	isEditMode?: boolean;
	employees: Employee[];
	workSchedules: WorkSchedule[];
	isLoading?: boolean;
	showProfileCard?: boolean;
}

export function CheckClockForm({
	initialData = {},
	onSubmit,
	isEditMode = false,
	employees = [],
	workSchedules = [],
	isLoading = false,
	showProfileCard = false,
}: CheckClockFormProps) {
	const router = useRouter();

	const [employeeId, setEmployeeId] = useState<string>(
		initialData.employee_id?.toString() || ""
	);
	const [workScheduleType, setWorkScheduleType] = useState<string>(
		initialData.work_schedule_id?.toString() || ""
	);

	const [comboboxOpen, setComboboxOpen] = useState(false);
	const [workScheduleDetails, setWorkScheduleDetails] = useState<WorkScheduleDetailItem[]>([]);

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

	const flattenDetails = (details: WorkScheduleDetailItem[]): FlattenedDetail[] => {
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
	const formatTimeRange = (start?: string | null, end?: string | null): string => {
		if (!start && !end) return "-";
		return `${start || "--:--"} - ${end || "--:--"}`;
	};

	const getLocationName = (detail: WorkScheduleDetailItem): string => {
		return detail.location?.name || "-";
	};

	// Check if we should show location column (hide for WFA work types)
	const shouldShowLocation = flattenedDetails.some(detail =>
		detail.worktype_detail !== "WFA"
	);

	// Update state when initialData changes
	useEffect(() => {
		if (initialData.employee_id) {
			setEmployeeId(initialData.employee_id.toString());
		}
		if (initialData.work_schedule_id) {
			setWorkScheduleType(initialData.work_schedule_id.toString());
		}
	}, [initialData]);

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
		if (!employeeId || !workScheduleType) {
			if (!employeeId && !workScheduleType) {
				if (isEditMode) {
					toast.error("Please select a Work Schedule");
				} else {
					toast.error("Please select both Employee and Work Schedule");
				}
			} else if (!employeeId) {
				if (!isEditMode) {
					toast.error("Please select an Employee");
				}
			} else if (!workScheduleType) {
				toast.error("Please select a Work Schedule");
			}
			return;
		}

		// Convert to the expected format
		const formData: CheckclockSettingsInput = {
			employee_id: parseInt(employeeId),
			work_schedule_id: parseInt(workScheduleType),
		};

		if (initialData.id) {
			formData.id = initialData.id;
		}

		onSubmit(formData);
	};

	const employeeOptions = employees.map((emp) => ({
		value: emp.id.toString(),
		label: `${emp.first_name} ${emp.last_name}`,
		position: emp.position_name,
	}));

	const currentEmployeeLabel =
		employeeOptions.find((emp) => emp.value === employeeId)?.label ||
		"Select Employee...";

	const currentEmployee = employeeOptions.find((emp) => emp.value === employeeId);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Grid */}
			<div className="flex flex-col lg:flex-row max-w-[1200px] mx-auto gap-8">
				{/* Left Column - Employee Profile or Selection */}
				<div className="w-full lg:w-2/6">
					{/* Employee Profile Card */}
					{showProfileCard ? (
						<Card className="border-none shadow-sm">
							<CardContent>								<div className="flex flex-col items-center text-center mb-4">
									<div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
										<User className="h-10 w-10 text-gray-500" />
									</div>
									<h3 className="text-xl font-semibold text-gray-800">
										{currentEmployee?.label || "N/A"}
									</h3>
									<p className="text-sm text-gray-500">
										{currentEmployee?.position || "N/A"}
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card className="border-none shadow-sm">
							<CardContent className="p-6">								<div className="flex items-center gap-2 mb-4">
									<User className="h-5 w-5 text-gray-500" />
									<h3 className="font-semibold text-lg text-gray-800">
										{isEditMode ? "Employee Information" : "Employee Selection"}
									</h3>
								</div>								<div>
									<Label
										htmlFor="employeeId"
										className="block text-sm font-medium text-gray-700 mb-1.5"
									>
										{isEditMode ? "Employee" : "Select Employee"}
									</Label>
									<Popover
										open={comboboxOpen}
										onOpenChange={setComboboxOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={comboboxOpen}
												className="w-full justify-between text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400"
												id="employeeId"
												disabled={isLoading}
											>
												{currentEmployeeLabel}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent className="p-0">
											<Command>
												<CommandInput placeholder="Search employee..." />
												<CommandList>
													<CommandEmpty>
														No employee found.
													</CommandEmpty>
													<CommandGroup>
														{employeeOptions.map(
															(employee) => (
																<CommandItem
																	key={
																		employee.value
																	}
																	value={
																		employee.value
																	}
																	onSelect={(
																		currentValue
																	) => {
																		setEmployeeId(
																			currentValue ===
																				employeeId
																				? ""
																				: currentValue
																		);
																		setComboboxOpen(
																			false
																		);
																	}}
																>
																	<Check
																		className={`mr-2 h-4 w-4 ${
																			employeeId ===
																			employee.value
																				? "opacity-100"
																				: "opacity-0"
																		}`}
																	/>
																	<div className="flex flex-col">
																		<span className="font-medium">
																			{employee.label}
																		</span>
																		<span className="text-sm text-gray-500">
																			{employee.position}
																		</span>
																	</div>
																</CommandItem>
															)
														)}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Work Schedule */}
				<div className="w-full lg:w-2/3 space-y-6">
					{/* Work Schedule */}
					<Card className="border-none shadow-sm">
						<CardContent>
							<div className="flex items-center gap-2 mb-4">
								<Clock className="h-5 w-5 text-gray-500" />
								<h3 className="font-semibold text-lg text-gray-800">
									Work Schedule
								</h3>
							</div>

							<div>
								<Label className="block text-sm font-medium text-gray-700 mb-1.5">
									Work Schedule Type
								</Label>
								<Select
									value={workScheduleType}
									onValueChange={setWorkScheduleType}
									disabled={isLoading}
								>
									<SelectTrigger className="w-full text-sm font-normal text-gray-700 border-gray-300 hover:border-gray-400">
										<SelectValue placeholder="Select schedule type" />
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
														{schedule.work_type}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Work Schedule Detail Table */}
					{workScheduleType && workScheduleDetails.length > 0 && (
						<Card className="border-none shadow-sm">
							<CardContent>
								<div className="mb-4">
									<h3 className="font-semibold text-lg text-gray-800">
										Work Schedule Detail
									</h3>
									<p className="text-sm text-gray-500">
										Detail jadwal kerja {workSchedules.find(ws => ws.id?.toString() === workScheduleType)?.name}
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
												{shouldShowLocation && <col className="w-40" />}
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
												{flattenedDetails.length === 0 ? (
													<tr>
														<td
															colSpan={shouldShowLocation ? 6 : 5}
															className="h-24 text-center text-slate-500 dark:text-slate-400"
														>
															No schedule details available.
														</td>
													</tr>
												) : (
													flattenedDetails.map((detail, index) => (
														<tr
															key={`${detail.id}-${detail.singleDay}-${index}`}
															className="border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/50 last:border-b-0"
														>
															<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
																{detail.singleDay}
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
																{formatTimeRange(detail.checkin_start, detail.checkin_end)}
															</td>
															<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
																{formatTimeRange(detail.break_start, detail.break_end)}
															</td>
															<td className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
																{formatTimeRange(detail.checkout_start, detail.checkout_end)}
															</td>
															{shouldShowLocation && (
																<td
																	className="text-center py-3 px-4 text-sm text-slate-700 dark:text-slate-300 max-w-[10rem] truncate"
																	title={getLocationName(detail)}
																>
																	{getLocationName(detail)}
																</td>
															)}
														</tr>
													))
												)}
											</tbody>
										</table>
									</div>
								</div>
								<p className="text-sm text-gray-500 text-center mt-2">
									Jadwal kerja mingguan
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
							disabled={isLoading}
						>
							{isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Save"}
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
