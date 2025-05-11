import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Filter, Search } from "lucide-react";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable, Column } from "@/components/dataTable";
import {
	useCheckClockEmployee,
	Employee,
} from "../_hooks/useCheckClockEmployee";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";

export default function CheckClockEmployeeTab() {
	const {
		page,
		setPage,
		pageSize,
		setPageSize,
		employees,
		totalRecords,
		totalPages,
		handleEdit,
	} = useCheckClockEmployee();

	const columns: Column<Employee>[] = [
		{
			header: "No.",
			accessorKey: (item) =>
				(page - 1) * pageSize + employees.indexOf(item) + 1,
			className: "max-w-[80px]",
		},
		{
			header: "Nama",
			accessorKey: "nama",
			cell: (item) => (
				<div className="flex items-center gap-3">
					<span>{item.nama}</span>
				</div>
			),
			className: "text-start",
		},
		{
			header: "Posisi",
			accessorKey: "posisi",
		},
		{
			header: "Tipe Pekerjaan",
			accessorKey: "tipePekerjaan",
			cell: (item) => (
				<WorkTypeBadge workType={item.tipePekerjaan as WorkType} />
			),
		},
		{
			header: "Check-In",
			accessorKey: "checkIn",
		},
		{
			header: "Check-Out",
			accessorKey: "checkOut",
		},
		{
			header: "Action",
			accessorKey: "id",
			cell: (item) => (
				<div className="flex justify-center gap-2">
					<Button
						size="sm"
						variant="outline"
						className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
						onClick={(e) => {
							e.stopPropagation();
							handleEdit(item.id);
						}}
					>
						<Edit className="h-4 w-4 mr-1" />
						Edit
					</Button>
				</div>
			),
		},
	];

	return (
		<Card className="border border-gray-100 dark:border-gray-800">
			<CardContent>
				<header className="flex flex-col gap-4 mb-6">
					<h2 className="text-xl font-semibold">
						Check-Clock Employee
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

				<DataTable
					columns={columns}
					data={employees}
					page={page}
					pageSize={pageSize}
				/>

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
	);
}
