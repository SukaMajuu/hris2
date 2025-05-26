"use client";

import {
	Search,
	Filter,
	FileText,
	Upload,
	Plus,
	BookUser,
	CalendarIcon,
	UsersIcon,
	UserPlusIcon,
	BriefcaseIcon,
	UserMinusIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import Link from "next/link";
import { useEmployeeManagement } from "./_hooks/useEmployeeManagement";
import type { Employee } from "./_types/employee";
import { StatCard } from "./_components/StatCard";
import React, { useState, useMemo, useCallback } from "react";
import {
	AlertDialog,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";

export default function EmployeeManagementPage() {
	const { employees, setEmployees } = useEmployeeManagement();

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const [nameSearch, setNameSearch] = useState("");

	const handleResignEmployee = useCallback(
		(id: number) => {
			setEmployees((prev: Employee[]) =>
				prev.filter((emp) => emp.id !== id)
			);
		},
		[setEmployees]
	);

	const columns = useMemo<ColumnDef<Employee>[]>(
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
				header: "Name",
				accessorKey: "name",
			},
			{
				header: "Gender",
				accessorKey: "gender",
				cell: ({ row }) =>
					row.original.gender === "Female" ? (
						<Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
							{row.original.gender}
						</Badge>
					) : (
						<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
							{row.original.gender}
						</Badge>
					),
			},
			{
				header: "Phone",
				accessorKey: "phone",
			},
			{
				header: "Branch",
				accessorKey: "branch",
			},
			{
				header: "Position",
				accessorKey: "position",
			},
			{
				header: "Grade",
				accessorKey: "grade",
			},
			{
				header: "Status",
				accessorKey: "employmentStatus",
				cell: ({ row }) =>
					row.original.employmentStatus === "Active" ? (
						<Badge className="bg-green-100 text-green-800">
							{row.original.employmentStatus}
						</Badge>
					) : (
						<Badge className="bg-red-100 text-red-800">
							{row.original.employmentStatus}
						</Badge>
					),
			},
			{
				header: "Action",
				id: "action",
				cell: ({ row }) => (
					<div className="flex justify-center gap-2">
						<Link href={`/employee-management/${row.original.id}`}>
							<Button
								size="sm"
								variant="default"
								className="bg-[#6B9AC4] hover:cursor-pointer hover:bg-[#5A89B3]"
							>
								<BookUser className="mr-1 h-4 w-4" />
								Detail
							</Button>
						</Link>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									size="sm"
									variant="destructive"
									className="hover:cursor-pointer hover:bg-red-800"
								>
									<UserMinusIcon className="mr-1 h-4 w-4" />
									Resign
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										Are you sure this employee is resigning?
									</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will
										change the employee&apos;s status to
										Inactive.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel className="hover:bg-secondary bg-white">
										Cancel
									</AlertDialogCancel>
									<AlertDialogAction
										className="bg-destructive hover:bg-red-600"
										onClick={() =>
											handleResignEmployee(
												row.original.id
											)
										}
									>
										Confirm Resignation
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleResignEmployee]
	);

	const table = useReactTable<Employee>({
		data: employees,
		columns,
		state: {
			pagination,
			columnFilters,
		},
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	React.useEffect(() => {
		const newFilters: ColumnFiltersState = [];
		if (nameSearch) {
			newFilters.push({ id: "name", value: nameSearch });
		}
		const genderFilterValue = columnFilters.find((f) => f.id === "gender")
			?.value as string | undefined;
		if (genderFilterValue && genderFilterValue !== "all") {
			newFilters.push({ id: "gender", value: genderFilterValue });
		}
		if (
			JSON.stringify(newFilters) !==
			JSON.stringify(
				columnFilters.filter(
					(f) =>
						(f.id === "name" && nameSearch) ||
						(f.id === "gender" &&
							genderFilterValue &&
							genderFilterValue !== "all")
				)
			)
		) {
			setColumnFilters(newFilters);
		}
	}, [nameSearch, columnFilters]);

	return (
		<main>
			<div className="mb-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<StatCard
						label="Period"
						value="April 2025"
						icon={<CalendarIcon className="h-5 w-5" />}
						description="Current reporting period"
					/>
					<StatCard
						label="Total Employee"
						value={table.getPreFilteredRowModel().rows.length}
						icon={<UsersIcon className="h-5 w-5" />}
						trend={{ value: 5, label: "from last month" }}
					/>
					<StatCard
						label="Total New Hire"
						value="20"
						icon={<UserPlusIcon className="h-5 w-5" />}
						trend={{ value: 15, label: "from last month" }}
					/>
					<StatCard
						label="Full Time Employee"
						value="188"
						icon={<BriefcaseIcon className="h-5 w-5" />}
						trend={{ value: 3, label: "from last month" }}
					/>
				</div>
			</div>

			<Card className="mb-6 border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="mb-6 flex flex-col items-start justify-between gap-4">
						<div className="flex w-full flex-row flex-wrap items-center justify-between gap-4">
							<h2 className="text-xl font-semibold">
								All Employees Information
							</h2>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									className="gap-2 hover:bg-[#5A89B3] hover:text-white"
								>
									<FileText className="h-4 w-4" />
									Export
								</Button>
								<Button
									variant="outline"
									className="gap-2 hover:bg-[#5A89B3] hover:text-white"
								>
									<Upload className="h-4 w-4" />
									Import
								</Button>
								<Button className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]">
									<Plus className="h-4 w-4" />
									<Link href="/employee-management/add">
										Add Data
									</Link>
								</Button>
							</div>
						</div>
						<div className="flex w-full flex-wrap gap-2 md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
								<Input
									className="w-full border-gray-200 bg-white pl-10"
									placeholder="Search Employee by Name"
									value={nameSearch}
									onChange={(e) =>
										setNameSearch(e.target.value)
									}
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 hover:bg-[#5A89B3] hover:text-white"
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					<DataTable table={table} />

					<div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
						<PageSizeComponent table={table} />
						<PaginationComponent table={table} />
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
