import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Edit,
	Filter,
	Plus,
	Search,
	UserPlus,
	AlertCircle,
	Users,
} from "lucide-react";
import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable } from "@/components/dataTable";
import { useCheckClockEmployee } from "../_hooks/useCheckClockEmployee";
import { CheckClockEmployeeFilter } from "../_components/CheckClockEmployeeFilter";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";

import Link from "next/link";
import * as React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
} from "@tanstack/react-table";
import { WorkSchedule } from "@/types/work-schedule.types";

// Interface for the employee work schedule data displayed in the table
interface EmployeeWorkScheduleData {
	id: number;
	employee: {
		id: number;
		first_name?: string;
		last_name?: string;
		position_name?: string;
	};
	work_schedule?: WorkSchedule;
	employee_id: number;
	work_schedule_id?: number;
}

export default function CheckClockEmployeeTab() {
	const [nameFilter, setNameFilter] = React.useState("");
	const [showAdvancedFilter, setShowAdvancedFilter] = React.useState(false);

	const {
		employees,
		pagination: serverPagination,
		page,
		setPage,
		pageSize,
		setPageSize,
		filters,
		applyFilters,
		resetFilters,
		isLoading,
		error,
		handleEdit,
	} = useCheckClockEmployee(1, 10);

	const columns = React.useMemo<ColumnDef<EmployeeWorkScheduleData>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row }) => {
					const currentPage = serverPagination.currentPage;
					const pageSize = serverPagination.pageSize;
					return (currentPage - 1) * pageSize + row.index + 1;
				},
				meta: { className: "w-[80px] max-w-[80px]" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
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
			},
			{
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
					const workSchedule = row.original.work_schedule;
					if (!workSchedule) {
						return (
							<div className="flex items-center justify-center gap-2 text-red-600">
								<AlertCircle className="h-4 w-4" />
								<span className="font-medium">
									Not Assigned
								</span>
							</div>
						);
					}
					return (
						<span className="font-medium text-green-700">
							{workSchedule.name}
						</span>
					);
				},
			},
			{
				header: "Work Type",
				accessorKey: "work_schedule.work_type",
				cell: ({ row }) => {
					const workType = row.original.work_schedule?.work_type;
					if (!workType) {
						return (
							<span className="text-gray-500 italic text-sm">
								No Schedule
							</span>
						);
					}
					return <WorkTypeBadge workType={workType as WorkType} />;
				},
			},
			{
				header: "Action",
				accessorKey: "id",
				cell: ({ row }) => {
					const hasWorkSchedule = !!row.original.work_schedule_id;
					return (
						<div className="flex justify-center gap-2">
							{hasWorkSchedule ? (
								<Button
									size="sm"
									variant="outline"
									className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										handleEdit(row.original.employee_id);
									}}
								>
									<Edit className="h-4 w-4 mr-1" />
									Edit Schedule
								</Button>
							) : (
								<Button
									size="sm"
									variant="outline"
									className="h-9 px-3 bg-[#6B9AC4] text-white hover:bg-[#5A89B3] border-none hover:cursor-pointer"
									onClick={(e) => {
										e.stopPropagation();
										handleEdit(row.original.employee_id);
									}}
								>
									<UserPlus className="h-4 w-4 mr-1" />
									Assign Schedule
								</Button>
							)}
						</div>
					);
				},
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleEdit, serverPagination.currentPage, serverPagination.pageSize]
	);

	const table = useReactTable<EmployeeWorkScheduleData>({
		data: employees,
		columns,
		state: {
			columnFilters: [{ id: "employee_name", value: nameFilter }],
			pagination: {
				pageIndex: page - 1, // Use hook's page state
				pageSize: pageSize, // Use hook's pageSize state
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
				pageIndex: page - 1,
				pageSize: pageSize,
			};
			const newPagination =
				typeof updater === "function"
					? updater(currentPaginationState)
					: updater;

			console.log("Table pagination change:", {
				current: currentPaginationState,
				new: newPagination,
				pageChanged:
					newPagination.pageIndex !==
					currentPaginationState.pageIndex,
				pageSizeChanged:
					newPagination.pageSize !== currentPaginationState.pageSize,
			});

			// Only update if values actually changed
			if (newPagination.pageIndex !== currentPaginationState.pageIndex) {
				setPage(newPagination.pageIndex + 1);
			}
			if (newPagination.pageSize !== currentPaginationState.pageSize) {
				setPageSize(newPagination.pageSize);
			}
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
			<CardContent>
				<header className="flex flex-col gap-6 mb-6">
					<div className="flex flex-row flex-wrap justify-between items-center w-full gap-4">
						<div>
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
								Employee Work Schedule Management
							</h2>
							<p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
								Assign and manage work schedules for employees
							</p>
						</div>
						<div className="flex gap-2">
							<Link href="/check-clock/work-schedule">
								<Button
									variant="outline"
									className="gap-2 hover:cursor-pointer px-4 py-2 rounded-md"
								>
									<Edit className="h-4 w-4" />
									Manage Schedules
								</Button>
							</Link>
							<Link href="/employee-management">
								<Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white dark:text-slate-100 hover:cursor-pointer px-4 py-2 rounded-md">
									<Users className="h-4 w-4" />
									Manage Employees
								</Button>
							</Link>
						</div>
					</div>
					<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
						<div className="relative flex-1 min-w-[200px]">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
							<Input
								value={nameFilter ?? ""}
								onChange={(event) => {
									const newNameFilter = event.target.value;
									setNameFilter(newNameFilter);
									applyFilters({
										...filters,
										name: newNameFilter || undefined,
									});
								}}
								className="pl-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
								placeholder="Quick search by employee name..."
							/>
						</div>
						<Button
							onClick={() =>
								setShowAdvancedFilter(!showAdvancedFilter)
							}
							variant="outline"
							className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
						>
							<Filter className="h-4 w-4" />
							{showAdvancedFilter
								? "Hide Filters"
								: "Advanced Filters"}
						</Button>
					</div>
				</header>

				{/* Advanced Filter Component */}
				<CheckClockEmployeeFilter
					onApplyFilters={(newFilters) => {
						applyFilters(newFilters);
					}}
					onResetFilters={() => {
						resetFilters();
						setNameFilter("");
					}}
					currentFilters={filters}
					isVisible={showAdvancedFilter}
				/>				{isLoading ? (
					<div className="flex justify-center items-center py-8">
						<div className="text-center">
							<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
							<p>Loading employee work schedules...</p>
						</div>
					</div>
				) : error ? (
					<div className="flex justify-center items-center py-8">
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
							<p className="font-medium text-red-600">Error loading data</p>
							<p className="mt-1 text-sm text-gray-600">{error.message}</p>
							<button
								onClick={() => window.location.reload()}
								className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
							>
								Retry
							</button>
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
