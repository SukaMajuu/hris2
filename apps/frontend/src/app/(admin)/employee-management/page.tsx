"use client";

import {
	Search,
	Filter,
	FileText,
	Upload,
	Plus,
	BookUser,
	Trash2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import Link from "next/link";
import { useEmployeeManagement } from "./_hooks/useEmployeeManagement";
import type { Employee } from "./_types/employee";
import { StatCard } from "./_components/StatCard";

export default function EmployeeManagementPage() {
	const {
		page,
		setPage,
		pageSize,
		setPageSize,
		employees,
		totalRecords,
		totalPages,
	} = useEmployeeManagement();

	const columns: Column<Employee>[] = [
		{
			header: "No.",
			accessorKey: (item) => employees.indexOf(item) + 1,
			className: "w-[80px]",
		},
		{
			header: "Name",
			accessorKey: "name",
		},
		{
			header: "Gender",
			accessorKey: "gender",
			cell: (item) => (
				<Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">
					{item.gender}
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
			header: "Action",
			accessorKey: "id",
			cell: (item) => (
				<div className="flex justify-center gap-2">
					<Link href={`/employee-management/${item.id}`}>
						<Button
							size="sm"
							variant="default"
							className="bg-[#6B9AC4] hover:bg-[#5A89B3] hover:cursor-pointer"
						>
							<BookUser className="h-4 w-4 mr-1" />
							Detail
						</Button>
					</Link>
					<Button
						size="sm"
						variant="destructive"
						className="hover:bg-red-800 hover:cursor-pointer"
					>
						<Trash2Icon className="h-4 w-4 mr-1" />
						Delete
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="p-0">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
				<StatCard label="Period" value="April 2025" />
				<StatCard label="Total Employee" value="208" />
				<StatCard label="Total New Hire" value="20" />
				<StatCard label="Full Time Employee" value="20" />
			</div>

			<Card className="mb-6 border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col justify-between items-start gap-4 mb-6">
						<div className="flex justify-between items-center w-full">
							<h2 className="text-xl font-semibold">
								All Employees Information
							</h2>
							<div className="flex gap-2">
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
						<div className="flex gap-2">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Employee"
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

					<DataTable
						columns={columns}
						data={employees}
						page={page}
						pageSize={pageSize}
					/>

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
				</CardContent>
			</Card>
		</div>
	);
}
