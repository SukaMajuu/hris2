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
	Search,
	Calendar,
	User,
	Clock,
} from "lucide-react";

interface FilterOptions {
	employeeName?: string;
	dateFrom?: string;
	dateTo?: string;
	status?: string;
}

interface CheckClockOverviewFilterProps {
	onApplyFilters: (filters: FilterOptions) => void;
	onResetFilters: () => void;
	currentFilters: FilterOptions;
	isVisible: boolean;
}

export function CheckClockOverviewFilter({
	onApplyFilters,
	onResetFilters,
	currentFilters,
	isVisible,
}: CheckClockOverviewFilterProps) {
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

	if (!isVisible) return null;

	return (
		<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm mb-6">
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Employee Name Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="employee-name-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<User className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Employee Name</span>
						</Label>
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 flex-shrink-0" />
							<Input
								id="employee-name-filter"
								placeholder="Search by employee name..."
								value={localFilters.employeeName || ""}
								onChange={(e) =>
									handleInputChange(
										"employeeName",
										e.target.value
									)
								}
								className="w-full pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
							/>
						</div>
					</div>

					{/* Date From Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="date-from-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<Calendar className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">From Date</span>
						</Label>
						<Input
							id="date-from-filter"
							type="date"
							value={localFilters.dateFrom || ""}
							onChange={(e) =>
								handleInputChange("dateFrom", e.target.value)
							}
							className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
						/>
					</div>

					{/* Date To Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="date-to-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<Calendar className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">To Date</span>
						</Label>
						<Input
							id="date-to-filter"
							type="date"
							value={localFilters.dateTo || ""}
							onChange={(e) =>
								handleInputChange("dateTo", e.target.value)
							}
							className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
						/>
					</div>

					{/* Status Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="status-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<Clock className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Status</span>
						</Label>
						<Select
							value={localFilters.status || "all"}
							onValueChange={(value) =>
								handleInputChange(
									"status",
									value === "all" ? "" : value
								)
							}
						>
							<SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
								<SelectValue placeholder="Select status..." />
							</SelectTrigger>							<SelectContent>
								<SelectItem
									value="all"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-slate-500" />
										<span>All Status</span>
									</div>
								</SelectItem>
								<SelectItem
									value="ontime"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-green-500" />
										<span>Ontime</span>
									</div>
								</SelectItem>
								<SelectItem
									value="late"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-red-500" />
										<span>Late</span>
									</div>
								</SelectItem>
								<SelectItem
									value="early leave"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-orange-500" />
										<span>Early Leave</span>
									</div>
								</SelectItem>
								<SelectItem
									value="absent"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-gray-500" />
										<span>Absent</span>
									</div>
								</SelectItem>
								<SelectItem
									value="leave"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Clock className="h-4 w-4 text-blue-500" />
										<span>Leave</span>
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Filter Actions */}
				<div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
					<Button
						onClick={handleReset}
						variant="outline"
						className="gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
					>
						<FilterX className="h-4 w-4" />
						Reset Filters
					</Button>
					<Button
						onClick={handleApply}
						className="gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white px-4 py-2"
					>
						<Search className="h-4 w-4" />
						Apply Filters
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
