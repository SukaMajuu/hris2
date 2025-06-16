"use client";

import { FilterX, Calendar, CheckCircle, Clock, Timer } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

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

export const AttendanceFilter = ({
	onApplyFilters,
	onResetFilters,
	currentFilters,
	isVisible: _isVisible,
}: AttendanceFilterProps) => {
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
			case "Ontime":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "Late":
				return <Clock className="h-4 w-4 text-red-500" />;
			case "Early Leave":
				return <Clock className="h-4 w-4 text-orange-500" />;
			case "Absent":
				return <Timer className="h-4 w-4 text-gray-500" />;
			case "Leave":
				return <Calendar className="h-4 w-4 text-purple-500" />;
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
									</SelectItem>{" "}
									<SelectItem
										value="Ontime"
										className="hover:bg-green-50 dark:hover:bg-green-950 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
											<span className="font-medium text-green-700 dark:text-green-300">
												Ontime
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
									<SelectItem
										value="Early Leave"
										className="hover:bg-orange-50 dark:hover:bg-orange-950 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
											<span className="font-medium text-orange-700 dark:text-orange-300">
												Early Leave
											</span>
										</div>
									</SelectItem>
									<SelectItem
										value="Absent"
										className="hover:bg-gray-50 dark:hover:bg-gray-950 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<Timer className="h-4 w-4 text-gray-500 flex-shrink-0" />
											<span className="font-medium text-gray-700 dark:text-gray-300">
												Absent
											</span>
										</div>
									</SelectItem>
									<SelectItem
										value="Leave"
										className="hover:bg-purple-50 dark:hover:bg-purple-950 cursor-pointer rounded-sm py-2 px-3 transition-colors duration-150"
									>
										<div className="flex items-center gap-3 w-full">
											<Calendar className="h-4 w-4 text-purple-500 flex-shrink-0" />{" "}
											<span className="font-medium text-purple-700 dark:text-purple-300">
												Leave
											</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Filter Actions */}
						<div className="space-y-2">
							<Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
								<FilterX className="h-4 w-4 flex-shrink-0 text-slate-500" />
								<span className="truncate">Actions</span>
							</Label>
							<div className="flex w-full gap-3">
								<Button
									onClick={handleReset}
									variant="outline"
									className="h-11 flex-1 gap-2 rounded-md border-2 border-red-300 px-6 font-medium text-red-600 transition-colors duration-200 hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
								>
									<FilterX className="h-4 w-4" />
									Reset
								</Button>
								<Button
									onClick={handleApply}
									className="h-11 flex-1 gap-2 rounded-md border-2 border-blue-500 bg-blue-500 px-6 font-semibold text-white shadow-sm transition-colors duration-200 hover:border-blue-600 hover:bg-blue-600 hover:shadow-md active:bg-blue-700"
								>
									<span>Apply Filter</span>
								</Button>
							</div>
						</div>
					</div>

					{/* Active Filters Display */}
					{(localFilters.date || localFilters.attendanceStatus) && (
						<div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-700">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
									Active Filters:
								</span>
								{localFilters.date && (
									<span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200">
										<Calendar className="h-3 w-3" />
										{new Date(
											localFilters.date
										).toLocaleDateString()}
									</span>
								)}
								{localFilters.attendanceStatus && (
									<span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
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
};
