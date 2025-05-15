import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Filter, Plus, Search } from "lucide-react";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable } from "@/components/dataTable";
import {
	useCheckClockEmployee,
	Employee,
} from "../_hooks/useCheckClockEmployee";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import Link from "next/link";
import * as React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";

export default function CheckClockEmployeeTab() {
	const { employees, handleEdit } = useCheckClockEmployee();

	const [nameFilter, setNameFilter] = React.useState("");

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const baseColumns = React.useMemo<ColumnDef<Employee>[]>(
		() => [
			{ header: "No.", id: "no-placeholder" },
			{
				header: "Nama",
				accessorKey: "nama",
				enableColumnFilter: true,
				filterFn: "includesString",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						<span>{row.original.nama}</span>
					</div>
				),
				meta: { className: "text-start" },
			},
			{
				header: "Posisi",
				accessorKey: "posisi",
			},
			{
				header: "Tipe Pekerjaan",
				accessorKey: "tipePekerjaan",
				cell: ({ row }) => (
					<WorkTypeBadge
						workType={row.original.tipePekerjaan as WorkType}
					/>
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
				cell: ({ row }) => (
					<div className="flex justify-center gap-2">
						<Button
							size="sm"
							variant="outline"
							className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								handleEdit(row.original.id);
							}}
						>
							<Edit className="h-4 w-4 mr-1" />
							Edit
						</Button>
					</div>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleEdit]
	);

	const finalColumns = React.useMemo<ColumnDef<Employee>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row, table }) => {
					const { pageIndex, pageSize } = table.getState().pagination;
					return pageIndex * pageSize + row.index + 1;
				},
				meta: { className: "max-w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			...baseColumns.slice(1),
		],
		[baseColumns]
	);

	const table = useReactTable<Employee>({
		data: employees,
		columns: finalColumns,
		state: {
			columnFilters: [{ id: "nama", value: nameFilter }],
			pagination,
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find((f) => f.id === "nama");
			setNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return (
		<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
			<CardContent>
				<header className="flex flex-col gap-6 mb-6">
					<div className="flex flex-row flex-wrap justify-between items-center w-full gap-4">
						<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
							Check-Clock Employee
						</h2>
						<Link href="/check-clock/add">
							<Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white dark:text-slate-100 hover:cursor-pointer px-4 py-2 rounded-md">
								<Plus className="h-4 w-4" />
								Add Data
							</Button>
						</Link>
					</div>
					<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
							<Input
								value={nameFilter ?? ""}
								onChange={(event) => {
									const newNameFilter = event.target.value;
									setNameFilter(newNameFilter);
									table
										.getColumn("nama")
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

				<DataTable table={table} />

				<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4 p-6">
					<PageSizeComponent table={table} />
					<PaginationComponent table={table} />
				</footer>
			</CardContent>
		</Card>
	);
}
