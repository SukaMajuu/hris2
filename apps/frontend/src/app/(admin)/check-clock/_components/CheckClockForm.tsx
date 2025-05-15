"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
import { MapComponent } from "@/components/MapComponent";

import { Check, ChevronsUpDown, User, Clock, MapPin } from "lucide-react";
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

// Interfaces
export interface Employee {
	value: string;
	label: string;
	position?: string;
}

export interface Location {
	value: string;
	label: string;
	latitude?: string;
	longitude?: string;
}

export interface CheckClockFormData {
	employeeId?: string;
	workScheduleType?: string;
	checkInTime?: string;
	checkOutTime?: string;
	breakStartTime?: string;
	workType?: string;
	locationId?: string;
	addressDetails?: string;
	latitude?: string;
	longitude?: string;
}

interface CheckClockFormProps {
	initialData?: CheckClockFormData;
	onSubmit: (data: CheckClockFormData) => void;
	isEditMode?: boolean;
	employees: Employee[];
	locations: Location[];
	showProfileCard?: boolean;
}

export function CheckClockForm({
	initialData = {},
	onSubmit,
	isEditMode = false,
	employees = [],
	locations = [],
	showProfileCard = false,
}: CheckClockFormProps) {
	const router = useRouter();

	const [employeeId, setEmployeeId] = useState(initialData.employeeId || "");
	const [workScheduleType, setWorkScheduleType] = useState(
		initialData.workScheduleType || ""
	);
	const [checkInTime, setCheckInTime] = useState(
		initialData.checkInTime || ""
	);
	const [checkOutTime, setCheckOutTime] = useState(
		initialData.checkOutTime || ""
	);
	const [breakStartTime, setBreakStartTime] = useState(
		initialData.breakStartTime || ""
	);
	const [workType, setWorkType] = useState(
		initialData.workType || "WFO (Work From Office)"
	);
	const [locationId, setLocationId] = useState(initialData.locationId || "");
	const [addressDetails, setAddressDetails] = useState(
		initialData.addressDetails || "Kota Malang, Jawa Timur"
	);
	const [latitude, setLatitude] = useState(initialData.latitude || "");
	const [longitude, setLongitude] = useState(initialData.longitude || "");

	const [comboboxOpen, setComboboxOpen] = useState(false);

	useEffect(() => {
		setEmployeeId(initialData.employeeId || "");
		setWorkScheduleType(initialData.workScheduleType || "");
		setCheckInTime(initialData.checkInTime || "");
		setCheckOutTime(initialData.checkOutTime || "");
		setBreakStartTime(initialData.breakStartTime || "");
		setWorkType(initialData.workType || "WFO (Work From Office)");
		setLocationId(initialData.locationId || "");
		setAddressDetails(
			initialData.addressDetails || "Kota Malang, Jawa Timur"
		);
		setLatitude(initialData.latitude || "");
		setLongitude(initialData.longitude || "");
	}, [initialData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit({
			employeeId,
			workScheduleType,
			checkInTime,
			checkOutTime,
			breakStartTime,
			workType,
			locationId,
			addressDetails,
			latitude,
			longitude,
		});
	};

	const currentEmployeeLabel =
		employees.find((emp) => emp.value === employeeId)?.label ||
		"Select Employee...";

	// Find the current employee for the profile card
	const currentEmployee = employees.find((emp) => emp.value === employeeId);

	// Add a helper to get location details by id
	const getLocationDetails = (id: string) => {
		const loc = locations.find((l) => l.value === id);
		// You may need to adjust this if your location object has more fields
		// For now, we use label as address, and assume latitude/longitude are present
		return loc
			? {
					address: loc.label || "",
					latitude: loc.latitude || "",
					longitude: loc.longitude || "",
			  }
			: { address: "", latitude: "", longitude: "" };
	};

	// Update address, latitude, longitude when locationId changes
	useEffect(() => {
		if (locationId) {
			const details = getLocationDetails(locationId);
			setAddressDetails(details.address);
			setLatitude(details.latitude);
			setLongitude(details.longitude);
		} else {
			setAddressDetails("");
			setLatitude("");
			setLongitude("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [locationId]);

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Grid */}
			<div className="flex flex-col lg:flex-row max-w-[1200px] mx-auto gap-6">
				{/* Left Column - Employee Profile or Selection */}
				<div className="w-full lg:w-2/6">
					{/* Employee Profile Card */}
					{showProfileCard ? (
						<Card className="border-none shadow-sm">
							<CardContent>
								<div className="flex flex-col items-center text-center mb-3">
									<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
										<User className="h-8 w-8 text-gray-500" />
									</div>
									<h3 className="text-lg font-semibold">
										{currentEmployee?.label || "N/A"}
									</h3>
									<p className="text-sm text-gray-500">
										{currentEmployee?.position || "N/A"}
									</p>
								</div>

								<div className="space-y-3">
									<div className="flex flex-col gap-1">
										<Label className="text-xs font-medium">
											Employee ID
										</Label>
										<Input
											className="bg-gray-50 text-sm py-1"
											disabled
											value={employeeId || "N/A"}
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card className="border-none shadow-sm">
							<CardContent>
								<div className="flex items-center gap-2 mb-3">
									<User className="h-4 w-4 text-gray-500" />
									<h3 className="font-semibold text-base">
										Employee Selection
									</h3>
								</div>

								<div>
									<Label
										htmlFor="employeeId"
										className="text-xs font-medium"
									>
										Select Employee
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
												className="w-full justify-between mt-1 text-sm"
												id="employeeId"
											>
												{currentEmployeeLabel}
												<ChevronsUpDown className="ml-2 h-3 shrink-0 opacity-50" />
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
														{employees.map(
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
																	{
																		employee.label
																	}
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

				{/* Right Column - Work Schedule and Location */}
				<div className="w-full lg:w-2/3 space-y-6">
					{/* Work Schedule */}
					<Card className="border-none shadow-sm">
						<CardContent>
							<div className="flex items-center gap-2 mb-4">
								<Clock className="h-5 w-5 text-gray-500" />
								<h3 className="font-semibold text-lg">
									Work Schedule
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<Label className="text-sm font-medium">
										Work Schedule Type
									</Label>
									<Select
										value={workScheduleType}
										onValueChange={setWorkScheduleType}
									>
										<SelectTrigger className="w-full mt-2">
											<SelectValue placeholder="Select schedule type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="morning">
												Morning
											</SelectItem>
											<SelectItem value="evening">
												Evening
											</SelectItem>
											<SelectItem value="regular">
												Regular
											</SelectItem>
											<SelectItem value="shift">
												Shift
											</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{/* Read-only fields group */}
								<div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-md p-4 mt-2">
									<div className="mb-2 text-xs text-gray-500 font-medium">
										Auto-filled by system
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Label className="text-sm font-medium">
												Work Type
											</Label>
											<Input
												value={workType}
												readOnly
												tabIndex={-1}
												className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
											/>
										</div>
										<div>
											<Label className="text-sm font-medium">
												Check In
											</Label>
											<Input
												value={checkInTime}
												readOnly
												tabIndex={-1}
												placeholder="07:00 - 08:00"
												className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
											/>
										</div>
										<div>
											<Label className="text-sm font-medium">
												Check-out
											</Label>
											<Input
												value={checkOutTime}
												readOnly
												tabIndex={-1}
												placeholder="17:00 - 18:00"
												className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
											/>
										</div>
										<div>
											<Label className="text-sm font-medium">
												Break
											</Label>
											<Input
												value={breakStartTime}
												readOnly
												tabIndex={-1}
												placeholder="12:00 - 13:00"
												className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
											/>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Check-Clock Location */}
					<Card className="border-none shadow-sm">
						<CardContent>
							<div className="flex items-center gap-2 mb-4">
								<MapPin className="h-5 w-5 text-gray-500" />
								<h3 className="font-semibold text-lg">
									Check-Clock Location
								</h3>
							</div>
							{/* Select Location at the top */}
							<div className="mb-4">
								<Label className="text-sm font-medium">
									Location
								</Label>
								<Select
									value={locationId}
									onValueChange={setLocationId}
								>
									<SelectTrigger className="w-full mt-2 z-10">
										<SelectValue placeholder="Select Location" />
									</SelectTrigger>
									<SelectContent>
										{locations.map((loc) => (
											<SelectItem
												key={loc.value}
												value={loc.value}
											>
												{loc.label}
											</SelectItem>
										))}
										{locations.length === 0 && (
											<>
												<SelectItem value="malang">
													Kota Malang
												</SelectItem>
												<SelectItem value="jakarta">
													Jakarta
												</SelectItem>
											</>
										)}
									</SelectContent>
								</Select>
							</div>
							{/* System-filled section: map + fields */}
							<div className="bg-gray-50 border border-gray-200 rounded-md p-4 relative">
								<div className="mb-2 text-xs text-gray-500 font-medium">
									Auto-filled by system
								</div>
								<div className="h-48 rounded-md overflow-hidden border mb-4 z-0">
									<MapComponent
										latitude={
											latitude
												? Number(latitude)
												: undefined
										}
										longitude={
											longitude
												? Number(longitude)
												: undefined
										}
										radius={10}
										interactive={false}
									/>
								</div>
								<div className="grid grid-cols-1 gap-6">
									<div>
										<Label className="text-sm font-medium">
											Address Details
										</Label>
										<Input
											value={addressDetails}
											readOnly
											tabIndex={-1}
											className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
										/>
									</div>
									<div className="flex justify-between gap-6">
										<div className="w-full">
											<Label className="text-sm font-medium">
												Latitude
											</Label>
											<Input
												value={latitude}
												readOnly
												tabIndex={-1}
												placeholder="Lat Location"
												className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
											/>
										</div>
										<div className="w-full">
											<Label className="text-sm font-medium">
												Longitude
											</Label>
											<Input
												value={longitude}
												readOnly
												tabIndex={-1}
												placeholder="Long Location"
												className="bg-gray-100 mt-2 cursor-not-allowed text-gray-500"
											/>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
					{/* Action Buttons */}
					<div className="flex justify-end space-x-3 pt-4 mb-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => router.back()}
							className="px-6"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							variant="default"
							className="px-6 bg-[#6B9AC4] hover:bg-[#5a89b3]"
						>
							{isEditMode ? "Save Changes" : "Save"}
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
