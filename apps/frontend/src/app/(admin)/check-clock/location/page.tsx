"use client";

import React, { useMemo, useEffect } from "react";
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable";
import { PaginationComponent } from "@/components/pagination";
import { PageSizeComponent } from "@/components/pageSize";
import { useLocation } from "./_hooks/useLocation";
import { LocationForm } from "./_components/locationForm";
import { LocationFilter } from "./_components/LocationFilter";
import { Edit, Filter, Plus, Search, Trash2 } from "lucide-react";
import ConfirmationDelete from "./_components/confirmationDelete";
import { usePagination } from "@/hooks/usePagination";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { FEATURE_CODES } from "@/const/features";

export default function LocationPage() {
	const { pagination, setPage, setPageSize } = usePagination(1, 10);

	const {
		locations,
		pagination: serverPagination,
		isLoading,
		error,
		dialogOpen,
		setDialogOpen,
		formData,
		setFormData,
		isEditing,
		isDeleteDialogOpen,
		locationToDelete,
		isCreating,
		isUpdating,
		isDeleting,
		handleChange,
		handleMapPositionChange,
		handleOpenAddDialog,
		handleOpenEditDialog,
		handleSaveLocation,
		handleOpenDeleteDialog,
		handleCloseDeleteDialog,
		handleConfirmDelete,
		// New filter-related properties
		filters,
		isFilterVisible,
		handleApplyFilters,
		handleResetFilters,
		handleToggleFilterVisibility,
	} = useLocation(pagination.page, pagination.pageSize);

	const columns = useMemo<ColumnDef<typeof locations[number]>[]>(
		() => [
			{
				header: "No.",
				id: "no",
				cell: ({ row }) => {
					const currentPage = serverPagination.currentPage;
					const pageSize = serverPagination.pageSize;
					return (
						<div className="flex items-center justify-center text-center">
							{(currentPage - 1) * pageSize + row.index + 1}
						</div>
					);
				},
				meta: { className: "w-[50px] md:w-[80px] text-center" },
				enableSorting: false,
				enableColumnFilter: false,
			},
			{
				header: "Location Name",
				accessorKey: "name",
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<div className="max-w-[120px] truncate text-center text-xs md:max-w-[150px] md:text-sm">
							{row.original.name}
						</div>
					</div>
				),
				meta: { className: "w-[120px] md:w-[150px] text-center" },
			},
			{
				header: "Address Details",
				accessorKey: "address_detail",
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<div className="max-w-[150px] truncate text-center text-xs md:max-w-[200px] md:text-sm">
							{row.original.address_detail || "-"}
						</div>
					</div>
				),
				meta: { className: "w-[150px] md:w-[200px] text-center" },
			},
			{
				header: "Latitude",
				accessorKey: "latitude",
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<div className="max-w-[80px] truncate text-center text-xs md:max-w-[100px] md:text-sm">
							{row.original.latitude?.toFixed(6) || "-"}
						</div>
					</div>
				),
				meta: { className: "w-[80px] md:w-[100px] text-center" },
			},
			{
				header: "Longitude",
				accessorKey: "longitude",
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<div className="max-w-[80px] truncate text-center text-xs md:max-w-[100px] md:text-sm">
							{row.original.longitude?.toFixed(6) || "-"}
						</div>
					</div>
				),
				meta: { className: "w-[80px] md:w-[100px] text-center" },
			},
			{
				header: "Radius (m)",
				accessorKey: "radius_m",
				cell: ({ row }) => (
					<div className="flex items-center justify-center">
						<div className="max-w-[70px] truncate text-center text-xs md:max-w-[80px] md:text-sm">
							{row.original.radius_m || "-"}
						</div>
					</div>
				),
				meta: { className: "w-[70px] md:w-[80px] text-center" },
			},
			{
				header: "Action",
				id: "actions",
				cell: ({ row }) => (
					<div className="flex flex-col justify-center gap-1 md:flex-row">
						<Button
							size="sm"
							variant="default"
							className="h-7 w-full cursor-pointer bg-[#6B9AC4] px-1 text-xs hover:cursor-pointer hover:bg-[#5A89B3] md:h-8 md:w-auto md:px-2"
							onClick={() => handleOpenEditDialog(row.original)}
						>
							<Edit className="mr-0 h-3 w-3 md:mr-1" />
							<span className="hidden md:inline">Edit</span>
						</Button>
						<Button
							size="sm"
							variant="destructive"
							className="h-7 w-full cursor-pointer px-1 text-xs hover:cursor-pointer hover:bg-red-800 md:h-8 md:w-auto md:px-2"
							onClick={() => handleOpenDeleteDialog(row.original)}
						>
							<Trash2 className="mr-0 h-3 w-3 md:mr-1" />
							<span className="hidden md:inline">Delete</span>
						</Button>
					</div>
				),
				meta: { className: "w-[120px] md:w-[180px] text-center" },
				enableSorting: false,
				enableColumnFilter: false,
			},
		],
		[
			handleOpenEditDialog,
			handleOpenDeleteDialog,
			serverPagination.currentPage,
			serverPagination.pageSize,
		]
	);

	const table = useReactTable<typeof locations[number]>({
		data: locations,
		columns,
		state: {
			columnFilters: [{ id: "name", value: filters.name || "" }],
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
			const nameFilterUpdate = newFilters.find((f) => f.id === "name");
			const newNameFilter = (nameFilterUpdate?.value as string) || "";
			handleApplyFilters({
				...filters,
				name: newNameFilter,
			});
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
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
			<Card className="mb-6 border border-gray-100 dark:border-gray-800">
				<CardContent>
					{" "}
					<header className="flex flex-col justify-between items-start gap-4 mb-6">
						<div className="flex flex-row flex-wrap gap-4 justify-between items-center w-full">
							<h2 className="text-xl font-semibold">Location</h2>
							<div className="flex gap-2 flex-wrap">
								<Button
									onClick={handleOpenAddDialog}
									className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3]"
								>
									<Plus className="h-4 w-4" />
									Add Data
								</Button>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 w-full md:w-[400px]">
							{" "}							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									value={filters.name || ""}
									onChange={(event) => {
										const newNameFilter = event.target.value;
										handleApplyFilters({
											...filters,
											name: newNameFilter,
										});
										table
											.getColumn("name")
											?.setFilterValue(newNameFilter);
									}}
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Location"
								/>
							</div>
							<Button
								variant={
									isFilterVisible ? "default" : "outline"
								}
								className={`gap-2 ${isFilterVisible
									? "bg-[#6B9AC4] hover:bg-[#5A89B3]"
									: "hover:bg-[#5A89B3] hover:text-white"
									}`}
								onClick={handleToggleFilterVisibility}
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>{" "}
					{/* Filter Component */}
					{isFilterVisible && (
						<div className="mb-6">
							<LocationFilter
								currentFilters={filters}
								onApplyFilters={handleApplyFilters}
								onResetFilters={handleResetFilters}
								isVisible={isFilterVisible}
							/>
						</div>
					)}
					{isLoading ? (
						<div className="flex justify-center items-center py-8">
							<div className="text-gray-500">
								Loading locations...
							</div>
						</div>
					) : error ? (
						<div className="flex justify-center items-center py-8">
							<div className="text-red-500">
								Error loading locations: {error.message}
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

			<LocationForm
				dialogOpen={dialogOpen}
				setDialogOpenAction={setDialogOpen}
				isEditing={isEditing}
				formData={formData}
				handleChangeAction={handleChange}
				setFormDataAction={setFormData}
				handleSaveAction={handleSaveLocation}
				onMapPositionChangeAction={handleMapPositionChange}
				isLoading={isCreating || isUpdating}
			/>

			<ConfirmationDelete
				isDeleteDialogOpen={isDeleteDialogOpen}
				handleCloseDeleteDialog={handleCloseDeleteDialog}
				handleConfirmDelete={handleConfirmDelete}
				locationToDelete={locationToDelete}
				isDeleting={isDeleting}
			/>
		</FeatureGuard>
	);
}
