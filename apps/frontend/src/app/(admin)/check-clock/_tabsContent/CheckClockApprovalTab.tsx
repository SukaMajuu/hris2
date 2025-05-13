import { Card, CardContent } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useCheckClockApproval } from "../_hooks/useCheckClockApproval";
import { ApprovalConfirmationModal } from "../_components/ApprovalConfirmationModal";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

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
		pageSize,
		setPageSize,
		page,
		setPage,
		selectedItem,
		isModalOpen,
		setIsModalOpen,
		approvalData,
		totalRecords,
		totalPages,
		openApprovalModal,
		handleApprove,
		handleReject,
	} = useCheckClockApproval();

	const [openSheet, setOpenSheet] = useState(false);
	const [selectedDetail, setSelectedDetail] = useState<ApprovalDetail | null>(null);

	function handleSheetViewDetails(id: number) {
		const item = approvalData.find((d) => d.id === id);
		if (item) {
			setSelectedDetail({
				id: item.id,
				name: item.name,
				position: item.type || "-",
				status: item.status,
				permitStart: "2025-05-14",
				permitEnd: "2025-05-15",
				attachmentUrl:"https://th.bing.com/th/id/OIP.qrpfU_h0AKkOwdbe-siBCgHaLH?o=7&cb=iwp2rm=3&rs=1&pid=ImgDetMain",
			});
			setOpenSheet(true);
		}
	}

	const columns: Column<ApprovalItem>[] = [
		{
			header: "No.",
			accessorKey: (item) => approvalData.indexOf(item) + 1,
			className: "w-[80px]",
		},
		{
			header: "Nama",
			accessorKey: "name",
			className: "text-start",
		},
		{
			header: "Status",
			accessorKey: "status",
			cell: (item) => (
				<Badge
					variant="outline"
					className="bg-gray-600 text-white hover:bg-gray-600"
				>
					{item.status}
				</Badge>
			),
		},
		{
			header: "Approve",
			accessorKey: "approved",
			cell: (item) => {
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
		},
		{
			header: "Details",
			accessorKey: "id",
			cell: (item) => (
				<Button
					size="sm"
					variant="default"
					className="bg-blue-500 hover:bg-blue-600 hover:cursor-pointer"
					onClick={(e) => {
						e.stopPropagation();
						handleSheetViewDetails(item.id);
					}}
				>
					Details
				</Button>
			),
		},
	];

	return (
		<>
			<Card className="mb-6 border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col gap-4 mb-6">
						<h2 className="text-xl font-semibold">
							Check-Clock Approval
						</h2>
						<div className="flex flex-wrap items-center gap-4 md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Employee"
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 hover:bg-[#5A89B3]"
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					{/* Table */}
					<DataTable
						columns={columns}
						data={approvalData}
						page={page}
						pageSize={pageSize}
					/>

					{/* Pagination */}
					<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
						<PageSizeComponent
							pageSize={pageSize}
							setPageSize={setPageSize}
							page={page}
							setPage={setPage}
							totalRecords={totalRecords}
						/>

						<PaginationComponent
							page={page}
							setPage={setPage}
							totalPages={totalPages}
						/>
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
				<SheetContent className="w-[100%] sm:max-w-2xl overflow-y-auto">
					<SheetHeader>
						<SheetTitle>Permit Details</SheetTitle>
					</SheetHeader>
					{selectedDetail && (
						<div className="space-y-6 text-sm mx-6 mt-6">
							<div className="border p-4 mb-4 rounded-md">
								<h3 className="text-base font-semibold mb-1">{selectedDetail.name}</h3>
								<p className="text-muted-foreground">{selectedDetail.position}</p>
							</div>
							<div className="border p-4 rounded-md">
								<h4 className="text-sm font-medium mb-4 border-b pb-1">Permit Information</h4>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="font-semibold border-b mb-1">Status</p>
										<p>{selectedDetail.status}</p>
									</div>
									<div>
										<p className="font-semibold border-b mb-1">Permit Duration</p>
										<p>{selectedDetail.permitStart} - {selectedDetail.permitEnd}</p>
									</div>
								</div>
							</div>
							{selectedDetail.attachmentUrl && (
								<div className="border p-4 rounded-md">
									<h4 className="text-sm font-medium mb-4 border-b pb-1">Attachment</h4>
									<a href={selectedDetail.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Lihat Bukti</a>
								</div>
							)}
						</div>
					)}
				</SheetContent>
			</Sheet>
		</>
	);
}
