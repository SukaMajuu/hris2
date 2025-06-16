"use client";

import * as React from "react";

import { useLeaveRequestsQuery } from "@/api/queries/leave-request.queries";
import { Badge } from "@/components/ui/badge";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Attendance } from "@/types/attendance.types";
import { LeaveRequest } from "@/types/leave-request.types";
import { formatLeaveType } from "@/utils/leave";
import { formatWorkHours } from "@/utils/time";
import { utcToLocal } from "@/utils/timezone";

interface AttendanceDetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedData: Attendance | null;
}

// Helper function to get status badge for leave requests
const getLeaveStatusBadge = (status: string) => {
	switch (status.toLowerCase()) {
		case "approved":
			return <Badge className="bg-green-600 text-white">Approved</Badge>;
		case "rejected":
			return <Badge className="bg-red-600 text-white">Rejected</Badge>;
		case "waiting_approval":
		case "waiting approval":
			return (
				<Badge className="bg-yellow-600 text-white">
					Waiting Approval
				</Badge>
			);
		default:
			return <Badge className="bg-gray-600 text-white">{status}</Badge>;
	}
};

export const AttendanceDetailSheet = ({
	open,
	onOpenChange,
	selectedData,
}: AttendanceDetailSheetProps) => {
	// Fetch leave requests data for admin view
	const {
		data: leaveRequestsData,
		isLoading: isLoadingLeaveRequests,
	} = useLeaveRequestsQuery(
		1,
		100,
		selectedData?.employee_id
			? { employee_id: selectedData.employee_id }
			: undefined
	);
	// Filter leave requests for the specific date when status is 'leave' and only show approved requests
	const filteredLeaveRequests = React.useMemo(() => {
		if (
			!selectedData ||
			selectedData.status !== "leave" ||
			!leaveRequestsData?.items
		) {
			return [];
		}

		const attendanceDate = new Date(selectedData.date);
		return leaveRequestsData.items.filter((request: LeaveRequest) => {
			const startDate = new Date(request.start_date);
			const endDate = new Date(request.end_date);

			// Check if attendance date falls within leave request date range and status is approved
			return (
				attendanceDate >= startDate &&
				attendanceDate <= endDate &&
				request.status.toLowerCase() === "approved"
			);
		});
	}, [selectedData, leaveRequestsData]);

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
								{" "}
								<div>
									<p className="text-xs font-medium text-slate-500">
										Date
									</p>
									<p className="text-slate-700">
										{(() => {
											const dateToUse =
												selectedData.clock_in ||
												selectedData.date;
											const date = new Date(dateToUse);

											// Check if the date is valid
											if (Number.isNaN(date.getTime())) {
												return "Invalid Date";
											}

											return date.toLocaleDateString(
												"en-US",
												{
													year: "numeric",
													month: "long",
													day: "2-digit",
												}
											);
										})()}
									</p>
								</div>{" "}
								<div>
									<p className="text-xs font-medium text-slate-500">
										Clock In
									</p>
									<p className="text-slate-700">
										{utcToLocal(selectedData.clock_in) ||
											"-"}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Clock Out
									</p>
									<p className="text-slate-700">
										{utcToLocal(selectedData.clock_out) ||
											"-"}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Work Hours
									</p>
									<p className="text-slate-700">
										{formatWorkHours(
											selectedData.work_hours
										)}
									</p>
								</div>
								<div>
									<p className="text-xs font-medium text-slate-500">
										Status
									</p>{" "}
									<p className="text-slate-700">
										{(() => {
											const { status } = selectedData;
											if (
												status === "on_time" ||
												status === "ontime"
											) {
												return "Ontime";
											}
											if (status === "late") {
												return "Late";
											}
											if (status === "early_leave") {
												return "Early Leave";
											}
											if (status === "absent") {
												return "Absent";
											}
											if (status === "leave") {
												return "Leave";
											}
											return status;
										})()}
									</p>
								</div>
							</div>
						</div>{" "}
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
						</div>{" "}
						{/* Leave Information - only show when status is leave */}
						{selectedData.status === "leave" && (
							<div className="bg-white shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
									Leave Information
									<span className="ml-2 text-xs text-slate-500">
										for{" "}
										{new Date(
											selectedData.date
										).toLocaleDateString()}
									</span>
								</h4>
								{(() => {
									if (isLoadingLeaveRequests) {
										return (
											<div className="text-center py-4">
												<p className="text-slate-500">
													Loading leave requests...
												</p>
											</div>
										);
									}

									if (filteredLeaveRequests.length > 0) {
										return (
											<div className="space-y-6">
												{filteredLeaveRequests.map(
													(
														leaveRequest: LeaveRequest
													) => (
														<div
															key={
																leaveRequest.id
															}
															className="border border-gray-200 rounded-lg p-4"
														>
															{/* Leave Request Header */}
															<div className="mb-4 pb-3 border-b border-gray-100">
																<div className="flex items-center justify-between">
																	<h5 className="text-lg font-bold text-slate-700">
																		{formatLeaveType(
																			leaveRequest.leave_type
																		)}
																	</h5>
																	{getLeaveStatusBadge(
																		leaveRequest.status
																	)}
																</div>
																<p className="text-sm text-slate-500 mt-1">
																	Submitted on{" "}
																	{new Date(
																		leaveRequest.created_at
																	).toLocaleDateString()}
																</p>
															</div>

															{/* Leave Details Grid */}
															<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
																<div>
																	<p className="text-xs font-medium text-slate-500">
																		Start
																		Date
																	</p>
																	<p className="text-slate-700">
																		{new Date(
																			leaveRequest.start_date
																		).toLocaleDateString()}
																	</p>
																</div>
																<div>
																	<p className="text-xs font-medium text-slate-500">
																		End Date
																	</p>
																	<p className="text-slate-700">
																		{new Date(
																			leaveRequest.end_date
																		).toLocaleDateString()}
																	</p>
																</div>
																<div>
																	<p className="text-xs font-medium text-slate-500">
																		Duration
																	</p>
																	<p className="text-slate-700">
																		{(() => {
																			const start = new Date(
																				leaveRequest.start_date
																			);
																			const end = new Date(
																				leaveRequest.end_date
																			);
																			const diffTime = Math.abs(
																				end.getTime() -
																					start.getTime()
																			);
																			const diffDays =
																				Math.ceil(
																					diffTime /
																						(1000 *
																							60 *
																							60 *
																							24)
																				) +
																				1;
																			const dayText =
																				diffDays >
																				1
																					? "s"
																					: "";
																			return `${diffDays} day${dayText}`;
																		})()}
																	</p>
																</div>
																<div>
																	<p className="text-xs font-medium text-slate-500">
																		Request
																		ID
																	</p>
																	<p className="text-slate-700 font-mono text-sm">
																		#
																		{
																			leaveRequest.id
																		}
																	</p>
																</div>
																<div className="md:col-span-2">
																	<p className="text-xs font-medium text-slate-500">
																		Employee
																		Reason
																	</p>
																	<div className="mt-2 p-3 bg-slate-50 rounded-md border">
																		<p className="text-slate-700 text-sm">
																			{leaveRequest.employee_note ||
																				"No reason provided"}
																		</p>
																	</div>
																</div>
																{leaveRequest.admin_note && (
																	<div className="md:col-span-2">
																		<p className="text-xs font-medium text-slate-500">
																			Admin
																			Note
																		</p>
																		<div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
																			<p className="text-slate-700 text-sm">
																				{
																					leaveRequest.admin_note
																				}
																			</p>
																		</div>
																	</div>
																)}
																{leaveRequest.attachment && (
																	<div className="md:col-span-2">
																		<p className="text-xs font-medium text-slate-500">
																			Supporting
																			Document
																		</p>
																		<div className="mt-2">
																			<a
																				href={
																					leaveRequest.attachment
																				}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline text-sm"
																			>
																				<svg
																					className="w-4 h-4"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={
																							2
																						}
																						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
																					/>
																				</svg>
																				View
																				Attachment
																			</a>
																		</div>
																	</div>
																)}
															</div>

															{/* Request Timeline */}
															<div className="mt-4 pt-4 border-t border-gray-100">
																<p className="text-xs font-medium text-slate-500 mb-2">
																	Request
																	Timeline
																</p>
																<div className="text-xs text-slate-500 space-y-1">
																	<div className="flex justify-between">
																		<span>
																			Submitted:
																		</span>
																		<span>
																			{new Date(
																				leaveRequest.created_at
																			).toLocaleString()}
																		</span>
																	</div>
																	{leaveRequest.updated_at &&
																		leaveRequest.updated_at !==
																			leaveRequest.created_at && (
																			<div className="flex justify-between">
																				<span>
																					Last
																					Updated:
																				</span>
																				<span>
																					{new Date(
																						leaveRequest.updated_at
																					).toLocaleString()}
																				</span>
																			</div>
																		)}
																</div>
															</div>
														</div>
													)
												)}
											</div>
										);
									}

									return (
										<div className="text-center py-8">
											<div className="text-gray-400 mb-2">
												<svg
													className="w-8 h-8 mx-auto"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											</div>
											<p className="text-slate-500 text-sm">
												No leave requests found for this
												date
											</p>
											<p className="text-slate-400 text-xs mt-1">
												The employee may not have
												submitted a leave request for
												this period
											</p>
										</div>
									);
								})()}
							</div>
						)}
					</div>
				)}
			</SheetContent>
		</Sheet>
	);
};
