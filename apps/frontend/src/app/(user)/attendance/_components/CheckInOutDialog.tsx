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
import { Crosshair } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(
	() =>
		import("@/components/MapComponent").then((mod) => ({
			default: mod.MapComponent,
		})),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-full items-center justify-center text-gray-400">
				Loading map...
			</div>
		),
	}
);

interface DialogFormData {
	attendanceType: string;
	checkIn: string;
	checkOut: string;
	latitude: string;
	longitude: string;
	permitEndDate: string;
	startDate: string;
	reason: string;
	evidence: FileList | null;
}

interface CheckInOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	dialogTitle: string;
	actionType: "check-in" | "check-out";
	formMethods: UseFormReturn<DialogFormData>;
	onSubmit: (data: DialogFormData) => void;
}

export function CheckInOutDialog({
	open,
	onOpenChange,
	dialogTitle,
	actionType,
	formMethods,
	onSubmit,
}: CheckInOutDialogProps) {
	const { register, handleSubmit, watch, setValue } = formMethods;
	const formData = watch();

	React.useEffect(() => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setValue("latitude", position.coords.latitude.toString());
				setValue("longitude", position.coords.longitude.toString());
			},
			(error) => {
				console.error("Error getting current location:", error);
				setValue("latitude", "");
				setValue("longitude", "");
			}
		);
	}, [setValue, actionType]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-slate-50 p-0 sm:max-w-[700px] dark:bg-slate-900">
				<DialogHeader className="border-b px-6 py-4 dark:border-slate-700">
					<DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
						{dialogTitle}
					</DialogTitle>
					<DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
						Your location and work schedule will be automatically
						recorded.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="max-h-[calc(100vh-220px)] space-y-6 overflow-y-auto px-6 py-4">
						{/* Section 1: Attendance Type */}
						<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
							<div className="space-y-2">
								<Label
									htmlFor="attendanceType"
									className="text-sm font-medium text-slate-700 dark:text-slate-300"
								>
									Attendance Type
								</Label>
								<select
									id="attendanceType"
									className="flex h-10 w-full cursor-not-allowed rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 opacity-70 ring-offset-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:ring-offset-slate-900"
									{...register("attendanceType")}
									disabled // Always disabled for CheckIn/Out dialog
								>
									{actionType === "check-in" && (
										<option value="check-in">
											Check-In
										</option>
									)}
									{actionType === "check-out" && (
										<option value="check-out">
											Check-Out
										</option>
									)}
								</select>
							</div>
						</div>

						{/* Section 2: Work Schedule (Display only) */}
						<div className="rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
							<Label className="mb-4 block text-base font-semibold text-slate-800 dark:text-slate-200">
								Work Schedule (Information)
							</Label>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<Label
										htmlFor="workType"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Work Type
									</Label>
									<Input
										id="workType"
										placeholder="WFO"
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="checkInSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Check-In Time
									</Label>
									<Input
										id="checkInSchedule"
										placeholder="07:00 - 08:00"
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="breakSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Break Time
									</Label>
									<Input
										id="breakSchedule"
										placeholder="12:00 - 13:00"
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="checkOutSchedule"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Check-Out Time
									</Label>
									<Input
										id="checkOutSchedule"
										placeholder="17:00 - 18:00"
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
							</div>
						</div>

						{/* Section 3: Location (Display & Map) */}
						<div className="space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-slate-800">
							<div>
								<Label className="mb-2 block text-base font-semibold text-slate-800 dark:text-slate-200">
									Current Location (Information)
								</Label>
								<Button
									variant="outline"
									type="button"
									onClick={() => {
										navigator.geolocation.getCurrentPosition(
											(position) => {
												setValue(
													"latitude",
													position.coords.latitude.toString()
												);
												setValue(
													"longitude",
													position.coords.longitude.toString()
												);
											},
											(error) =>
												console.error(
													"Error getting current location:",
													error
												)
										);
									}}
									className="flex w-full items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
								>
									<Crosshair className="h-4 w-4" />
									Refresh Current Location
								</Button>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1">
									<Label
										htmlFor="latitude"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Latitude
									</Label>
									<Input
										id="latitude"
										value={formData.latitude || ""}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
								<div className="space-y-1">
									<Label
										htmlFor="longitude"
										className="text-xs text-slate-500 dark:text-slate-400"
									>
										Longitude
									</Label>
									<Input
										id="longitude"
										value={formData.longitude || ""}
										disabled
										className="cursor-not-allowed bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
									/>
								</div>
							</div>
							<div className="min-h-[150px] overflow-hidden rounded-md border border-slate-300 dark:border-slate-700">
								<MapComponent
									latitude={parseFloat(
										formData.latitude || "-6.2088"
									)}
									longitude={parseFloat(
										formData.longitude || "106.8456"
									)}
									radius={100}
									onPositionChange={() => {
										/* readonly, do nothing */
									}}
									interactive={false}
								/>
							</div>
						</div>
					</div>
					<DialogFooter className="rounded-b-lg border-t bg-slate-100 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-[#6B9AC4] text-white hover:bg-[#5A89B3]"
						>
							{actionType === "check-in"
								? "Confirm Check-In"
								: "Confirm Check-Out"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
