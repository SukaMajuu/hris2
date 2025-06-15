import React, { useState, useMemo, useCallback } from "react";
import {
	useMyLeaveRequests,
	useCreateLeaveRequestMutation,
} from "../_hooks/useMyLeaveRequests";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Search, FileText, Eye, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";
import { PermitDialog } from "../_components/PermitDialog";
import {
	CreateLeaveRequestRequest,
	LeaveRequest,
	LeaveRequestStatus,
	LeaveType,
} from "@/types/leave-request";
import { toast } from "sonner";

// Helper interface for table display data
interface PermitTableData {
	id: number;
	leaveType: string;
	startDate: string;
	endDate: string;
	reason: string;
	status: LeaveRequestStatus;
	attachmentUrl?: string;
	adminNote?: string;
	submittedAt: string;
	duration: string;
}

const getStatusBadge = (status: string) => {
	switch (status.toLowerCase()) {
		case "approved":
			return (
				<Badge className="border-green-200 bg-green-100 text-green-800">
					Approved
				</Badge>
			);
		case "rejected":
			return (
				<Badge className="border-red-200 bg-red-100 text-red-800">
					Rejected
				</Badge>
			);
		case "waiting_approval":
			return (
				<Badge className="border-yellow-200 bg-yellow-100 text-yellow-800">
					Waiting Approval
				</Badge>
			);
		default:
			return (
				<Badge className="border-gray-200 bg-gray-100 text-gray-800">
					{status}
				</Badge>
			);
	}
};

const formatLeaveType = (leaveType: string) => {
	return leaveType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Define render function outside the component instead of component
const renderDetailsCell = (id: number, onViewDetails: (id: number) => void) => (
	<Button
		size="sm"
		variant="default"
		className="bg-blue-500 text-white hover:bg-blue-600"
		onClick={(e) => {
			e.stopPropagation();
			onViewDetails(id);
		}}
	>
		<Eye className="mr-1 h-4 w-4" />
		View
	</Button>
);

export default function PermitTab() {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {
		data: leaveRequestsData,
		isLoading,
		error,
		refetch,
	} = useMyLeaveRequests(currentPage, pageSize);

	// Create leave request mutation
	const createLeaveRequestMutation = useCreateLeaveRequestMutation();
	const [openSheet, setOpenSheet] = useState(false);
	const [selectedDetail, setSelectedDetail] = useState<LeaveRequest | null>(
		null
	);
	const [openDialog, setOpenDialog] = useState(false);
	const [nameFilter, setNameFilter] = useState("");

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const form = useForm<CreateLeaveRequestRequest>({
		defaultValues: {
			leave_type: LeaveType.SICK_LEAVE,
			start_date: "",
			end_date: "",
			employee_note: "",
			attachment: undefined,
		},
	});
	const { reset, watch } = form;

	// Only watch specific field needed for PermitDialog props
	const currentLeaveType = watch("leave_type");

	// Memoize expensive calculations
	const calculateDuration = useCallback(
		(startDate: string, endDate: string): string => {
			const start = new Date(startDate);
			const end = new Date(endDate);
			const diffTime = Math.abs(end.getTime() - start.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
			return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
		},
		[]
	);

	// Transform leave request data for table
	const permitData: PermitTableData[] = useMemo(() => {
		if (!leaveRequestsData?.items) return [];

		return leaveRequestsData.items.map((request: LeaveRequest) => ({
			id: request.id,
			leaveType: formatLeaveType(request.leave_type),
			startDate: request.start_date,
			endDate: request.end_date,
			reason: request.employee_note || "No reason provided",
			status: request.status,
			attachmentUrl: request.attachment || undefined,
			adminNote: request.admin_note || undefined,
			submittedAt: request.created_at || new Date().toISOString(),
			duration: calculateDuration(request.start_date, request.end_date),
		}));
	}, [leaveRequestsData, calculateDuration]);

	const handleViewDetails = useCallback(
		(id: number) => {
			const request = leaveRequestsData?.items.find(
				(item: LeaveRequest) => item.id === id
			);
			if (request) {
				setSelectedDetail(request);
				setOpenSheet(true);
			}
		},
		[leaveRequestsData?.items]
	);
	const onSubmit = useCallback(
		async (data: CreateLeaveRequestRequest) => {
			try {
				// Call the API mutation to create the leave request
				await createLeaveRequestMutation.mutateAsync(data);

				// Close dialog and reset form
				setOpenDialog(false);
				reset();

				// Show success notification
				toast.success("Leave request submitted successfully!", {
					description:
						"Your leave request has been submitted and is awaiting approval.",
				});

				// Refetch data after submission
				await refetch();
			} catch (error) {
				// Error handling is now done by PermitDialog component
				// Just log the error here and let PermitDialog handle user notification
				console.error("Error submitting leave request:", error);

				// Don't show any toast messages here to avoid conflicts with PermitDialog
				// The PermitDialog component will handle all error display logic
			}
		},
		[createLeaveRequestMutation, reset, refetch]
	); // Memoize refetch callback to prevent unnecessary re-renders
	const handleRefetch = useCallback(async () => {
		await refetch();
	}, [refetch]); // Enhanced refresh function with smooth transition
	const handleRefreshWithTransition = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refetch();
			// Add a small delay to ensure smooth transition visibility
			await new Promise((resolve) => setTimeout(resolve, 300));
		} catch (error) {
			console.error("Error refreshing data:", error);
			toast.error("Gagal me-refresh data. Silakan coba lagi.");
		} finally {
			setIsRefreshing(false);
		}
	}, [refetch]);

	const openPermitDialog = useCallback(() => {
		reset();
		setOpenDialog(true);
	}, [reset]);

	const columns: ColumnDef<PermitTableData>[] = useMemo(
		() => [
			{
				header: "No.",
				cell: ({ row, table }) => {
					const { pageIndex, pageSize } = table.getState().pagination;
					return pageIndex * pageSize + row.index + 1;
				},
				meta: { className: "w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Leave Type",
				accessorKey: "leaveType",
				enableColumnFilter: true,
			},
			{
				header: "Start Date",
				accessorKey: "startDate",
				cell: ({ row }) => {
					return new Date(
						row.original.startDate
					).toLocaleDateString();
				},
			},
			{
				header: "End Date",
				accessorKey: "endDate",
				cell: ({ row }) => {
					return new Date(row.original.endDate).toLocaleDateString();
				},
			},
			{
				header: "Duration",
				accessorKey: "duration",
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => getStatusBadge(row.original.status),
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Submitted",
				accessorKey: "submittedAt",
				cell: ({ row }) => {
					return new Date(
						row.original.submittedAt
					).toLocaleDateString();
				},
			},
			{
				header: "Details",
				id: "details",
				cell: ({ row }) =>
					renderDetailsCell(row.original.id, handleViewDetails),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleViewDetails]
	);

	const table = useReactTable({
		data: permitData,
		columns,
		state: {
			columnFilters: [{ id: "leaveType", value: nameFilter }],
			pagination,
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find(
				(f) => f.id === "leaveType"
			);
			setNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: (updater) => {
			const newPagination =
				typeof updater === "function" ? updater(pagination) : updater;
			setPagination(newPagination);
			setCurrentPage(newPagination.pageIndex + 1);
			setPageSize(newPagination.pageSize);
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		pageCount: leaveRequestsData?.pagination?.total_pages || 0,
		manualPagination: true,
		autoResetPageIndex: false,
	});
	return (
		<>
			<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 relative">
				{" "}
				{/* Refresh loading overlay */}
				{isRefreshing && (
					<div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] rounded-lg z-10 flex items-center justify-center transition-all duration-200">
						<div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">
							<RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
							<span className="text-xs text-slate-600 font-medium">
								Refreshing...
							</span>
						</div>
					</div>
				)}
				<CardContent>
					{" "}
					<header
						className={`mb-6 flex flex-col gap-6 transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-90" : "opacity-100"
						}`}
					>
						<div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
								My Leave Requests
							</h2>
							<Button
								variant="outline"
								className="gap-2 border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
								onClick={openPermitDialog}
							>
								<Plus className="h-4 w-4" />
								New Leave Request
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
									placeholder="Search by leave type..."
								/>{" "}
							</div>{" "}
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
								{isRefreshing ? "Refreshing..." : "Refresh"}
							</Button>
						</div>
						{error && (
							<div className="text-sm text-red-500">
								Error loading leave requests: {error.message}
							</div>
						)}
					</header>{" "}
					{/* Table */}
					<div
						className={`transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-75" : "opacity-100"
						}`}
					>
						{isLoading ? (
							<div className="flex h-32 items-center justify-center">
								<div className="text-slate-500">
									Loading leave requests...
								</div>
							</div>
						) : (
							<DataTable table={table} />
						)}
					</div>{" "}
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
			<Sheet open={openSheet} onOpenChange={setOpenSheet}>
				<SheetContent className="w-[100%] overflow-y-auto bg-slate-50 sm:max-w-2xl">
					<SheetHeader className="border-b pb-4">
						<SheetTitle className="text-xl font-semibold text-slate-800">
							Leave Request Details
						</SheetTitle>
					</SheetHeader>
					{selectedDetail && (
						<div className="mx-2 space-y-6 text-sm sm:mx-4">
							<div className="mb-6 rounded-lg bg-white p-6 shadow-md">
								{" "}
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
									Leave Information
								</h4>
								<div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Start Date
										</p>{" "}
										<p className="text-slate-700">
											{new Date(
												selectedDetail.start_date
											).toLocaleDateString()}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											End Date
										</p>
										<p className="text-slate-700">
											{new Date(
												selectedDetail.end_date
											).toLocaleDateString()}
										</p>
									</div>{" "}
									<div className="col-span-1 md:col-span-2">
										<p className="text-xs font-medium text-slate-500">
											Reason
										</p>
										<p className="text-slate-700">
											{selectedDetail.employee_note ||
												"No reason provided"}
										</p>
									</div>
									{selectedDetail.admin_note && (
										<div className="col-span-1 md:col-span-2">
											<p className="text-xs font-medium text-slate-500">
												Admin Note
											</p>
											<p className="text-slate-700">
												{selectedDetail.admin_note}
											</p>
										</div>
									)}
								</div>
							</div>{" "}
							{selectedDetail.attachment && (
								<div className="rounded-lg bg-white p-6 shadow-md">
									<h4 className="text-md mb-4 border-b pb-2 font-semibold text-slate-700">
										Attachment
									</h4>
									<a
										href={selectedDetail.attachment}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 underline hover:text-blue-700"
									>
										View Attachment
									</a>
								</div>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>{" "}
			{/* New Leave Request Dialog */}{" "}
			<PermitDialog
				open={openDialog}
				onOpenChange={setOpenDialog}
				dialogTitle="Request Leave"
				formMethods={form}
				onSubmit={onSubmit}
				currentAttendanceType={currentLeaveType}
				onRefetch={handleRefetch}
			/>
		</>
	);
}
