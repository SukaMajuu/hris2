import {
	FilterX,
	Search,
	Building2,
	Globe,
	Shuffle,
	Clock,
	Calendar,
	User,
	Briefcase,
} from "lucide-react";
import React, { useState } from "react";

import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
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
import { WORK_TYPES } from "@/const/work";

interface FilterOptions {
	assignment_status?: "all" | "assigned" | "unassigned";
	position?: string;
	work_type?: string;
	work_schedule_id?: string;
}

interface CheckClockEmployeeFilterProps {
	onApplyFilters: (filters: FilterOptions) => void;
	onResetFilters: () => void;
	currentFilters: FilterOptions;
	isVisible: boolean;
}

export const CheckClockEmployeeFilter = ({
	onApplyFilters,
	onResetFilters,
	currentFilters,
	isVisible,
}: CheckClockEmployeeFilterProps) => {
	const [localFilters, setLocalFilters] = useState<FilterOptions>(
		currentFilters
	);

	// Fetch work schedules for dropdown
	const workSchedulesQuery = useWorkSchedules(1, 100);
	const workSchedules = workSchedulesQuery.data?.items || [];
	const getWorkTypeIcon = (workType: string) => {
		switch (workType) {
			case "WFO":
				return <Building2 className="h-4 w-4" />;
			case "WFA":
				return <Globe className="h-4 w-4" />;
			case "Hybrid":
				return <Shuffle className="h-4 w-4" />;
			default:
				return <Briefcase className="h-4 w-4" />;
		}
	};

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
			{" "}
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Assignment Status Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="assignment-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<User className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Assignment Status</span>
						</Label>
						<Select
							value={localFilters.assignment_status || "all"}
							onValueChange={(value) =>
								handleInputChange("assignment_status", value)
							}
						>
							<SelectTrigger
								id="assignment-filter"
								className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
							>
								<SelectValue placeholder="Select assignment status..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									All Employees
								</SelectItem>
								<SelectItem value="assigned">
									With Work Schedule
								</SelectItem>
								<SelectItem value="unassigned">
									Without Work Schedule
								</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Position Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="position-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<Briefcase className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Position</span>
						</Label>
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 flex-shrink-0" />
							<Input
								id="position-filter"
								placeholder="Search position..."
								value={localFilters.position || ""}
								onChange={(e) =>
									handleInputChange(
										"position",
										e.target.value
									)
								}
								className="w-full pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
							/>
						</div>
					</div>

					{/* Work Type Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="work-type-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<Briefcase className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Work Type</span>
						</Label>
						<Select
							value={localFilters.work_type || "all"}
							onValueChange={(value) =>
								handleInputChange(
									"work_type",
									value === "all" ? "" : value
								)
							}
						>
							<SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
								<SelectValue placeholder="Select work type..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									value="all"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Briefcase className="h-4 w-4 text-slate-500" />
										<span>All Work Types</span>
									</div>
								</SelectItem>
								{Object.values(WORK_TYPES).map((workType) => (
									<SelectItem
										key={workType}
										value={workType}
										className="flex items-center gap-2"
									>
										<div className="flex items-center gap-2">
											{getWorkTypeIcon(workType)}
											<span>
												{workType === "WFO" &&
													"Work From Office (WFO)"}
												{workType === "WFA" &&
													"Work From Anywhere (WFA)"}
												{workType === "Hybrid" &&
													"Hybrid Work"}
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Work Schedule Filter */}
					<div className="space-y-2 min-w-0">
						<Label
							htmlFor="schedule-filter"
							className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
						>
							<Clock className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Work Schedule</span>
						</Label>
						<Select
							value={localFilters.work_schedule_id || "all"}
							onValueChange={(value) =>
								handleInputChange(
									"work_schedule_id",
									value === "all" ? "" : value
								)
							}
						>
							<SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
								<SelectValue placeholder="Select schedule..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem
									value="all"
									className="flex items-center gap-2"
								>
									<div className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-slate-500" />
										<span>All Schedules</span>
									</div>
								</SelectItem>
								{workSchedules.map((schedule) => (
									<SelectItem
										key={schedule.id}
										value={
											schedule.id?.toString() ||
											`schedule-${schedule.name}`
										}
										className="flex items-center gap-2"
									>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-slate-500" />
											<span>{schedule.name}</span>
										</div>
									</SelectItem>
								))}
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
};
