"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FilterX, Calendar, CheckCircle, Clock, Timer } from "lucide-react";

interface FilterOptions {
	date?: string;
	attendanceStatus?: string;
}

interface AttendanceFilterProps {
	onApplyFilters: (filters: FilterOptions) => void;
	onResetFilters: () => void;
	currentFilters: FilterOptions;
	isVisible: boolean;
}

export function AttendanceFilter({
	onApplyFilters,
	onResetFilters,
	currentFilters,
	isVisible,
}: AttendanceFilterProps) {
	const [localFilters, setLocalFilters] = useState<FilterOptions>(
		currentFilters
	);

	const handleInputChange = (field: keyof FilterOptions, value: string) => {
		setLocalFilters((prev) => ({
			...prev,
			[field]: value || undefined,
		}));
	};

	const handleApply = () => {
		// Remove empty values
		const cleanFilters = Object.entries(localFilters).reduce(
			(acc, [key, value]) => {
				if (value && value.trim() !== "") {
					acc[key as keyof FilterOptions] = value.trim();
				}
				return acc;
			},
			{} as FilterOptions
		);

		onApplyFilters(cleanFilters);
	};

	const handleReset = () => {
		setLocalFilters({});
		onResetFilters();
	};
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "On Time":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "Late":
				return <Clock className="h-4 w-4 text-red-500" />;
			case "Leave":
				return <Timer className="h-4 w-4 text-yellow-500" />;
			case "Permission":
				return <Timer className="h-4 w-4 text-purple-500" />;
			default:
				return <CheckCircle className="h-4 w-4 text-slate-500" />;
		}
	};
	// Always show filter regardless of isVisible prop
	return (
		<Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl shadow-xs transition-shadow duration-200 py-0">
			<CardContent className="p-6">
				{" "}
				<div className="space-y-6">
					{/* Filter Controls */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Date Filter */}
						<div className="space-y-2">
							<Label
								htmlFor="date-filter"
								className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
							>
								<Calendar className="h-4 w-4 flex-shrink-0 text-slate-500" />
								<span className="truncate">Select Date</span>
							</Label>{" "}
							<Input
								id="date-filter"
								type="date"
								value={localFilters.date || ""}
								onChange={(e) =>
									handleInputChange("date", e.target.value)
								}
								className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors duration-200 h-11 rounded-md px-3"
								placeholder="dd/mm/yyyy"
							/>
						</div>

						{/* Attendance Status Filter */}
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="status-filter"
								className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
							>
								<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
								<span className="truncate">
									Attendance Status
								</span>
							</Label>
							<Select
								value={localFilters.attendanceStatus || "all"}
								onValueChange={(value) =>
									handleInputChange(
										"attendanceStatus",
										value === "all" ? "" : value
									)
								}
							>
								<SelectTrigger className="w-full flex-1 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors duration-200 rounded-md px-3">
									<SelectValue placeholder="All Status" />
								</SelectTrigger>
								<SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 rounded-md shadow-lg p-1">
									<SelectItem
										value="all"
										className="hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<CheckCircle className="h-4 w-4 text-slate-500 flex-shrink-0" />
											<span className="font-medium">
												All Status
											</span>
										</div>
									</SelectItem>
									<SelectItem
										value="Present"
										className="hover:bg-green-50 dark:hover:bg-green-950 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
											<span className="font-medium text-green-700 dark:text-green-300">
												Present
											</span>
										</div>
									</SelectItem>
									<SelectItem
										value="Late"
										className="hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<Clock className="h-4 w-4 text-red-500 flex-shrink-0" />
											<span className="font-medium text-red-700 dark:text-red-300">
												Late
											</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Filter Actions */}
						<div className="space-y-2">
							<Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
								<FilterX className="h-4 w-4 flex-shrink-0 text-slate-500" />
								<span className="truncate">Actions</span>
							</Label>
							<div className="flex gap-3 w-full">
								<Button
									onClick={handleReset}
									variant="outline"
									className="flex-1 gap-2 h-11 px-6 border-2 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-200 rounded-md font-medium"
								>
									<FilterX className="h-4 w-4" />
									Reset
								</Button>
								<Button
									onClick={handleApply}
									className="flex-1 gap-2 h-11 px-6 font-semibold bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white border-2 border-blue-500 hover:border-blue-600 transition-colors duration-200 rounded-md shadow-sm hover:shadow-md"
								>
									<span>Apply Filter</span>
								</Button>
							</div>
						</div>
					</div>

					{/* Active Filters Display */}
					{(localFilters.date || localFilters.attendanceStatus) && (
						<div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
									Active Filters:
								</span>
								{localFilters.date && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
										<Calendar className="h-3 w-3" />
										{new Date(
											localFilters.date
										).toLocaleDateString()}
									</span>
								)}
								{localFilters.attendanceStatus && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
										{getStatusIcon(
											localFilters.attendanceStatus
										)}
										{localFilters.attendanceStatus}
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
