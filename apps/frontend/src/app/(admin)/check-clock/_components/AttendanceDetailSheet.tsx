"use client";

import * as React from "react";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Attendance } from "@/types/attendance";
import { formatWorkHours } from "@/utils/time";

interface AttendanceDetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedData: Attendance | null;
}

export function AttendanceDetailSheet({
	open,
	onOpenChange,
	selectedData,
}: AttendanceDetailSheetProps) {
	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-[100%] sm:max-w-2xl overflow-y-auto bg-slate-50">
				<SheetHeader className="pb-4 border-b">
					<SheetTitle className="text-xl font-semibold text-slate-800">
						Attendance Details
					</SheetTitle>
				</SheetHeader>
				{selectedData && (
					<div className="space-y-6 text-sm mx-2 sm:mx-4 py-6">
						<div className="bg-white shadow-md rounded-lg p-6 mb-6">
							<h3 className="text-lg font-bold text-slate-700">
								{selectedData.employee?.first_name}{" "}
								{selectedData.employee?.last_name}
							</h3>
							<p className="text-sm text-slate-500">
								{selectedData.employee?.position_name || "N/A"}
							</p>
						</div>

						<div className="bg-white shadow-md rounded-lg p-6">
							<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
								Attendance Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<p className="text-xs font-medium text-slate-500">
										Date
									</p>
									<p className="text-slate-700">
										{selectedData.date}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Clock In
									</p>
									<p className="text-slate-700">
										{selectedData.clock_in || "-"}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Clock Out
									</p>
									<p className="text-slate-700">
										{selectedData.clock_out || "-"}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Work Hours
									</p>
									<p className="text-slate-700">
										{formatWorkHours(selectedData.work_hours)}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Status
									</p>
									<p className="text-slate-700">
										{selectedData.status === "on_time"
											? "On Time"
											: selectedData.status === "late"
											? "Late"
											: selectedData.status ===
											  "early_leave"
											? "Early Leave"
											: selectedData.status === "absent"
											? "Absent"
											: selectedData.status === "leave"
											? "Leave"
											: selectedData.status}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white shadow-md rounded-lg p-6">
							<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
								Location Information
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
								<div>
									<p className="text-xs font-medium text-slate-500">
										Clock In Location
									</p>
									{selectedData.clock_in_lat &&
									selectedData.clock_in_long ? (
										<a
											href={`https://www.google.com/maps?q=${selectedData.clock_in_lat},${selectedData.clock_in_long}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800 underline text-sm"
										>
											View on Google Maps
										</a>
									) : (
										<p className="text-slate-700">-</p>
									)}
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Clock Out Location
									</p>
									{selectedData.clock_out_lat &&
									selectedData.clock_out_long ? (
										<a
											href={`https://www.google.com/maps?q=${selectedData.clock_out_lat},${selectedData.clock_out_long}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:text-blue-800 underline text-sm"
										>
											View on Google Maps
										</a>
									) : (
										<p className="text-slate-700">-</p>
									)}
								</div>
							</div>
						</div>

						<div className="bg-white shadow-md rounded-lg p-6">
							<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
								Support Evidence
							</h4>
							{selectedData.status === "leave" ? (
								<div className="space-y-3">
									<div className="text-sm">
										<span className="font-medium text-slate-500">
											Leave Type:{" "}
										</span>
										<span className="text-slate-700">
											{selectedData.status || "-"}
										</span>
									</div>
									<div className="text-sm">
										<span className="font-medium text-slate-500">
											Evidence:{" "}
										</span>
										<span className="text-slate-700">
											-
										</span>
									</div>
									<p className="text-xs text-slate-400 mt-2">
										Support evidence is only required for
										leave/permit attendance types.
									</p>
								</div>
							) : (
								<span className="text-xs text-slate-500">
									No support evidence required for this
									attendance type.
								</span>
							)}
						</div>
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
}
