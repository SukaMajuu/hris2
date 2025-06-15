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
import { Location, LocationResponse } from "@/types/location";
import { createLocationColumns } from "./_components/LocationTableColumns";

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

	const columns = useMemo<ColumnDef<LocationResponse>[]>(
		() =>
			createLocationColumns(
				serverPagination.currentPage,
				serverPagination.pageSize,
				handleOpenEditDialog,
				handleOpenDeleteDialog
			),
		[
			serverPagination.currentPage,
			serverPagination.pageSize,
			handleOpenEditDialog,
			handleOpenDeleteDialog,
		]
	);

	const table = useReactTable<LocationResponse>({
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
							{" "}
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									value={filters.name || ""}
									onChange={(event) => {
										const newNameFilter =
											event.target.value;
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
								className={`gap-2 ${
									isFilterVisible
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
							<div className="text-center">
								<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
								<p>Loading locations...</p>
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
								<p className="font-medium text-red-600">
									Error loading data
								</p>
								<p className="mt-1 text-sm text-gray-600">
									{error.message}
								</p>
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
