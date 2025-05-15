"use client";

import {
	useCheckClockOverview,
	OverviewData,
} from "../_hooks/useCheckClockOverview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Plus, Crosshair, Eye } from "lucide-react";
import { DataTable } from "@/components/dataTable";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import * as React from "react";
import { MapComponent } from "@/components/MapComponent";
import { Label } from "@/components/ui/label";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
} from "@tanstack/react-table";

interface DialogFormData {
	name: string;
	date: string;
	attendanceType: string;
	checkIn: string;
	checkOut: string;
	latitude: string;
	longitude: string;
	permitEndDate: string;
	evidence: FileList | null;
}

export default function CheckClockOverviewTab() {
	const { overviewData } = useCheckClockOverview();

	const [openSheet, setOpenSheet] = React.useState(false);
	const [selectedData, setSelectedData] = React.useState<OverviewData | null>(
		null
	);
	const [openDialog, setOpenDialog] = React.useState(false);
	const [nameFilter, setNameFilter] = React.useState("");

	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const { register, handleSubmit, reset, setValue, watch } = useForm<
		DialogFormData
	>({
		defaultValues: {
			name: "",
			date: "",
			attendanceType: "check-in",
			checkIn: "",
			checkOut: "",
			latitude: "",
			longitude: "",
			permitEndDate: "",
			evidence: null,
		},
	});

	const formData = watch();
	const attendanceType = formData.attendanceType;

	const handleViewDetails = React.useCallback(
		(id: number) => {
			const data = overviewData.find((item) => item.id === id);
			if (data) {
				setSelectedData(data);
				setOpenSheet(true);
			}
		},
		[overviewData]
	);

	const onSubmit = (data: DialogFormData) => {
		console.log("Form submitted:", data);
		setOpenDialog(false);
		reset();
	};

	const baseColumns = React.useMemo<ColumnDef<OverviewData>[]>(
		() => [
			{ header: "No.", id: "no-placeholder" },
			{
				header: "Name",
				accessorKey: "name",
			},
			{
				header: "Date",
				accessorKey: "date",
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
				header: "Location",
				accessorKey: "location",
			},
			{
				header: "Work Hours",
				accessorKey: "workHours",
			},
			{
				header: "Status",
				accessorKey: "status",
				cell: ({ row }) => {
					let bg = "bg-green-600";
					if (row.original.status === "Late") bg = "bg-red-600";
					else if (row.original.status === "Leave")
						bg = "bg-yellow-800";
					return (
						<span
							className={`px-3 py-1 rounded-md text-sm font-medium ${bg} text-white`}
						>
							{row.original.status}
						</span>
					);
				},
			},
			{
				header: "Details",
				id: "details",
				cell: ({ row }) => (
					<Button
						variant="default"
						size="sm"
						className="bg-blue-500 hover:bg-blue-600 text-white px-6"
						onClick={() => handleViewDetails(row.original.id)}
					>
						<Eye className="h-4 w-4 mr-1" />
						View
					</Button>
				),
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[handleViewDetails]
	);

	const finalColumns = React.useMemo<ColumnDef<OverviewData>[]>(
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

	const table = useReactTable<OverviewData>({
		data: overviewData,
		columns: finalColumns,
		state: {
			columnFilters: [{ id: "name", value: nameFilter }],
			pagination,
		},
		onColumnFiltersChange: (updater) => {
			const newFilters =
				typeof updater === "function"
					? updater(table.getState().columnFilters)
					: updater;
			const nameFilterUpdate = newFilters.find((f) => f.id === "name");
			setNameFilter((nameFilterUpdate?.value as string) || "");
		},
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
	});

	return (
		<>
			<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
				<CardContent>
					<header className="flex flex-col gap-6 mb-6">
						<div className="flex items-center justify-between w-full gap-4">
							<h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
								Check-Clock Overview
							</h2>
							<Button
								className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white dark:text-slate-100 px-4 py-2 rounded-md"
								onClick={() => setOpenDialog(true)}
							>
								<Plus className="h-4 w-4" />
								Add Data
							</Button>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-full lg:w-[500px]">
							<div className="relative flex-1 min-w-[200px]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
								<Input
									value={nameFilter ?? ""}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
										setNameFilter(newNameFilter);
										table
											.getColumn("name")
											?.setFilterValue(newNameFilter);
									}}
									className="pl-10 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
									placeholder="Search by employee name..."
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 px-4 py-2 rounded-md"
								onClick={() => {
									/* readonly, do nothing */
								}}
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
			{/* Sheet for Detail View */}
			<Sheet open={openSheet} onOpenChange={setOpenSheet}>
				<SheetContent className="w-[100%] sm:max-w-2xl overflow-y-auto bg-slate-50">
					<SheetHeader className="pb-4 border-b">
						<SheetTitle className="text-xl font-semibold text-slate-800">
							Attendance Details
						</SheetTitle>
					</SheetHeader>
					{selectedData && (
						<div className="space-y-6 text-sm mx-2 sm:mx-4 py-6">
							<div className="bg-white shadow-md rounded-lg p-6 mb-6">
								<h3 className="text-lg font-bold text-slate-700">
									{selectedData.name}
								</h3>
								<p className="text-sm text-slate-500">CEO</p>
							</div>

							<div className="bg-white shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
									Attendance Information
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Date
										</p>
										<p className="text-slate-700">
											{selectedData.date}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check In
										</p>
										<p className="text-slate-700">
											{selectedData.checkIn}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check Out
										</p>
										<p className="text-slate-700">
											{selectedData.checkOut}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Work Hours
										</p>
										<p className="text-slate-700">
											{selectedData.workHours}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Status
										</p>
										<p className="text-slate-700">
											{selectedData.status}
										</p>
									</div>
								</div>
							</div>

							<div className="bg-white shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
									Location Information
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Location
										</p>
										<p className="text-slate-700">
											{selectedData.location}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Detail Address
										</p>
										<p className="text-slate-700">
											{selectedData.detailAddress ||
												"Jl. Veteran No.1, Kota Malang"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Latitude
										</p>
										<p className="text-slate-700">
											{selectedData.latitude ||
												"-7.9783908"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Longitude
										</p>
										<p className="text-slate-700">
											{selectedData.longitude ||
												"112.621381"}
										</p>
									</div>
								</div>
							</div>
							<div className="bg-white shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 mb-4 pb-2 border-b">
									Support Evidence
								</h4>
								{selectedData.status === "Leave" ? (
									<div className="space-y-3">
										<div className="text-sm">
											<span className="font-medium text-slate-500">
												Leave Type:{" "}
											</span>
											<span className="text-slate-700">
												{selectedData.leaveType
													? selectedData.leaveType.replace(
															/\b\w/g,
															(c) =>
																c.toUpperCase()
													  )
													: "-"}
											</span>
										</div>
										<div className="text-sm">
											<span className="font-medium text-slate-500">
												Evidence:{" "}
											</span>
											<span className="text-slate-700">
												-
											</span>
										</div>
										<p className="text-xs text-slate-400 mt-2">
											Support evidence is only required
											for leave/permit attendance types.
										</p>
									</div>
								) : (
									<span className="text-xs text-slate-500">
										No support evidence required for this
										attendance type.
									</span>
								)}
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>
			{/* Dialog for Add Data */}
			<Dialog open={openDialog} onOpenChange={setOpenDialog}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Add Attendance Data</DialogTitle>
						<DialogDescription>
							Fill in the attendance details. Location will be
							taken from your current position.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
							{/* Left Column - Select Employee, Attendance Type & Permit Duration */}
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">
										Select Employee
									</Label>
									<select
										id="name"
										className="input input-bordered w-full"
										{...register("name", {
											required: true,
										})}
									>
										<option value="">
											Select Employee
										</option>
										{/* employeeList.map((emp) => (
											<option key={emp} value={emp}>
												{emp}
											</option>
										))} */}
									</select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="attendanceType">
										Attendance Type
									</Label>
									<select
										id="attendanceType"
										className="input input-bordered w-full"
										{...register("attendanceType", {
											required: true,
										})}
									>
										<option value="check-in">
											Check-In
										</option>
										<option value="check-out">
											Check-Out
										</option>
										<option value="sick leave">
											Sick Leave
										</option>
										<option value="compassionate leave">
											Compassionate Leave
										</option>
										<option value="maternity leave">
											Maternity Leave
										</option>
										<option value="annual leave">
											Annual Leave
										</option>
										<option value="marriage leave">
											Marriage Leave
										</option>
									</select>
								</div>
								{/* Permit duration for leave types */}
								{[
									"sick leave",
									"compassionate leave",
									"maternity leave",
									"annual leave",
									"marriage leave",
								].includes(attendanceType) && (
									<div className="space-y-2">
										<Label htmlFor="permitEndDate">
											Permit Duration (End Date)
										</Label>
										<Input
											id="permitEndDate"
											type="date"
											{...register("permitEndDate", {
												required: true,
											})}
										/>
									</div>
								)}
								{/* Work Schedule Section */}
								{![
									"sick leave",
									"compassionate leave",
									"maternity leave",
									"annual leave",
									"marriage leave",
								].includes(attendanceType) && (
									<div className="border rounded-md p-4 mt-4">
										<Label className="block text-base font-semibold mb-4">
											Work Schedule
										</Label>
										<div className="grid grid-cols-2 gap-4 mb-2">
											<div className="space-y-2">
												<Label htmlFor="workType">
													Work Type
												</Label>
												<Input
													id="workType"
													placeholder="WFO"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="checkInSchedule">
													Check-In
												</Label>
												<Input
													id="checkInSchedule"
													placeholder="07:00 - 08:00"
												/>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="breakSchedule">
													Break
												</Label>
												<Input
													id="breakSchedule"
													placeholder="12:00 - 13:00"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="checkOutSchedule">
													Check-Out
												</Label>
												<Input
													id="checkOutSchedule"
													placeholder="17:00 - 18:00"
												/>
											</div>
										</div>
									</div>
								)}
								{/* Location Section */}
								{![
									"sick leave",
									"compassionate leave",
									"maternity leave",
									"annual leave",
									"marriage leave",
								].includes(attendanceType) && (
									<div className="space-y-2 mt-4">
										<div className="flex gap-2 mt-2">
											<Button
												variant="outline"
												type="button"
												onClick={() => {
													navigator.geolocation.getCurrentPosition(
														(position) => {
															setValue(
																"latitude",
																position.coords.latitude.toString()
															);
															setValue(
																"longitude",
																position.coords.longitude.toString()
															);
														},
														(error) => {
															console.error(
																"Error getting current location:",
																error
															);
														}
													);
												}}
												className="flex-1"
											>
												<Crosshair className="h-4 w-4 mr-2" />
												Use Current Location
											</Button>
										</div>
										<div className="grid grid-cols-2 gap-4 mt-2">
											<div className="space-y-2">
												<Label htmlFor="latitude">
													Latitude
												</Label>
												<Input
													id="latitude"
													value={
														formData.latitude || ""
													}
													disabled
													className="bg-gray-100 dark:bg-gray-800"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="longitude">
													Longitude
												</Label>
												<Input
													id="longitude"
													value={
														formData.longitude || ""
													}
													disabled
													className="bg-gray-100 dark:bg-gray-800"
												/>
											</div>
										</div>
									</div>
								)}
							</div>
							{/* Right Column - Map & Upload Evidence */}
							<div className="space-y-4">
								{![
									"sick leave",
									"compassionate leave",
									"maternity leave",
									"annual leave",
									"marriage leave",
								].includes(attendanceType) && (
									<div className="space-y-2">
										<Label>Your Current Location</Label>
										<div className="min-h-[100px]">
											<MapComponent
												latitude={parseFloat(
													formData.latitude ||
														"-6.2088"
												)}
												longitude={parseFloat(
													formData.longitude ||
														"106.8456"
												)}
												radius={100}
												onPositionChange={() => {
													/* readonly, do nothing */
												}}
											/>
										</div>
									</div>
								)}
								{/* Upload Evidence */}
								{[
									"sick leave",
									"compassionate leave",
									"maternity leave",
									"annual leave",
									"marriage leave",
								].includes(attendanceType) && (
									<div className="space-y-2">
										<Label htmlFor="evidence">
											Upload Support Evidence
										</Label>
										<Input
											id="evidence"
											type="file"
											accept="image/*,application/pdf"
											{...register("evidence")}
										/>
										<p className="text-xs text-muted-foreground">
											Upload bukti tambahan (foto, PDF,
											dsb) untuk attendance selain
											check-in dan check-out.
										</p>
									</div>
								)}
							</div>
						</div>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpenDialog(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Save Attendance</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
