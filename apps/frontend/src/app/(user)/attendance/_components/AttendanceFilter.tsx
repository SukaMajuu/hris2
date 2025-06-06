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
import { 
	FilterX, 
	Calendar,
	CheckCircle,
	Clock,
	Timer
} from "lucide-react";

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
	const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);

	const handleInputChange = (field: keyof FilterOptions, value: string) => {
		setLocalFilters(prev => ({
			...prev,
			[field]: value || undefined,
		}));
	};

	const handleApply = () => {
		// Remove empty values
		const cleanFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
			if (value && value.trim() !== "") {
				acc[key as keyof FilterOptions] = value.trim();
			}
			return acc;
		}, {} as FilterOptions);
		
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
		}	};

	// Always show filter regardless of isVisible prop
	return (		<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mb-6 rounded-lg">
			<CardContent className="p-6">
				<div className="space-y-6">
					{/* Filter Controls */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Date Filter */}
						<div className="space-y-2">							<Label htmlFor="date-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
								<Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
								<span className="truncate">Select Date</span>
							</Label>							<div className="relative">
								<Input
									id="date-filter"
									type="date"
									value={localFilters.date || ""}
									onChange={(e) => handleInputChange("date", e.target.value)}
									className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 pl-3 h-11 rounded-md"
									placeholder="dd/mm/yyyy"
								/>
								<Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							</div>
						</div>

						{/* Attendance Status Filter */}
						<div className="space-y-2">							<Label htmlFor="status-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
								<CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
								<span className="truncate">Attendance Status</span>
							</Label>							<Select
								value={localFilters.attendanceStatus || "all"}
								onValueChange={(value) => handleInputChange("attendanceStatus", value === "all" ? "" : value)}
							>
								<SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 h-11 rounded-md">
									<SelectValue placeholder="All Status" />
								</SelectTrigger>								<SelectContent>									<SelectItem value="all" className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											<CheckCircle className="h-4 w-4 text-slate-500" />
											<span>All Status</span>
										</div>
									</SelectItem>
									<SelectItem value="Present" className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											{getStatusIcon("On Time")}
											<span>Present</span>
										</div>
									</SelectItem>
									<SelectItem value="Late" className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											{getStatusIcon("Late")}
											<span>Late</span>
										</div>
									</SelectItem>
									<SelectItem value="Leave" className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											{getStatusIcon("Leave")}
											<span>Leave</span>
										</div>
									</SelectItem>
									<SelectItem value="Permission" className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											<Timer className="h-4 w-4 text-purple-500" />
											<span>Permission</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>						{/* Filter Actions */}
						<div className="space-y-2 flex flex-col justify-end">
							<div className="flex gap-3">								<Button
									onClick={handleReset}
									variant="outline"
									className="flex-1 gap-2 h-11 px-6 border border-red-300 text-red-600"
								>
									<FilterX className="h-4 w-4" />
									Reset
								</Button>								<Button
									onClick={handleApply}
									className="flex-1 gap-2 h-11 px-6 font-semibold bg-blue-500 hover:bg-blue-600 text-white"
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
										{new Date(localFilters.date).toLocaleDateString()}
									</span>
								)}
								{localFilters.attendanceStatus && (
									<span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
										{getStatusIcon(localFilters.attendanceStatus)}
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