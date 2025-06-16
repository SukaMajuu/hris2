"use client";

import React, { useCallback } from "react";

import { DataTable } from "@/components/dataTable";
import { PageSizeComponent } from "@/components/pageSize";
import { PaginationComponent } from "@/components/pagination";
import { EmployeeLimitCard } from "@/components/subscription/EmployeeLimitCard";
import { FeatureGuard } from "@/components/subscription/FeatureGuard";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURE_CODES } from "@/const/features";

import { StatsSection } from "./_components/StatsSection";
import { TableHeader } from "./_components/TableHeader";
import useEmployeeManagement from "./_hooks/useEmployeeManagement";
import { useEmployeeTable } from "./_hooks/useEmployeeTable";

const EmployeeManagementPage = () => {
	const {
		employees: allEmployees,
		totalEmployees: _totalEmployees,
		loading,
		error,
		handleResignEmployee: apiHandleResignEmployee,
		refetchEmployees,
	} = useEmployeeManagement(1, 100, {});

	const handleResignEmployee = useCallback(
		async (id: number) => {
			await apiHandleResignEmployee(id);
		},
		[apiHandleResignEmployee]
	);

	const {
		table,
		filteredEmployees,
		nameSearch,
		setNameSearch,
		genderFilter,
		setGenderFilter,
		statusFilter,
		setStatusFilter,
	} = useEmployeeTable({
		employees: allEmployees,
		onResignEmployee: handleResignEmployee,
	});

	if (loading) {
		return (
			<main className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
					<p>Loading employees...</p>
				</div>
			</main>
		);
	}

	if (error) {
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
			</main>
		);
	}

	return (
		<FeatureGuard feature={FEATURE_CODES.EMPLOYEE_MANAGEMENT}>
			<div className="flex flex-col gap-6">
				<StatsSection />

				<EmployeeLimitCard />

				<Card className="border border-gray-100 dark:border-gray-800">
					<CardContent>
						<TableHeader
							nameSearch={nameSearch}
							setNameSearch={setNameSearch}
							employees={filteredEmployees}
							allEmployees={allEmployees}
							genderFilter={genderFilter}
							setGenderFilter={setGenderFilter}
							statusFilter={statusFilter}
							setStatusFilter={setStatusFilter}
							onEmployeesChange={refetchEmployees}
						/>

						<DataTable table={table} />

						<div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
							<PageSizeComponent
								table={table}
								totalRecords={filteredEmployees.length}
							/>
							<PaginationComponent table={table} />
						</div>
					</CardContent>
				</Card>
			</div>
		</FeatureGuard>
	);
};

export default EmployeeManagementPage;
