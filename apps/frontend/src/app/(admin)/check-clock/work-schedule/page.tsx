"use client";

import WorkTypeBadge from "@/components/workTypeBadge";
import { WorkType } from "@/const/work";
import { DataTable } from "@/components/dataTable";

import {
	useWorkSchedule,
	WorkSchedule as WorkScheduleType,
} from "./_hooks/useWorkSchedule";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Search, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useState, useCallback } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";

export default function WorkSchedulePage() {
	const { workSchedules } = useWorkSchedule();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [formData, setFormData] = useState<Partial<WorkScheduleType>>({});
	const [isEditing, setIsEditing] = useState(false);

	const [scheduleNameFilter, setScheduleNameFilter] = React.useState("");
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const handleChange = (key: keyof WorkScheduleType, value: string) => {
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const handleOpenAdd = useCallback(() => {
		setFormData({});
		setIsEditing(false);
		setDialogOpen(true);
	}, []);

	const handleOpenEdit = useCallback((data: WorkScheduleType) => {
		setFormData(data);
		setIsEditing(true);
		setDialogOpen(true);
	}, []);

	const handleOpenDelete = useCallback((data: WorkScheduleType) => {
		setFormData(data);
		setIsEditing(true);
		setDialogOpen(true);
	}, []);

	const handleSave = () => {
		console.log(isEditing ? "Update" : "Create", formData);
		setDialogOpen(false);
	};

	const columns = React.useMemo<ColumnDef<WorkScheduleType>[]>(
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
			{
				header: "Nama",
				accessorKey: "nama",
			},
			{
				header: "Tipe Pekerjaan",
				accessorKey: "workType",
				cell: ({ row }) => (
					<WorkTypeBadge
						workType={row.original.workType as WorkType}
					/>
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
				id: "action",
				cell: ({ row }) => (
					<div className="flex justify-center gap-2">
						<Button
							size="sm"
							variant="outline"
							className="h-9 px-3 bg-[#FFA500] text-white hover:bg-[#E69500] border-none hover:cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenEdit(row.original);
							}}
						>
							<Edit className="h-4 w-4 mr-1" />
							Edit
						</Button>
						<Button
							size="sm"
							variant="outline"
							className="h-9 px-3 bg-destructive text-white hover:bg-destructive/80 border-none hover:cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								handleOpenDelete(row.original);
							}}
						>
							<Trash className="h-4 w-4 mr-1" />
							Delete
						</Button>
					</div>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleOpenEdit, handleOpenDelete]
	);

	const table = useReactTable<WorkScheduleType>({
		data: workSchedules,
		columns,
		state: {
			columnFilters: [{ id: "nama", value: scheduleNameFilter }],
			pagination,
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find((f) => f.id === "nama");
			setScheduleNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

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
									value={scheduleNameFilter ?? ""}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
										setScheduleNameFilter(newNameFilter);
										table
											.getColumn("nama")
											?.setFilterValue(newNameFilter);
									}}
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Schedule Name"
								/>
							</div>
						</div>
					</header>
					<DataTable table={table} />
					<div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
						<PageSizeComponent table={table} />
						<PaginationComponent table={table} />
					</div>
				</CardContent>
			</Card>
		</>
	);
}
