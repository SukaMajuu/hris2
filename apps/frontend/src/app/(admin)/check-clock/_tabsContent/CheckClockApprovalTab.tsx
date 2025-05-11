import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useCheckClockApproval } from "../_hooks/useCheckClockApproval";
import { ApprovalConfirmationModal } from "../_components/ApprovalConfirmationModal";

interface ApprovalItem {
	id: number;
	name: string;
	type: string;
	approved: boolean | null;
	status: string;
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
		handleViewDetails,
		openApprovalModal,
		handleApprove,
		handleReject,
	} = useCheckClockApproval();

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
							className="bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500"
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
					className="bg-blue-500 hover:bg-blue-600"
					onClick={(e) => {
						e.stopPropagation();
						handleViewDetails(item.id);
					}}
				>
					Details
				</Button>
			),
		},
	];

	return (
		<Card className="mb-6 border border-gray-100 dark:border-gray-800">
			<CardContent className="p-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
					<h2 className="text-xl font-semibold">
						Check-Clock Approval
					</h2>
				</div>

				{/* Search */}
				<div className="mb-6">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							className="pl-10 w-full bg-white border-gray-200"
							placeholder="Search Check-clock"
						/>
					</div>
				</div>

				{/* Table */}
				<DataTable
					columns={columns}
					data={approvalData}
					page={page}
					pageSize={pageSize}
				/>

				{/* Pagination */}
				<div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
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
				</div>

				{/* Approval Modal */}
				<ApprovalConfirmationModal
					isOpen={isModalOpen}
					onOpenChange={setIsModalOpen}
					selectedItem={selectedItem}
					onApprove={handleApprove}
					onReject={handleReject}
				/>
			</CardContent>
		</Card>
	);
}
