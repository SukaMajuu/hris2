import { RefreshCw, Search, Plus } from "lucide-react";
import React, { useState } from "react";

import { DataTable } from "@/components/dataTable";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	LEAVE_UI_MESSAGES,
	LEAVE_TABLE_HEADERS,
	LEAVE_UI_CONFIG,
} from "@/const/leave";
import { CreateLeaveRequestRequest } from "@/types/leave-request.types";
import { formatLeaveType } from "@/utils/leave";

import { PermitDialog } from "./_components/PermitDialog";
import { useLeaveRequestDialog } from "./_hooks/useLeaveRequestDialog";
import { useLeaveRequestRefresh } from "./_hooks/useLeaveRequestRefresh";
import { useLeaveRequestTable } from "./_hooks/useLeaveRequestTable";
import { useLeaveRequests } from "./_hooks/useLeaveRequests";

const PermitTab = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState<number>(
		LEAVE_UI_CONFIG.DEFAULT_PAGE_SIZE
	);

	// Data fetching hook
	const {
		leaveRequestsData,
		isLoading,
		error,
		createLeaveRequest,
		refreshLeaveRequests,
	} = useLeaveRequests(undefined, currentPage, pageSize);

	// Refresh management hook
	const {
		isRefreshing,
		handleRefreshWithTransition,
		handleRefetch,
	} = useLeaveRequestRefresh({
		refreshLeaveRequests,
	});

	// Table management hook
	const {
		table,
		nameFilter,
		setNameFilter,
		getStatusBadge,
	} = useLeaveRequestTable({
		leaveRequestsData: leaveRequestsData || null,
		currentPage,
		setCurrentPage,
		pageSize,
		setPageSize: (size: number) => setPageSize(size),
	});

	// Dialog management hook
	const {
		openDialog,
		openSheet,
		selectedDetail,
		form,
		currentLeaveType,
		openPermitDialog,
		closeDialog,
		closeDetailSheet,
		handleLeaveRequestSubmit,
	} = useLeaveRequestDialog({
		onSubmit: createLeaveRequest,
		onRefetch: handleRefetch,
	});

	// Handle form submission
	const onSubmit = async (data: CreateLeaveRequestRequest) => {
		await handleLeaveRequestSubmit(data);
	};

	return (
		<>
			<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 relative">
				{/* Refresh loading overlay */}
				{isRefreshing && (
					<div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] rounded-lg z-10 flex items-center justify-center transition-all duration-200">
						<div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">
							<RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
							<span className="text-xs text-slate-600 font-medium">
								{LEAVE_UI_MESSAGES.REFRESHING}
							</span>
						</div>
					</div>
				)}
				<CardContent>
					<header
						className={`mb-6 flex flex-col gap-6 transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-90" : "opacity-100"
						}`}
					>
						<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
								{LEAVE_UI_MESSAGES.MY_LEAVE_REQUESTS}
							</h2>
							<Button
								variant="outline"
								className="gap-2 border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
								onClick={openPermitDialog}
							>
								<Plus className="h-4 w-4" />
								{LEAVE_UI_MESSAGES.NEW_LEAVE_REQUEST}
							</Button>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
							<div className="relative min-w-[200px] flex-1">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400 dark:text-slate-500" />
								<Input
									value={nameFilter ?? ""}
									onChange={(event) => {
										const newFilter = event.target.value;
										setNameFilter(newFilter);
										table
											.getColumn("leaveType")
											?.setFilterValue(newFilter);
									}}
									className="w-full rounded-md border-slate-300 bg-white pl-10 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
									placeholder={
										LEAVE_UI_MESSAGES.SEARCH_PLACEHOLDER
									}
								/>
							</div>
							<Button
								variant="outline"
								className={`gap-2 rounded-md border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-all duration-200 ${
									isRefreshing
										? "opacity-70 scale-98"
										: "opacity-100 scale-100"
								}`}
								onClick={handleRefreshWithTransition}
								disabled={isLoading || isRefreshing}
							>
								<RefreshCw
									className={`h-4 w-4 transition-transform duration-500 ${
										isRefreshing ? "animate-spin" : ""
									}`}
								/>
								{isRefreshing
									? LEAVE_UI_MESSAGES.REFRESHING
									: "Refresh"}
							</Button>
						</div>
						{error && (
							<div className="text-sm text-red-500">
								Error loading leave requests: {error.message}
							</div>
						)}
					</header>

					{/* Table */}
					<div
						className={`transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-75" : "opacity-100"
						}`}
					>
						{isLoading ? (
							<div className="flex h-32 items-center justify-center">
								<div className="text-slate-500">
									{LEAVE_UI_MESSAGES.LOADING}
								</div>
							</div>
						) : (
							<DataTable table={table} />
						)}
					</div>

					{/* Pagination */}
					<footer
						className={`mt-4 flex flex-col items-center justify-between gap-4 md:flex-row transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-75" : "opacity-100"
						}`}
					>
						<PageSizeComponent table={table} />
						<PaginationComponent table={table} />
					</footer>
				</CardContent>
			</Card>

			{/* Detail Sheet */}
			<Sheet open={openSheet} onOpenChange={closeDetailSheet}>
				<SheetContent className="w-[100%] overflow-y-auto bg-slate-50 sm:max-w-2xl">
					<SheetHeader className="border-b pb-4">
						<SheetTitle className="text-xl font-semibold text-slate-800">
							{LEAVE_TABLE_HEADERS.LEAVE_REQUEST_DETAILS}
						</SheetTitle>
					</SheetHeader>
					{selectedDetail && (
						<div className="mx-2 space-y-6 text-sm sm:mx-4">
							<div className="mb-6 rounded-lg bg-white p-6 shadow-md">
								<h3 className="mb-1 text-lg font-bold text-slate-700">
									{formatLeaveType(selectedDetail.leave_type)}
								</h3>
								<p className="text-sm text-slate-500">
									Submitted on{" "}
									{new Date(
										selectedDetail.created_at
									).toLocaleDateString()}
								</p>
								<div className="mt-2">
									{getStatusBadge(selectedDetail.status)}
								</div>
							</div>
							<div className="rounded-lg bg-white p-6 shadow-md">
								<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
									{LEAVE_TABLE_HEADERS.LEAVE_INFORMATION}
								</h4>
								<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
									<div>
										<p className="text-xs font-medium text-slate-500">
											{LEAVE_TABLE_HEADERS.START_DATE}
										</p>
										<p className="text-slate-700">
											{new Date(
												selectedDetail.start_date
											).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											{LEAVE_TABLE_HEADERS.END_DATE}
										</p>
										<p className="text-slate-700">
											{new Date(
												selectedDetail.end_date
											).toLocaleDateString()}
										</p>
									</div>
									<div className="col-span-1 md:col-span-2">
										<p className="text-xs font-medium text-slate-500">
											{LEAVE_TABLE_HEADERS.REASON}
										</p>
										<p className="text-slate-700">
											{selectedDetail.employee_note ||
												LEAVE_UI_MESSAGES.NO_REASON_PROVIDED}
										</p>
									</div>
									{selectedDetail.admin_note && (
										<div className="col-span-1 md:col-span-2">
											<p className="text-xs font-medium text-slate-500">
												{LEAVE_TABLE_HEADERS.ADMIN_NOTE}
											</p>
											<p className="text-slate-700">
												{selectedDetail.admin_note}
											</p>
										</div>
									)}
								</div>
							</div>
							{selectedDetail.attachment && (
								<div className="rounded-lg bg-white p-6 shadow-md">
									<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
										{LEAVE_TABLE_HEADERS.ATTACHMENT}
									</h4>
									<a
										href={selectedDetail.attachment}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 underline hover:text-blue-700"
									>
										{LEAVE_UI_MESSAGES.VIEW_ATTACHMENT}
									</a>
								</div>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* New Leave Request Dialog */}
			<PermitDialog
				open={openDialog}
				onOpenChange={closeDialog}
				dialogTitle="Request Leave"
				formMethods={form}
				onSubmit={onSubmit}
				currentAttendanceType={currentLeaveType}
				onRefetch={handleRefetch}
			/>
		</>
	);
};

export default PermitTab;
