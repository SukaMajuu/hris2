"use client";

import React from "react";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { LeaveRequest } from "@/types/leave-request.types";
import { formatLeaveType } from "@/utils/leave";

interface LeaveRequestDetailSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	leaveRequest: LeaveRequest | null;
}

export const LeaveRequestDetailSheet = ({
	open,
	onOpenChange,
	leaveRequest,
}: LeaveRequestDetailSheetProps) => {
	// Remove the debug logging that's causing the infinite loop
	if (!leaveRequest) {
		return null;
	}

	// Get employee name from different possible fields
	const employeeName =
		leaveRequest.employee_name ||
		(leaveRequest.employee
			? `${leaveRequest.employee.first_name} ${
					leaveRequest.employee.last_name || ""
			  }`.trim()
			: "Unknown Employee");

	// Get position name from different possible fields
	const positionName =
		leaveRequest.position_name ||
		leaveRequest.employee?.position_name ||
		"Unknown Position";

	// Format status for display
	const formatStatus = (status: string) => {
		switch (status) {
			case "Waiting Approval":
				return "Waiting for Approval";
			case "Approved":
				return "Approved";
			case "Rejected":
				return "Rejected";
			default:
				return status;
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-[100%] overflow-y-auto bg-slate-50 sm:max-w-2xl">
				<SheetHeader className="border-b pb-4">
					<SheetTitle className="text-xl font-semibold text-slate-800">
						Leave Request Details
					</SheetTitle>
				</SheetHeader>

				<div className="mx-2 space-y-6 text-sm sm:mx-4">
					{/* Employee Information */}
					<div className="mb-6 rounded-lg bg-white p-6 shadow-md">
						<h3 className="mb-1 text-lg font-bold text-slate-700">
							{employeeName}
						</h3>
						<p className="text-sm text-slate-500">{positionName}</p>
					</div>

					{/* Leave Request Information */}
					<div className="rounded-lg bg-white p-6 shadow-md">
						<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
							Leave Request Information
						</h4>
						<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
							<div>
								<p className="text-xs font-medium text-slate-500">
									Leave Type
								</p>
								<p className="text-slate-700">
									{formatLeaveType(leaveRequest.leave_type)}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium text-slate-500">
									Leave Duration
								</p>
								<p className="text-slate-700">
									{new Date(
										leaveRequest.start_date
									).toLocaleDateString()}{" "}
									-{" "}
									{new Date(
										leaveRequest.end_date
									).toLocaleDateString()}
								</p>
							</div>
							<div>
								<p className="text-xs font-medium text-slate-500">
									Total Days
								</p>
								<p className="text-slate-700">
									{leaveRequest.duration || "N/A"} days
								</p>
							</div>
							<div>
								<p className="text-xs font-medium text-slate-500">
									Status
								</p>
								<p className="text-slate-700">
									{formatStatus(leaveRequest.status)}
								</p>
							</div>
							{leaveRequest.employee_note && (
								<div className="col-span-1 md:col-span-2">
									<p className="text-xs font-medium text-slate-500">
										Employee Note
									</p>
									<p className="text-slate-700">
										{leaveRequest.employee_note}
									</p>
								</div>
							)}
							{leaveRequest.admin_note && (
								<div className="col-span-1 md:col-span-2">
									<p className="text-xs font-medium text-slate-500">
										Admin Note
									</p>
									<p className="text-slate-700">
										{leaveRequest.admin_note}
									</p>
								</div>
							)}
							{leaveRequest.approved_at && (
								<div className="col-span-1 md:col-span-2">
									<p className="text-xs font-medium text-slate-500">
										Approval Date
									</p>
									<p className="text-slate-700">
										{new Date(
											leaveRequest.approved_at
										).toLocaleDateString()}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Attachment */}
					{leaveRequest.attachment && (
						<div className="rounded-lg bg-white p-6 shadow-md">
							<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
								Attachment
							</h4>
							<a
								href={leaveRequest.attachment}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 underline hover:text-blue-700"
							>
								View Attachment
							</a>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};
