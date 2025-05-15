import { Card, CardContent } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useCheckClockApproval } from "../_hooks/useCheckClockApproval";
import { ApprovalConfirmationModal } from "../_components/ApprovalConfirmationModal";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import React, { useCallback, useState } from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";

interface ApprovalItem {
	id: number;
	name: string;
	type: string;
	approved: boolean | null;
	status: string;
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
	const {
		selectedItem,
		isModalOpen,
		setIsModalOpen,
		approvalData,
		openApprovalModal,
		handleApprove,
		handleReject,
	} = useCheckClockApproval();

	const [openSheet, setOpenSheet] = useState(false);
	const [selectedDetail, setSelectedDetail] = useState<ApprovalDetail | null>(
		null
	);
	const [nameFilter, setNameFilter] = React.useState("");
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const handleSheetViewDetails = useCallback(
		(id: number) => {
			const item = approvalData.find((d) => d.id === id);
			if (item) {
				setSelectedDetail({
					id: item.id,
					name: item.name,
					position: item.type || "-",
					status: item.status,
					permitStart: "2025-05-14",
					permitEnd: "2025-05-15",
					attachmentUrl:
						"https://th.bing.com/th/id/OIP.qrpfU_h0AKkOwdbe-siBCgHaLH?o=7&cb=iwp2rm=3&rs=1&pid=ImgDetMain",
				});
				setOpenSheet(true);
			}
		},
		[approvalData]
	);

	const columns = React.useMemo<ColumnDef<ApprovalItem>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row, table }) => {
					const { pageIndex, pageSize } = table.getState().pagination;
					return pageIndex * pageSize + row.index + 1;
				},
				meta: { className: "w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Nama",
				accessorKey: "name",
				meta: { className: "text-start" },
				enableColumnFilter: true,
			},
			{
				header: "Status Pengajuan",
				accessorKey: "status",
				cell: ({ row }) => (
					<Badge
						variant="outline"
						className="bg-gray-600 text-white hover:bg-gray-600"
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				header: "Approval",
				accessorKey: "approved",
				cell: ({ row }) => {
					const item = row.original;
					if (item.approved === null) {
						return (
							<Button
								size="sm"
								variant="outline"
								className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500 hover:cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									openApprovalModal(item);
								}}
							>
								Need Approval
							</Button>
						);
					} else if (item.approved) {
						return (
							<Badge
								variant="outline"
								className="bg-green-100 text-green-800 border-green-200"
							>
								Approved
							</Badge>
						);
					} else {
						return (
							<Badge
								variant="outline"
								className="bg-red-100 text-red-800 border-red-200"
							>
								Rejected
							</Badge>
						);
					}
				},
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Details",
				id: "details",
				cell: ({ row }) => (
					<Button
						size="sm"
						variant="default"
						className="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer"
						onClick={(e) => {
							e.stopPropagation();
							handleSheetViewDetails(row.original.id);
						}}
					>
						Details
					</Button>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[openApprovalModal, handleSheetViewDetails]
	);

	const table = useReactTable<ApprovalItem>({
		data: approvalData,
		columns,
		state: {
			columnFilters: [{ id: "name", value: nameFilter }],
			pagination,
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find((f) => f.id === "name");
			setNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return (
		<>
			<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
				<CardContent>
					<header className="flex flex-col gap-6 mb-6">
						<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
							Check-Clock Approval
						</h2>
						<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
							<div className="relative flex-1 min-w-[200px]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
								<Input
									value={nameFilter ?? ""}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
										setNameFilter(newNameFilter);
										table
											.getColumn("name")
											?.setFilterValue(newNameFilter);
									}}
									className="pl-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
									placeholder="Search by employee name..."
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					{/* Table */}
					<DataTable table={table} />

					{/* Pagination */}
					<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
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
				onApprove={handleApprove}
				onReject={handleReject}
			/>
			{/* Sheet for Details */}
			<Sheet open={openSheet} onOpenChange={setOpenSheet}>
				<SheetContent className="w-[100%] sm:max-w-2xl overflow-y-auto bg-slate-50">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-semibold text-slate-800">
							Permit Details
						</SheetTitle>
					</SheetHeader>
					{selectedDetail && (
						<div className="space-y-6 text-sm mx-2 sm:mx-4 py-6">
							<div className="bg-white shadow-md rounded-lg p-6 mb-6">
								<h3 className="text-lg font-bold text-slate-700 mb-1">
									{selectedDetail.name}
								</h3>
								<p className="text-sm text-slate-500">
									{selectedDetail.position}
								</p>
							</div>
							<div className="bg-white shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
									Permit Information
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Status
										</p>
										<p className="text-slate-700">
											{selectedDetail.status}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Permit Duration
										</p>
										<p className="text-slate-700">
											{selectedDetail.permitStart} -{" "}
											{selectedDetail.permitEnd}
										</p>
									</div>
								</div>
							</div>
							{selectedDetail.attachmentUrl && (
								<div className="bg-white shadow-md rounded-lg p-6">
									<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
										Attachment
									</h4>
									<a
										href={selectedDetail.attachmentUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-700 underline"
									>
										Lihat Bukti
									</a>
								</div>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
