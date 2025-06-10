"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Crosshair, MapPin } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Employee } from "@/types/employee";
import { useClockIn, useClockOut } from "@/api/mutations/attendance.mutation";
import {
	ClockInAttendanceRequest,
	ClockOutAttendanceRequest,
} from "@/types/attendance";
import { useCreateLeaveRequestForEmployeeMutation } from "@/api/mutations/leave-request.mutations";
import { CreateLeaveRequestRequest, LeaveType } from "@/types/leave-request";

const MapComponent = dynamic(
	() => import("@/components/MapComponent").then((mod) => ({ default: mod.default })),
	{
		ssr: false,
		loading: () => (
			<div className="flex items-center justify-center h-full text-gray-400">
				Loading map...
			</div>
		),
	}
);

interface DialogFormData {
	employee_id: string;
	date: string;
	attendanceType: string;
	clockIn: string;
	clockOut: string;
	latitude: string;
	longitude: string;
	start_date: string;
	end_date: string;
	employee_note: string;
	attachment: File | null;
}

interface AddAttendanceDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employeeList: Employee[];
	createAttendance: (data: any) => Promise<void>;
	isCreating: boolean;
}

export function AddAttendanceDialog({
	open,
	onOpenChange,
	employeeList,
	createAttendance,
	isCreating,
}: AddAttendanceDialogProps) {
	// Add the clock in/out mutations
	const clockInMutation = useClockIn();
	const clockOutMutation = useClockOut();
	const createLeaveRequestMutation = useCreateLeaveRequestForEmployeeMutation();

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		control,
		formState: { errors },
		setError,
		clearErrors,
	} = useForm<DialogFormData>({
		defaultValues: {
			employee_id: "",
			date: "",
			attendanceType: "clock-in",
			clockIn: "",
			clockOut: "",
			latitude: "",
			longitude: "",
			start_date: "",
			end_date: "",
			employee_note: "",
			attachment: null,
		},
	});

	const formData = watch();
	const attendanceType = formData.attendanceType;
	const [employeeDropdownOpen, setEmployeeDropdownOpen] = React.useState(
		false
	);

	// Categorize attendance types
	const isClockInOut = ["clock-in", "clock-out"].includes(attendanceType);
	const isLeaveType = [
		"sick leave",
		"compassionate leave",
		"maternity leave",
		"annual leave",
		"marriage leave",
	].includes(attendanceType);

	// Filter employees to only show those with assigned work schedules
	const filteredEmployeeList = React.useMemo(() => {
		return employeeList.filter(
			(employee) => employee.work_schedule_id && employee.work_schedule
		);
	}, [employeeList]);

	// Get work schedule location for selected employee
	const getWorkScheduleLocation = React.useCallback(() => {
		if (!formData.employee_id || !isClockInOut) {
			return null;
		}

		const selectedEmployee = filteredEmployeeList.find(
			(emp) => emp.id.toString() === formData.employee_id
		);

		if (!selectedEmployee?.work_schedule?.details) {
			return null;
		}

		let workScheduleDetail;

		// If date is selected, find the specific work schedule detail for that day
		if (formData.date) {
			const selectedDate = new Date(formData.date);
			const dayNames = [
				"Sunday",
				"Monday",
				"Tuesday",
				"Wednesday",
				"Thursday",
				"Friday",
				"Saturday",
			];
			const dayIndex = selectedDate.getDay();
			const dayOfWeek = dayNames[dayIndex];

			if (dayOfWeek) {
				workScheduleDetail = selectedEmployee.work_schedule.details.find(
					(detail) => detail.work_days?.includes(dayOfWeek)
				);
			}
		}

		// If no date selected or no specific detail found, use the first detail with location
		if (!workScheduleDetail) {
			workScheduleDetail = selectedEmployee.work_schedule.details.find(
				(detail) => detail.location
			);
		}

		if (!workScheduleDetail?.location) {
			return null;
		}

		const result = {
			latitude: workScheduleDetail.location.latitude,
			longitude: workScheduleDetail.location.longitude,
			name: workScheduleDetail.location.name,
			address: workScheduleDetail.location.address_detail,
			workType: workScheduleDetail.worktype_detail,
		};
		return result;
	}, [
		formData.employee_id,
		formData.date,
		isClockInOut,
		filteredEmployeeList,
	]);

	// Check if location section should be shown
	const shouldShowLocationSection = React.useMemo(() => {
		if (!isClockInOut) {
			return false;
		}

		const workScheduleLocation = getWorkScheduleLocation();
		// Hide if no work schedule location found or if it's WFA
		if (!workScheduleLocation || workScheduleLocation.workType === "WFA") {
			return false;
		}

		return true;
	}, [isClockInOut, getWorkScheduleLocation]);

	// Set work schedule location when employee or date changes
	React.useEffect(() => {
		const workScheduleLocation = getWorkScheduleLocation();
		if (workScheduleLocation) {
			setValue("latitude", workScheduleLocation.latitude.toString());
			setValue("longitude", workScheduleLocation.longitude.toString());
		} else if (isClockInOut) {
			setValue("latitude", "");
			setValue("longitude", "");
		}
	}, [
		formData.employee_id,
		formData.date,
		isClockInOut,
		setValue,
		getWorkScheduleLocation,
	]);

	// Date validation for leave types
	const validateDateRange = (
		startDate: string,
		endDate: string
	): string | null => {
		if (!startDate || !endDate) return null;
		const start = new Date(startDate);
		const end = new Date(endDate);
		if (end < start) {
			return "End date cannot be earlier than start date";
		}
		return null;
	};

	// File validation for leave types
	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	const ALLOWED_FILE_TYPES = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/bmp",
		"image/webp",
		"application/pdf",
	];

	const validateFileUpload = (file: File | null): string | null => {
		if (!file) return null;
		if (file.size > MAX_FILE_SIZE) {
			return "File size must be less than 10MB";
		}
		if (!ALLOWED_FILE_TYPES.includes(file.type)) {
			return "Only image files and PDF files are allowed";
		}
		return null;
	};

	// Watch dates for validation
	React.useEffect(() => {
		if (isLeaveType && formData.start_date && formData.end_date) {
			const dateError = validateDateRange(
				formData.start_date,
				formData.end_date
			);
			if (dateError) {
				setError("end_date", { type: "manual", message: dateError });
			} else {
				clearErrors("end_date");
			}
		}
	}, [
		formData.start_date,
		formData.end_date,
		isLeaveType,
		setError,
		clearErrors,
	]);

	const getCurrentLocation = () => {
		const workScheduleLocation = getWorkScheduleLocation();
		if (workScheduleLocation) {
			setValue("latitude", workScheduleLocation.latitude.toString());
			setValue("longitude", workScheduleLocation.longitude.toString());
			toast.success(`Location set to ${workScheduleLocation.name}`);
		} else {
			toast.error(
				"No work schedule location found for selected employee and date"
			);
		}
	};

	const onSubmit = async (data: DialogFormData) => {
		try {
			const selectedEmployee = filteredEmployeeList.find(
				(emp: { id: number }) => emp.id.toString() === data.employee_id
			);

			if (!selectedEmployee) {
				toast.error("Please select a valid employee");
				return;
			}

			if (isClockInOut) {
				// Handle clock in/out submission with proper mutations
				if (data.attendanceType === "clock-in") {
					// Validate required fields for clock in
					if (!data.latitude || !data.longitude) {
						toast.error(
							"Location coordinates are required for clock in"
						);
						return;
					}

					const clockInData: ClockInAttendanceRequest = {
						employee_id: parseInt(data.employee_id),
						work_schedule_id:
							selectedEmployee.work_schedule_id || 1,
						date: data.date,
						...(data.clockIn && {
							clock_in: `${data.date}T${data.clockIn}:00Z`,
						}),
						clock_in_lat: parseFloat(data.latitude),
						clock_in_long: parseFloat(data.longitude),
					};

					await clockInMutation.mutateAsync(clockInData);
					toast.success("Clock-in recorded successfully!");
				} else if (data.attendanceType === "clock-out") {
					// Validate required fields for clock out
					if (!data.latitude || !data.longitude) {
						toast.error(
							"Location coordinates are required for clock out"
						);
						return;
					}

					const clockOutData: ClockOutAttendanceRequest = {
						employee_id: parseInt(data.employee_id),
						date: data.date,
						...(data.clockOut && {
							clock_out: `${data.date}T${data.clockOut}:00Z`,
						}),
						clock_out_lat: parseFloat(data.latitude),
						clock_out_long: parseFloat(data.longitude),
					};

					await clockOutMutation.mutateAsync(clockOutData);
					toast.success("Clock-out recorded successfully!");
				}
			} else if (isLeaveType) {
				// Handle leave request submission
				if (!data.start_date || !data.end_date) {
					toast.error(
						"Start date and end date are required for leave requests"
					);
					return;
				}

				// Map attendance type to LeaveType enum
				let leaveType: LeaveType;
				switch (data.attendanceType) {
					case "sick leave":
						leaveType = LeaveType.SICK_LEAVE;
						break;
					case "compassionate leave":
						leaveType = LeaveType.COMPASSIONATE_LEAVE;
						break;
					case "maternity leave":
						leaveType = LeaveType.MATERNITY_LEAVE;
						break;
					case "annual leave":
						leaveType = LeaveType.ANNUAL_LEAVE;
						break;
					case "marriage leave":
						leaveType = LeaveType.MARRIAGE_LEAVE;
						break;
					default:
						toast.error("Invalid leave type selected");
						return;
				}

				const leaveData: CreateLeaveRequestRequest = {
					leave_type: leaveType,
					start_date: data.start_date,
					end_date: data.end_date,
					employee_note: data.employee_note || undefined,
					attachment: data.attachment || undefined,
				};

				// Using admin-specific mutation to create leave request for employee
				await createLeaveRequestMutation.mutateAsync({
					employeeId: parseInt(data.employee_id),
					data: leaveData,
				});
				toast.success("Leave request submitted successfully!");
			}

			onOpenChange(false);
			reset();
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error("Failed to submit request");
		}
	};

	const getDialogTitle = () => {
		if (isClockInOut) {
			return attendanceType === "clock-in" ? "Clock In" : "Clock Out";
		}
		return "Submit Leave Request";
	};

	const getDialogDescription = () => {
		if (isClockInOut) {
			const workScheduleLocation = getWorkScheduleLocation();
			if (
				!workScheduleLocation ||
				workScheduleLocation.workType === "WFA"
			) {
				return "Recording attendance for remote work - no location tracking required.";
			}
			return "Location will be automatically set based on the employee's work schedule.";
		}
		return "Please fill in the details for your leave request.";
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-slate-50 p-0 sm:max-w-[800px] dark:bg-slate-900">
				<DialogHeader className="border-b px-6 py-4 dark:border-slate-700">
					<DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						{getDialogTitle()}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
						{getDialogDescription()}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-4">
						{/* Basic Information Section */}
						<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label
										htmlFor="employee_id"
										className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
									>
										Select Employee *
									</Label>
									<Popover
										open={employeeDropdownOpen}
										onOpenChange={setEmployeeDropdownOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												role="combobox"
												aria-expanded={
													employeeDropdownOpen
												}
												className="w-full justify-between border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
											>
												{formData.employee_id
													? filteredEmployeeList.find(
															(employee) =>
																employee.id.toString() ===
																formData.employee_id
													  )
														? `${
																filteredEmployeeList.find(
																	(
																		employee
																	) =>
																		employee.id.toString() ===
																		formData.employee_id
																)?.first_name
														  } ${
																filteredEmployeeList.find(
																	(
																		employee
																	) =>
																		employee.id.toString() ===
																		formData.employee_id
																)?.last_name
														  }`
														: "Select employee..."
													: "Select employee..."}
												<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="p-0 bg-white dark:bg-slate-800"
											align="start"
										>
											<Command>
												<CommandInput
													placeholder="Search employees..."
													className="h-9"
												/>
												<CommandList>
													<CommandEmpty>
														No employees with
														assigned work schedules
														found.
													</CommandEmpty>
													<CommandGroup>
														{filteredEmployeeList.map(
															(employee) => (
																<CommandItem
																	key={
																		employee.id
																	}
																	value={`${employee.first_name} ${employee.last_name}`}
																	onSelect={() => {
																		setValue(
																			"employee_id",
																			employee.id.toString()
																		);
																		setEmployeeDropdownOpen(
																			false
																		);
																	}}
																>
																	{
																		employee.first_name
																	}{" "}
																	{
																		employee.last_name
																	}
																	<Check
																		className={cn(
																			"ml-auto h-4 w-4",
																			formData.employee_id ===
																				employee.id.toString()
																				? "opacity-100"
																				: "opacity-0"
																		)}
																	/>
																</CommandItem>
															)
														)}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									{errors.employee_id && (
										<p className="text-red-500 text-sm mt-1">
											Employee is required
										</p>
									)}
									{filteredEmployeeList.length === 0 && (
										<p className="text-amber-600 text-sm mt-1">
											⚠️ No employees with assigned work
											schedules found. Please assign work
											schedules to employees first.
										</p>
									)}
								</div>

								<div>
									<Label
										htmlFor="attendanceType"
										className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
									>
										Attendance Type *
									</Label>
									<Select
										onValueChange={(value) =>
											setValue("attendanceType", value)
										}
										value={formData.attendanceType}
									>
										<SelectTrigger className="w-full border-slate-300 dark:border-slate-600">
											<SelectValue placeholder="Select Type" />
										</SelectTrigger>
										<SelectContent className="bg-white dark:bg-slate-800">
											<SelectItem value="clock-in">
												Clock In
											</SelectItem>
											<SelectItem value="clock-out">
												Clock Out
											</SelectItem>
											<SelectItem value="sick leave">
												Sick Leave
											</SelectItem>
											<SelectItem value="compassionate leave">
												Compassionate Leave
											</SelectItem>
											<SelectItem value="maternity leave">
												Maternity Leave
											</SelectItem>
											<SelectItem value="annual leave">
												Annual Leave
											</SelectItem>
											<SelectItem value="marriage leave">
												Marriage Leave
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						{/* Clock In/Out Section */}
						{isClockInOut && (
							<>
								{/* Date and Time Section */}
								<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
									<Label className="block text-base font-semibold mb-4 text-slate-800 dark:text-slate-200">
										Date & Time
									</Label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label
												htmlFor="date"
												className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
											>
												Date *
											</Label>
											<Input
												id="date"
												type="date"
												className="border-slate-300 dark:border-slate-600"
												{...register("date", {
													required:
														"Date is required",
												})}
											/>
											{errors.date && (
												<p className="text-red-500 text-sm mt-1">
													{errors.date.message}
												</p>
											)}
										</div>
										<div>
											<Label
												htmlFor={
													attendanceType ===
													"clock-in"
														? "clockIn"
														: "clockOut"
												}
												className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
											>
												{attendanceType === "clock-in"
													? "Clock In Time"
													: "Clock Out Time"}
											</Label>
											<Input
												id={
													attendanceType ===
													"clock-in"
														? "clockIn"
														: "clockOut"
												}
												type="time"
												className="border-slate-300 dark:border-slate-600"
												{...register(
													attendanceType ===
														"clock-in"
														? "clockIn"
														: "clockOut"
												)}
											/>
										</div>
									</div>
								</div>

								{/* Location Section */}
								{shouldShowLocationSection && (
									<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
										<Label className="block text-base font-semibold mb-4 text-slate-800 dark:text-slate-200">
											Location Information
										</Label>
										<div className="space-y-4">
											<Button
												variant="outline"
												type="button"
												onClick={getCurrentLocation}
												className="w-full border-slate-300 dark:border-slate-600"
											>
												<MapPin className="h-4 w-4 mr-2" />
												Set Work Schedule Location
											</Button>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												<div>
													<Label
														htmlFor="latitude"
														className="text-sm font-medium text-slate-700 dark:text-slate-300"
													>
														Latitude
													</Label>
													<Input
														id="latitude"
														value={
															formData.latitude ||
															""
														}
														disabled
														className="bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
													/>
												</div>
												<div>
													<Label
														htmlFor="longitude"
														className="text-sm font-medium text-slate-700 dark:text-slate-300"
													>
														Longitude
													</Label>
													<Input
														id="longitude"
														value={
															formData.longitude ||
															""
														}
														disabled
														className="bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
													/>
												</div>
											</div>

											<div className="h-64 rounded-md overflow-hidden border border-slate-300 dark:border-slate-600">
												<MapComponent
													latitude={parseFloat(
														formData.latitude ||
															"-6.2088"
													)}
													longitude={parseFloat(
														formData.longitude ||
															"106.8456"
													)}
													showRadius={false}
													radius={0}
													interactive={false}
													onPositionChange={() => {}}
												/>
											</div>
										</div>
									</div>
								)}
							</>
						)}

						{/* Leave Request Section */}
						{isLeaveType && (
							<>
								{/* Leave Details Section */}
								<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
									<Label className="block text-base font-semibold mb-4 text-slate-800 dark:text-slate-200">
										Leave Details
									</Label>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label
												htmlFor="start_date"
												className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
											>
												Start Date *
											</Label>
											<Input
												id="start_date"
												type="date"
												className="border-slate-300 dark:border-slate-600"
												{...register("start_date", {
													required:
														"Start date is required",
												})}
											/>
											{errors.start_date && (
												<p className="text-red-500 text-sm mt-1">
													{errors.start_date.message}
												</p>
											)}
										</div>
										<div>
											<Label
												htmlFor="end_date"
												className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
											>
												End Date *
											</Label>
											<Input
												id="end_date"
												type="date"
												className="border-slate-300 dark:border-slate-600"
												{...register("end_date", {
													required:
														"End date is required",
												})}
											/>
											{errors.end_date && (
												<p className="text-red-500 text-sm mt-1">
													{errors.end_date.message}
												</p>
											)}
										</div>
									</div>
									<div className="mt-4">
										<Label
											htmlFor="employee_note"
											className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
										>
											Reason for Leave *
										</Label>
										<Textarea
											id="employee_note"
											placeholder="Please provide the reason for your leave request..."
											className="border-slate-300 dark:border-slate-600"
											{...register("employee_note", {
												required: "Reason is required",
												minLength: {
													value: 10,
													message:
														"Reason must be at least 10 characters",
												},
											})}
										/>
										{errors.employee_note && (
											<p className="text-red-500 text-sm mt-1">
												{errors.employee_note.message}
											</p>
										)}
									</div>
								</div>

								{/* Evidence Upload Section */}
								<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
									<Label className="block text-base font-semibold mb-4 text-slate-800 dark:text-slate-200">
										Support Evidence
									</Label>
									<Controller
										name="attachment"
										control={control}
										rules={{
											validate: (file) => {
												const error = validateFileUpload(
													file || null
												);
												return error || true;
											},
										}}
										render={({
											field: {
												onChange,
												value,
												...field
											},
										}) => (
											<div className="space-y-2">
												<Input
													{...field}
													id="attachment"
													type="file"
													accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,image/*,application/pdf"
													className="focus:ring-primary focus:border-primary file:bg-primary hover:file:bg-primary/90 mt-1 w-full border-slate-300 bg-slate-50 file:mr-4 file:rounded-md file:border-0 file:px-4 file:text-sm file:font-semibold file:text-white dark:border-slate-600 dark:bg-slate-800"
													onChange={(e) => {
														const file =
															e.target.files?.[0];
														const validationError = validateFileUpload(
															file || null
														);

														if (validationError) {
															toast.error(
																validationError
															);
															e.target.value = "";
															onChange(null);
															return;
														}

														onChange(file || null);
													}}
												/>
												{value && (
													<div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md border">
														<p className="text-sm text-slate-700 dark:text-slate-300">
															<strong>
																Selected:
															</strong>{" "}
															{value.name}
														</p>
														<p className="text-xs text-slate-500">
															Size:{" "}
															{(
																(value.size ||
																	0) /
																1024 /
																1024
															).toFixed(2)}{" "}
															MB
														</p>
													</div>
												)}
												<div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
													<p>
														<strong>
															Accepted:
														</strong>{" "}
														Images (JPG, PNG, GIF,
														etc.) and PDF files
													</p>
													<p>
														<strong>
															Max size:
														</strong>{" "}
														10MB
													</p>
												</div>
											</div>
										)}
									/>
									{errors.attachment && (
										<p className="text-red-500 text-sm mt-1">
											{errors.attachment.message}
										</p>
									)}
								</div>
							</>
						)}
					</div>

					<DialogFooter className="border-t bg-slate-100 dark:bg-slate-800/50 px-6 py-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
								reset();
							}}
							className="border-slate-300 dark:border-slate-600"
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={
								!filteredEmployeeList.length ||
								isCreating ||
								clockInMutation.isPending ||
								clockOutMutation.isPending ||
								createLeaveRequestMutation.isPending
							}
						>
							{isCreating ||
							clockInMutation.isPending ||
							clockOutMutation.isPending ||
							createLeaveRequestMutation.isPending
								? "Creating..."
								: `Submit ${
										attendanceType === "clock-in"
											? "Clock In"
											: attendanceType === "clock-out"
											? "Clock Out"
											: attendanceType === "sick leave"
											? "Sick Leave"
											: attendanceType ===
											  "compassionate leave"
											? "Compassionate Leave"
											: attendanceType ===
											  "maternity leave"
											? "Maternity Leave"
											: attendanceType === "annual leave"
											? "Annual Leave"
											: attendanceType ===
											  "marriage leave"
											? "Marriage Leave"
											: "Request"
								  }`}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
