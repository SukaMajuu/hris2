"use client";

import {
	Search,
	Filter,
	FileText,
	Upload,
	Plus,
	BookUser,
	Trash2Icon,
	CalendarIcon,
	UsersIcon,
	UserPlusIcon,
	BriefcaseIcon,
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
		<main>
			<div className="mb-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<StatCard
						label="Period"
						value="April 2025"
						icon={<CalendarIcon className="h-5 w-5" />}
						description="Current reporting period"
					/>
					<StatCard
						label="Total Employee"
						value="208"
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
					<header className="flex flex-col justify-between items-start gap-4 mb-6">
						<div className="flex flex-row flex-wrap gap-4 justify-between items-center w-full">
							<h2 className="text-xl font-semibold">
								All Employees Information
							</h2>
							<div className="flex gap-2 flex-wrap">
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
						<div className="flex flex-wrap gap-2 w-full md:w-[400px]">
							<div className="relative flex-[1]">
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

					<div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
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
		</main>
	);
}
