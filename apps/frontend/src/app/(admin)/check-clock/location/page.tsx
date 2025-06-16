"use client";

import { Filter, Plus, Search } from "lucide-react";
import React from "react";

import { DataTable } from "@/components/dataTable";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { FEATURE_CODES } from "@/const/features";
import { usePagination } from "@/hooks/usePagination";

import { LocationFilter } from "./_components/LocationFilter";
import { LocationForm } from "./_components/locationForm";
import { useLocation } from "./_hooks/useLocation";
import { useLocationTable } from "./_hooks/useLocationTable";

const LocationPage = () => {
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
		// Filter-related properties
		filters,
		isFilterVisible,
		handleApplyFilters,
		handleResetFilters,
		handleToggleFilterVisibility,
	} = useLocation(pagination.page, pagination.pageSize);

	// Table logic
	const { table, handleNameFilterChange } = useLocationTable({
		locations,
		pagination: serverPagination,
		filters,
		onEdit: handleOpenEditDialog,
		onDelete: handleOpenDeleteDialog,
		onPageChange: setPage,
		onPageSizeChange: setPageSize,
		onApplyFilters: handleApplyFilters,
	});

	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
			<Card className="mb-6 border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col justify-between items-start gap-4 mb-6">
						<div className="flex flex-row flex-wrap gap-4 justify-between items-center w-full">
							<h2 className="text-xl font-semibold">Location</h2>
							<div className="flex gap-2 flex-wrap">
								<Button
									onClick={handleOpenAddDialog}
									className="gap-2 bg-primary hover:bg-primary/90"
								>
									<Plus className="h-4 w-4" />
									Add Data
								</Button>
							</div>
						</div>
						<div className="flex flex-wrap gap-2 w-full md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									value={filters.name || ""}
									onChange={(event) =>
										handleNameFilterChange(
											event.target.value
										)
									}
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
										? "bg-primary hover:bg-primary/90"
										: "hover:bg-primary/90 hover:text-white"
								}`}
								onClick={handleToggleFilterVisibility}
							>
								<Filter className="h-4 w-4" />
								Filter
							</Button>
						</div>
					</header>

					{/* Filter Component */}
					{isFilterVisible && (
						<div className="mb-6">
							<LocationFilter
								currentFilters={filters}
								onApplyFilters={handleApplyFilters}
								onResetFilters={handleResetFilters}
							/>
						</div>
					)}

					{/* Loading State */}
					{isLoading && (
						<div className="flex justify-center items-center py-8">
							<div className="text-center">
								<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
								<p>Loading locations...</p>
							</div>
						</div>
					)}

					{/* Error State */}
					{!isLoading && error && (
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
									type="button"
									onClick={() => window.location.reload()}
									className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								>
									Retry
								</button>
							</div>
						</div>
					)}

					{/* Data Table */}
					{!isLoading && !error && <DataTable table={table} />}

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

			<ConfirmationDialog
				open={isDeleteDialogOpen}
				onOpenChange={handleCloseDeleteDialog}
				itemName={locationToDelete?.name}
				itemType="location"
				onConfirm={handleConfirmDelete}
				onCancel={handleCloseDeleteDialog}
				isLoading={isDeleting}
			/>
		</FeatureGuard>
	);
};

export default LocationPage;
