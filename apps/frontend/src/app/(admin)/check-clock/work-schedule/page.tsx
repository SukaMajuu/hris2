"use client";

import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable, Column } from "@/components/dataTable";

import {
	useWorkSchedule,
	WorkSchedule as WorkScheduletype,
} from "../_hooks/useWorkSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function WorkSchedule() {
	const {
		page,
		setPage,
		pageSize,
		setPageSize,
		workSchedules,
		totalRecords,
		totalPages,
	} = useWorkSchedule();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<WorkScheduletype>>({});
	const [isEditing, setIsEditing] = useState(false);

	const handleChange = (key: keyof WorkScheduletype, value: string) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleOpenAdd = () => {
		setFormData({});
		setIsEditing(false);
		setDialogOpen(true);
	};

	const handleOpenEdit = (data: WorkScheduletype) => {
		setFormData(data);
		setIsEditing(true);
		setDialogOpen(true);
	};

	const handleSave = () => {
		// logika untuk simpan data
		console.log(isEditing ? "Update" : "Create", formData);
		setDialogOpen(false);
	};

	const columns: Column<WorkScheduletype>[] = [
		{
			header: "No.",
			accessorKey: (item) =>
				(page - 1) * pageSize + workSchedules.indexOf(item) + 1,
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
		},
		{
			header: "Tipe Pekerjaan",
			accessorKey: "workType",
			cell: (item) => (
				<WorkTypeBadge workType={item.workType as WorkType} />
			),
		},
		{
			header: "Check-in Start",
			accessorKey: "checkInStart",
		},
		{
			header: "Check-in End",
			accessorKey: "checkInEnd",
		},
		{
			header: "Break Start",
			accessorKey: "breakStart",
		},
		{
			header: "Break End",
			accessorKey: "breakEnd",
		},
		{
			header: "Check-out Start",
			accessorKey: "checkOutStart",
		},
		{
			header: "Check-out End",
			accessorKey: "checkOutEnd",
		},
		{
			header: "Action",
			accessorKey: (item) => (
				<div className="flex gap-2">
					<Button
						size="sm"
						variant="outline"
						className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
						onClick={(e) => {
							e.stopPropagation();
							handleOpenEdit(item);
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
		<>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">
							{isEditing ? "Edit" : "Add"} Work Schedule
						</DialogTitle>
					</DialogHeader>

					<div className="py-4">
						<div className="flex flex-col-reverse md:flex-row gap-4">
							<div className="space-y-4 md:border-r border-gray-200 pr-4">
								<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
									Time Settings
								</h3>
								<div className="flex flex-col gap-6">
									<div className="flex flex-row gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="checkInStart"
												className="text-sm font-medium"
											>
												Check-in Start
											</Label>
											<Input
												id="checkInStart"
												type="time"
												value={
													formData.checkInStart ?? ""
												}
												onChange={(e) =>
													handleChange(
														"checkInStart",
														e.target.value
													)
												}
												className="w-full"
											/>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="checkInEnd"
												className="text-sm font-medium"
											>
												Check-in End
											</Label>
											<Input
												id="checkInEnd"
												type="time"
												value={
													formData.checkInEnd ?? ""
												}
												onChange={(e) =>
													handleChange(
														"checkInEnd",
														e.target.value
													)
												}
												className="w-full"
											/>
										</div>
									</div>

									<div className="flex flex-row gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="breakStart"
												className="text-sm font-medium"
											>
												Break Start
											</Label>
											<Input
												id="breakStart"
												type="time"
												value={
													formData.breakStart ?? ""
												}
												onChange={(e) =>
													handleChange(
														"breakStart",
														e.target.value
													)
												}
												className="w-full"
											/>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="breakEnd"
												className="text-sm font-medium"
											>
												Break End
											</Label>
											<Input
												id="breakEnd"
												type="time"
												value={formData.breakEnd ?? ""}
												onChange={(e) =>
													handleChange(
														"breakEnd",
														e.target.value
													)
												}
												className="w-full"
											/>
										</div>
									</div>
									<div className="flex flex-row gap-6">
										<div className="space-y-2">
											<Label
												htmlFor="checkOutStart"
												className="text-sm font-medium"
											>
												Check-out Start
											</Label>
											<Input
												id="checkOutStart"
												type="time"
												value={
													formData.checkOutStart ?? ""
												}
												onChange={(e) =>
													handleChange(
														"checkOutStart",
														e.target.value
													)
												}
												className="w-full"
											/>
										</div>

										<div className="space-y-2">
											<Label
												htmlFor="checkOutEnd"
												className="text-sm font-medium"
											>
												Check-out End
											</Label>
											<Input
												id="checkOutEnd"
												type="time"
												value={
													formData.checkOutEnd ?? ""
												}
												onChange={(e) =>
													handleChange(
														"checkOutEnd",
														e.target.value
													)
												}
												className="w-full"
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-4 flex-1">
								<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
									Basic Information
								</h3>
								<div className="grid gap-4">
									<div className="space-y-2">
										<Label
											htmlFor="nama"
											className="text-sm font-medium"
										>
											Schedule Name
										</Label>
										<Input
											id="nama"
											value={formData.nama ?? ""}
											onChange={(e) =>
												handleChange(
													"nama",
													e.target.value
												)
											}
											placeholder="Enter schedule name"
											className="w-full"
										/>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="workType"
											className="text-sm font-medium"
										>
											Work Type
										</Label>
										<select
											id="workType"
											value={formData.workType ?? ""}
											onChange={(e) =>
												handleChange(
													"workType",
													e.target.value
												)
											}
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										>
											<option value="">
												Select work type
											</option>
											<option value="WFO">
												Work From Office
											</option>
											<option value="WFH">
												Work From Home
											</option>
											<option value="HYBRID">
												Hybrid
											</option>
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="pt-4">
						<Button
							onClick={handleSave}
							className="bg-[#6B9AC4] hover:bg-[#5A89B3]"
						>
							{isEditing ? "Update Schedule" : "Save Schedule"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Card className="border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col gap-4 mb-6">
						<div className="flex flex-row flex-wrap justify-between items-center w-full">
							<h2 className="text-xl font-semibold">
								Work Schedule
							</h2>
							<div className="flex gap-2 flex-wrap">
								<Button
									onClick={handleOpenAdd}
									className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]"
								>
									<Plus className="h-4 w-4" />
									Add Data
								</Button>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Employee"
								/>
							</div>
						</div>
					</header>
					<DataTable
						columns={columns}
						data={workSchedules}
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
		</>
	);
}
