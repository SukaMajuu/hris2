"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
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

import WorkScheduleDetailDialog from "./_components/WorkScheduleDetail";
import { useWorkSchedule } from "./_hooks/useWorkSchedule";
import { useWorkScheduleTable } from "./_hooks/useWorkScheduleTable";

const WorkSchedulePage = () => {
	const { pagination, setPage, setPageSize } = usePagination(1, 10);

	const {
		// Data with normalized pagination
		workSchedules,
		pagination: serverPagination,
		isLoading,
		isError,
		error,

		// Dialog state
		isDeleteDialogOpen,
		workScheduleToDelete,
		viewDialogOpen,
		viewedSchedule,

		// Handlers
		handleOpenDeleteDialog,
		handleCloseDeleteDialog,
		handleOpenViewDialog,
		handleCloseViewDialog,
		handleConfirmDelete,
		handleEdit,
		handleRowClick,
	} = useWorkSchedule(pagination.page, pagination.pageSize);

	// Table logic
	const {
		table,
		scheduleNameFilter,
		handleNameFilterChange,
	} = useWorkScheduleTable({
		workSchedules,
		pagination: serverPagination,
		onEdit: handleEdit,
		onView: handleOpenViewDialog,
		onDelete: handleOpenDeleteDialog,
		onRowClick: handleRowClick,
		onPageChange: setPage,
		onPageSizeChange: setPageSize,
	});
	if (isLoading) {
		return (
			<main className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
					<p>Loading work schedules...</p>
				</div>
			</main>
		);
	}

	if (isError) {
		return (
			<main className="flex min-h-screen items-center justify-center">
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
						{error?.message}
					</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Retry
					</button>
				</div>
			</main>
		);
	}

	return (
		<FeatureGuard feature={FEATURE_CODES.CHECK_CLOCK_SYSTEM}>
			<Card className="border border-gray-100 dark:border-gray-800">
				<CardContent>
					<header className="flex flex-col gap-4 mb-6">
						<div className="flex flex-row flex-wrap justify-between items-center w-full">
							<h2 className="text-xl font-semibold">
								Work Schedule
							</h2>
							<Link href="/check-clock/work-schedule/add">
								<Button className="gap-2 bg-primary hover:bg-primary/90 text-white dark:text-slate-100 hover:cursor-pointer px-4 py-2 rounded-md">
									<Plus className="h-4 w-4" />
									Add Data
								</Button>
							</Link>
						</div>
						<div className="flex flex-wrap items-center gap-4 md:w-[400px]">
							<div className="relative flex-[1]">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									value={scheduleNameFilter ?? ""}
									onChange={(event) =>
										handleNameFilterChange(
											event.target.value
										)
									}
									className="pl-10 w-full bg-white border-gray-200"
									placeholder="Search Schedule Name"
								/>
							</div>
						</div>
					</header>
					<DataTable table={table} onRowClick={handleRowClick} />

					<footer className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
						<PageSizeComponent table={table} />
						<PaginationComponent table={table} />
					</footer>
				</CardContent>
			</Card>

			<ConfirmationDialog
				open={isDeleteDialogOpen}
				onOpenChange={handleCloseDeleteDialog}
				itemName={workScheduleToDelete?.name}
				itemType="work schedule"
				onConfirm={handleConfirmDelete}
				onCancel={handleCloseDeleteDialog}
			/>

			<WorkScheduleDetailDialog
				open={viewDialogOpen}
				onOpenChange={handleCloseViewDialog}
				scheduleName={viewedSchedule?.name}
				workScheduleType={viewedSchedule?.work_type}
				workScheduleDetails={
					Array.isArray(viewedSchedule?.details)
						? viewedSchedule.details
						: []
				}
			/>
		</FeatureGuard>
	);
};

export default WorkSchedulePage;
