import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useCheckClockApproval } from "../_hooks/useCheckClockApproval";
import { ApprovalConfirmationModal } from "../_components/ApprovalConfirmationModal";
import { LeaveRequestDetailSheet } from "../_components/LeaveRequestDetailSheet";
import React, {
	useCallback,
	useState,
	useMemo,
	useRef,
	useEffect,
} from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	PaginationState,
} from "@tanstack/react-table";
import type { LeaveRequest } from "@/types/leave-request";
import { createApprovalColumns } from "../_components/ApprovalTableColumns";

interface ApprovalItem {
	id: number;
	name: string;
	type: string;
	admin_note: string | null;
	approved: boolean | null;
	status: string;
	leaveRequest?: LeaveRequest;
}

interface ApprovalDetail {
	id: number;
	name: string;
	position: string;
	status: string;
	permitStart: string;
	permitEnd: string;
	attachmentUrl?: string;
}

export default function CheckClockApprovalTab() {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const {
		selectedItem,
		isModalOpen,
		setIsModalOpen,
		approvalData,
		openApprovalModal,
		handleApprove,
		handleReject,
		isLoading,
		error,
		refetch,
	} = useCheckClockApproval();
	const [openSheet, setOpenSheet] = useState(false);
	const [
		selectedLeaveRequest,
		setSelectedLeaveRequest,
	] = useState<LeaveRequest | null>(null);
	const [adminNote, setAdminNote] = useState("");
	const [nameFilter, setNameFilter] = React.useState("");
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	// Add a debounced search state
	const [debouncedNameFilter, setDebouncedNameFilter] = useState("");
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Debounce the search input
	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			setDebouncedNameFilter(nameFilter);
		}, 300);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [nameFilter]);

	// Use useCallback to prevent unnecessary re-renders
	const handleSheetViewDetails = useCallback(
		(id: number) => {
			const item = approvalData.find((d) => d.id === id);
			if (item?.leaveRequest) {
				setSelectedLeaveRequest(item.leaveRequest);
				setOpenSheet(true);
			} else {
				console.error("Leave request not found for ID:", id);
			}
		},
		[approvalData]
	);

	// Use useCallback to prevent unnecessary re-renders
	const handleApproveWithNote = useCallback(
		async (adminNote: string) => {
			try {
				await handleApprove(adminNote);
			} catch (error) {
				console.error("Error approving with note:", error);
			}
		},
		[handleApprove]
	);

	// Use useCallback to prevent unnecessary re-renders
	const handleRejectWithNote = useCallback(
		async (adminNote: string) => {
			try {
				await handleReject(adminNote);
			} catch (error) {
				console.error("Error rejecting with note:", error);
			}
		},
		[handleReject]
	);

	// Enhanced refresh function with smooth transition
	const handleRefreshWithTransition = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refetch();
			// Add a small delay to ensure smooth transition visibility
			await new Promise((resolve) => setTimeout(resolve, 300));
		} catch (error) {
			console.error("Error refreshing data:", error);
		} finally {
			setIsRefreshing(false);
		}
	}, [refetch]);

	// Use useMemo to prevent unnecessary re-renders
	const columns = useMemo<ColumnDef<ApprovalItem>[]>(
		() => createApprovalColumns(openApprovalModal, handleSheetViewDetails),
		[openApprovalModal, handleSheetViewDetails]
	);

	// Move useReactTable outside of useMemo to follow React Hook rules
	const table = useReactTable({
		data: approvalData,
		columns,
		state: {
			pagination,
			globalFilter: debouncedNameFilter, // Use debounced filter
		},
		onPaginationChange: setPagination,
		onGlobalFilterChange: setNameFilter,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		// Add manual pagination to limit the number of rows rendered
		manualPagination: true,
		pageCount: Math.ceil(approvalData.length / pagination.pageSize),
	});

	return (
		<>
			<Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 relative">
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
					<header
						className={`mb-6 flex flex-col gap-6 transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-90" : "opacity-100"
						}`}
					>
						<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
							Leave Request Approval
						</h2>
						<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
							<div className="relative min-w-[200px] flex-1">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400 dark:text-slate-500" />
								<Input
									value={nameFilter ?? ""}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
										setNameFilter(newNameFilter);
										// Remove direct table manipulation to prevent freezing
									}}
									className="w-full rounded-md border-slate-300 bg-white pl-10 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
									placeholder="Search by employee name..."
								/>
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
					</header>{" "}
					{/* Table */}
					<div
						className={`transition-opacity duration-300 ease-in-out ${
							isRefreshing ? "opacity-75" : "opacity-100"
						}`}
					>
						{isLoading ? (
							<div className="flex h-32 items-center justify-center">
								<div className="text-center">
									<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
									<p>Loading leave requests...</p>
								</div>
							</div>
						) : error ? (
							<div className="flex h-32 items-center justify-center">
								<div className="text-center">
									<div className="mb-4 text-red-500">
										<svg
											className="mx-auto mb-2 h-12 w-12"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<p className="font-medium text-red-600">
										Error loading data
									</p>
									<p className="mt-1 text-sm text-gray-600">
										{error.message}
									</p>
									<button
										onClick={() => window.location.reload()}
										className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
									>
										Retry
									</button>
								</div>
							</div>
						) : (
							<DataTable
								table={table}
								// Add a key to force re-render when data changes
								key={`table-${approvalData.length}-${pagination.pageIndex}-${pagination.pageSize}`}
							/>
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

			{/* Approval Modal */}
			<ApprovalConfirmationModal
				isOpen={isModalOpen}
				onOpenChange={setIsModalOpen}
				selectedItem={selectedItem}
				adminNote={adminNote}
				onAdminNoteChange={setAdminNote}
				onApprove={handleApproveWithNote}
				onReject={handleRejectWithNote}
			/>

			{/* Leave Request Detail Sheet - Only render when there's data */}
			{selectedLeaveRequest && (
				<LeaveRequestDetailSheet
					open={openSheet}
					onOpenChange={setOpenSheet}
					leaveRequest={selectedLeaveRequest}
				/>
			)}
		</>
	);
}
