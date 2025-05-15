"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckClockData, useCheckClock } from "./_hooks/useAttendance";
import { useForm } from "react-hook-form";
import { DataTable } from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Search, LogIn, LogOut, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	PaginationState,
	ColumnFiltersState,
} from "@tanstack/react-table";
import { CheckInOutDialog } from "./_components/CheckInOutDialog";
import { PermitDialog } from "./_components/PermitDialog";

interface DialogFormData {
	attendanceType: string;
	checkIn: string;
	checkOut: string;
	latitude: string;
	longitude: string;
	permitEndDate: string;
	evidence: FileList | null;
}

export default function CheckClock() {
	const { checkClockData } = useCheckClock();

	const [openSheet, setOpenSheet] = useState(false);
	const [selectedData, setSelectedData] = useState<CheckClockData | null>(
		null
	);
	const [openDialog, setOpenDialog] = useState(false);
	const [dialogActionType, setDialogActionType] = useState<
		"check-in" | "check-out" | "permit"
	>("check-in");
	const [dialogTitle, setDialogTitle] = useState("Add Attendance Data");
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [nameFilter, setNameFilter] = useState("");

	const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const pagination = useMemo(
		() => ({
			pageIndex,
			pageSize,
		}),
		[pageIndex, pageSize]
	);

	const form = useForm<DialogFormData>({
		defaultValues: {
			attendanceType: "check-in",
			checkIn: "",
			checkOut: "",
			latitude: "",
			longitude: "",
			permitEndDate: "",
			evidence: null,
		},
	});

	const { reset, setValue, watch } = form;
	const formData = watch();

	const handleViewDetails = useCallback(
		(id: number) => {
			const data = checkClockData.find(
				(item: CheckClockData) => item.id === id
			);
			if (data) {
				setSelectedData(data);
				setOpenSheet(true);
			}
		},
		[checkClockData]
	);

	const onSubmit = (data: DialogFormData) => {
		console.log("Form submitted for:", dialogActionType, data);
		setOpenDialog(false);
		reset();
	};

	const openDialogHandler = (action: "check-in" | "check-out" | "permit") => {
		reset();
		setDialogActionType(action);
		let title = "Record Attendance";
		let defaultAttendanceType = "check-in";

		if (action === "check-in") {
			title = "Record Check-In";
			defaultAttendanceType = "check-in";
		} else if (action === "check-out") {
			title = "Record Check-Out";
			defaultAttendanceType = "check-out";
		} else if (action === "permit") {
			title = "Request Permit / Leave";
			defaultAttendanceType = "sick leave"; // Default permit type
		}
		setDialogTitle(title);
		setValue("attendanceType", defaultAttendanceType);
		// Pre-fetch location for check-in/check-out if desired
		if (action === "check-in" || action === "check-out") {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setValue("latitude", position.coords.latitude.toString());
					setValue("longitude", position.coords.longitude.toString());
				},
				(error) => {
					console.error("Error getting current location:", error);
					// Optionally set to a default or leave empty
					setValue("latitude", "");
					setValue("longitude", "");
				}
			);
		}
		setOpenDialog(true);
	};

	const columns: ColumnDef<CheckClockData>[] = useMemo(
		() => [
			{
				header: "No.",
				cell: ({ row, table }) => {
					const pageIdx = table.getState().pagination.pageIndex;
					const pgSize = table.getState().pagination.pageSize;
					return pageIdx * pgSize + row.index + 1;
				},
				meta: {
					className: "max-w-[80px]",
				},
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
					const item = row.original;
					let bg = "bg-green-600";
					if (item.status === "Late") bg = "bg-red-600";
					else if (item.status === "Leave") bg = "bg-yellow-800";
					return (
						<span
							className={`px-4 py-1 rounded-md text-sm font-medium ${bg} text-white`}
						>
							{item.status}
						</span>
					);
				},
			},
			{
				header: "Details",
				accessorKey: "id",
				cell: ({ row }) => (
					<Button
						variant="default"
						size="sm"
						className="bg-blue-500 hover:bg-blue-600 text-white px-6"
						onClick={() =>
							handleViewDetails(Number(row.original.id))
						}
					>
						View
					</Button>
				),
			},
		],
		[handleViewDetails]
	);

	const table = useReactTable({
		data: checkClockData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			pagination,
			columnFilters,
		},
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		manualPagination: false,
		pageCount: Math.ceil(checkClockData.length / pageSize),
	});

	return (
		<div>
			<Card className="border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col gap-4 mb-6">
						<div className="flex flex-wrap gap-2 items-center justify-between w-full">
							<h2 className="text-xl font-semibold">
								Attendance Overview
							</h2>
							<div className="flex flex-wrap gap-2">
								<Button
									className="gap-2 bg-green-600 hover:bg-green-700 text-white"
									onClick={() =>
										openDialogHandler("check-in")
									}
								>
									<LogIn className="h-4 w-4" />
									Check In
								</Button>
								<Button
									className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
									onClick={() =>
										openDialogHandler("check-out")
									}
								>
									<LogOut className="h-4 w-4" />
									Check Out
								</Button>
								<Button
									className="gap-2 bg-blue-500 hover:bg-blue-600 text-white"
									onClick={() => openDialogHandler("permit")}
								>
									<FileText className="h-4 w-4" />
									Permit
								</Button>
							</div>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									className="pl-10 w-full bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
									placeholder="Search Employee"
									value={nameFilter}
									onChange={(e) => {
										setNameFilter(e.target.value);
									}}
								/>
							</div>
							<Button
								variant="outline"
								className="gap-2 hover:bg-[#5A89B3] hover:text-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					<DataTable table={table} />

					<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
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
							{/* Attendance Information Card */}
							<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b dark:border-slate-700">
									Attendance Information
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Date
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.date}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check In
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.checkIn}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Check Out
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.checkOut}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Work Hours
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.workHours}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Status
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.status}
										</p>
									</div>
								</div>
							</div>

							{/* Location Information Card */}
							<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b dark:border-slate-700">
									Location Information
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
									<div>
										<p className="text-xs font-medium text-slate-500">
											Location
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.location}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Detail Address
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.detailAddress ||
												"Jl. Veteran No.1, Kota Malang"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Latitude
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.latitude ||
												"-7.9783908"}
										</p>
									</div>
									<div>
										<p className="text-xs font-medium text-slate-500">
											Longitude
										</p>
										<p className="text-slate-700 dark:text-slate-300">
											{selectedData.longitude ||
												"112.621381"}
										</p>
									</div>
								</div>
							</div>

							{/* Support Evidence Card */}
							<div className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6">
								<h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b dark:border-slate-700">
									Support Evidence
								</h4>
								{selectedData.status === "Leave" ? (
									<div className="space-y-2">
										<div>
											<p className="text-xs font-medium text-slate-500">
												Leave Type
											</p>
											<p className="text-slate-700 dark:text-slate-300">
												{selectedData.leaveType
													? selectedData.leaveType.replace(
															/\b\w/g,
															(c: string) =>
																c.toUpperCase()
													  )
													: "-"}
											</p>
										</div>
										<div>
											<p className="text-xs font-medium text-slate-500">
												Evidence
											</p>
											<p className="text-slate-700 dark:text-slate-300">
												-
											</p>{" "}
											{/* Placeholder for evidence link/display if available */}
										</div>
										<p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
											Support evidence is only required
											for leave/permit attendance types.
										</p>
									</div>
								) : (
									<p className="text-sm text-slate-500 dark:text-slate-400">
										No support evidence required for this
										attendance type.
									</p>
								)}
							</div>
						</div>
					)}
				</SheetContent>
			</Sheet>

			{/* Conditional Dialog Rendering */}
			{(dialogActionType === "check-in" ||
				dialogActionType === "check-out") && (
				<CheckInOutDialog
					open={openDialog}
					onOpenChange={setOpenDialog}
					dialogTitle={dialogTitle}
					actionType={dialogActionType}
					formMethods={form}
					onSubmit={onSubmit}
				/>
			)}

			{dialogActionType === "permit" && (
				<PermitDialog
					open={openDialog}
					onOpenChange={setOpenDialog}
					dialogTitle={dialogTitle}
					formMethods={form}
					onSubmit={onSubmit}
					currentAttendanceType={formData.attendanceType}
				/>
			)}
		</div>
	);
}
