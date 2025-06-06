import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Filter, Plus, Search } from "lucide-react";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable } from "@/components/dataTable";
import { useCheckClockEmployee } from "../_hooks/useCheckClockEmployee";
import { CheckClockEmployeeFilter } from "../_components/CheckClockEmployeeFilter";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { usePagination } from "@/hooks/usePagination";
import Link from "next/link";
import * as React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table";
import { CheckclockSettingsResponse } from "@/types/checkclock-settings.types";

export default function CheckClockEmployeeTab() {
	const [nameFilter, setNameFilter] = React.useState("");
	const [showAdvancedFilter, setShowAdvancedFilter] = React.useState(false);
	const { pagination, setPage, setPageSize } = usePagination(1, 10);

	const {
		employees,
		pagination: serverPagination,
		filters,
		applyFilters,
		resetFilters,
		isLoading,
		error,
		handleEdit,
	} = useCheckClockEmployee(pagination.page, pagination.pageSize);

	const baseColumns = React.useMemo<ColumnDef<CheckclockSettingsResponse>[]>(
		() => [
			{ header: "No.", id: "no-placeholder" },			{
				header: "Name",
				id: "employee_name",
				accessorKey: "employee.first_name",
				enableColumnFilter: true,
				filterFn: "includesString",
				cell: ({ row }) => {
					const employee = row.original.employee;
					if (!employee) return "Unknown Employee";
					return `${employee.first_name || ""} ${
						employee.last_name || ""
					}`.trim();
				},
			},			{
				header: "Position",
				accessorKey: "employee.position_name",
				cell: ({ row }) => {
					return (
						row.original.employee?.position_name ||
						"Unknown Position"
					);
				},
			},
			{
				header: "Work Schedule",
				accessorKey: "work_schedule.name",
				cell: ({ row }) => {
					return row.original.work_schedule?.name || "Not Set";
				},
			},
			{
				header: "Work Type",
				accessorKey: "work_schedule.work_type",
				cell: ({ row }) => {
					const workType =
						row.original.work_schedule?.work_type || "WFO";
					return <WorkTypeBadge workType={workType as WorkType} />;
				},
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

	const finalColumns = React.useMemo<ColumnDef<CheckclockSettingsResponse>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row }) => {
					const currentPage = serverPagination.currentPage;
					const pageSize = serverPagination.pageSize;
					return (currentPage - 1) * pageSize + row.index + 1;
				},
				meta: { className: "max-w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			...baseColumns.slice(1),
		],
		[baseColumns, serverPagination.currentPage, serverPagination.pageSize]
	);

	const table = useReactTable<CheckclockSettingsResponse>({
		data: employees,
		columns: finalColumns,
		state: {
			columnFilters: [{ id: "employee_name", value: nameFilter }],
			pagination: {
				pageIndex: serverPagination.currentPage - 1,
				pageSize: serverPagination.pageSize,
			},
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find(
				(f) => f.id === "employee_name"
			);
			setNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: (updater) => {
			const currentPaginationState = {
				pageIndex: serverPagination.currentPage - 1,
				pageSize: serverPagination.pageSize,
			};
			const newPagination =
				typeof updater === "function"
					? updater(currentPaginationState)
					: updater;
			setPage(newPagination.pageIndex + 1);
			setPageSize(newPagination.pageSize);
		},
		pageCount: serverPagination.totalPages || 0,
		manualPagination: true,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return (
		<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
			<CardContent>				<header className="flex flex-col gap-6 mb-6">
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
					</div>					<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
							<Input
								value={nameFilter ?? ""}
								onChange={(event) => {
									const newNameFilter = event.target.value;
									setNameFilter(newNameFilter);
									// Apply quick name filter
									applyFilters({ ...filters, name: newNameFilter || undefined });
								}}
								className="pl-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
								placeholder="Quick search by employee name..."
							/>
						</div>
						<Button
							onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
							variant="outline"
							className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
						>
							<Filter className="h-4 w-4" />
							{showAdvancedFilter ? "Hide Filters" : "Advanced Filters"}
						</Button>
					</div>
				</header>

				{/* Advanced Filter Component */}
				<CheckClockEmployeeFilter
					onApplyFilters={(newFilters) => {
						applyFilters(newFilters);
						// Update name filter state if changed through advanced filter
						setNameFilter(newFilters.name || "");
					}}
					onResetFilters={() => {
						resetFilters();
						setNameFilter("");
					}}
					currentFilters={filters}
					isVisible={showAdvancedFilter}
				/>

				{isLoading ? (
					<div className="flex justify-center items-center py-8">
						<div className="text-slate-500 dark:text-slate-400">
							Loading checkclock settings...
						</div>
					</div>
				) : error ? (
					<div className="flex justify-center items-center py-8">
						<div className="text-red-500 dark:text-red-400">
							Error loading checkclock settings: {error.message}
						</div>
					</div>
				) : (
					<DataTable table={table} />
				)}

				<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
					<PageSizeComponent table={table} />
					<PaginationComponent table={table} />
				</footer>
			</CardContent>
		</Card>
	);
}
