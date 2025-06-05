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
	MapPin, 
	Navigation, 
	Target,
	SortAsc,
	SortDesc
} from "lucide-react";

interface FilterOptions {
	name?: string;
	address_detail?: string;
	radius_range?: string;
	sort_by?: string;
	sort_order?: "asc" | "desc";
}

interface LocationFilterProps {
	onApplyFilters: (filters: FilterOptions) => void;
	onResetFilters: () => void;
	currentFilters: FilterOptions;
	isVisible: boolean;
}

export function LocationFilter({
	onApplyFilters,
	onResetFilters,
	currentFilters,
	isVisible,
}: LocationFilterProps) {
	const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);

	const radiusRanges = [
		{ label: "All Ranges", value: "all" },
		{ label: "0m (Exact location)", value: "0" },
		{ label: "< 100m", value: "<100" },
		{ label: "100-500m", value: "100-500" },
		{ label: "> 500m", value: ">500" },
	];

	const sortOptions = [
		{ label: "Location Name (A-Z)", value: "name", order: "asc" as const },
		{ label: "Location Name (Z-A)", value: "name", order: "desc" as const },
		{ label: "Radius (Smallest to Largest)", value: "radius_m", order: "asc" as const },
		{ label: "Radius (Largest to Smallest)", value: "radius_m", order: "desc" as const },
		{ label: "Date Created (Newest)", value: "created_at", order: "desc" as const },
		{ label: "Date Created (Oldest)", value: "created_at", order: "asc" as const },
	];

	const getSortIcon = (order: "asc" | "desc") => {
		return order === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
	};
	const handleInputChange = (field: keyof FilterOptions, value: string) => {
		setLocalFilters(prev => ({
			...prev,
			[field]: value || undefined,
		}));
	};

	const handleSortChange = (sortValue: string) => {
		const sortOption = sortOptions.find(option => 
			`${option.value}_${option.order}` === sortValue
		);
		
		if (sortOption) {
			setLocalFilters(prev => ({
				...prev,
				sort_by: sortOption.value,
				sort_order: sortOption.order,
			}));
		} else {
			setLocalFilters(prev => ({
				...prev,
				sort_by: undefined,
				sort_order: undefined,
			}));
		}
	};
	const handleApply = () => {
		// Remove empty values
		const cleanFilters = Object.entries(localFilters).reduce((acc, [key, value]) => {
			if (value && value.toString().trim() !== "" && value !== "all") {
				acc[key as keyof FilterOptions] = value;
			}
			return acc;
		}, {} as FilterOptions);
		
		onApplyFilters(cleanFilters);
	};

	const handleReset = () => {
		setLocalFilters({});
		onResetFilters();
	};	return (
		<Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm mb-6">
			<CardContent className="pt-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
					{/* Location Name Filter */}
					<div className="space-y-2 min-w-0">
						<Label htmlFor="name-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
							<MapPin className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Location Name</span>
						</Label>
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 flex-shrink-0" />
							<Input
								id="name-filter"
								placeholder="Search location name..."
								value={localFilters.name || ""}
								onChange={(e) => handleInputChange("name", e.target.value)}
								className="w-full pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
							/>
						</div>
					</div>

					{/* Address Details Filter */}
					<div className="space-y-2 min-w-0">
						<Label htmlFor="address-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
							<Navigation className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Address Details</span>
						</Label>
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 flex-shrink-0" />
							<Input
								id="address-filter"
								placeholder="Search city, province..."
								value={localFilters.address_detail || ""}
								onChange={(e) => handleInputChange("address_detail", e.target.value)}
								className="w-full pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
							/>
						</div>
					</div>

					{/* Radius Range Filter */}
					<div className="space-y-2 min-w-0">
						<Label htmlFor="radius-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
							<Target className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Radius Range</span>
						</Label>
						<Select
							value={localFilters.radius_range || "all"}
							onValueChange={(value) => handleInputChange("radius_range", value === "all" ? "" : value)}
						>
							<SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
								<SelectValue placeholder="Select radius range..." />
							</SelectTrigger>
							<SelectContent>
								{radiusRanges.map((range) => (
									<SelectItem key={range.value} value={range.value} className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											<Target className="h-4 w-4 text-slate-500" />
											<span>{range.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Sort Options */}
					<div className="space-y-2 min-w-0">
						<Label htmlFor="sort-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
							<SortAsc className="h-4 w-4 flex-shrink-0" />
							<span className="truncate">Sort By</span>
						</Label>
						<Select
							value={localFilters.sort_by && localFilters.sort_order ? `${localFilters.sort_by}_${localFilters.sort_order}` : "default"}
							onValueChange={handleSortChange}
						>
							<SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
								<SelectValue placeholder="Select sort option..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="default" className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<SortAsc className="h-4 w-4 text-slate-500" />
										<span>Default Order</span>
									</div>
								</SelectItem>
								{sortOptions.map((option) => (
									<SelectItem 
										key={`${option.value}_${option.order}`} 
										value={`${option.value}_${option.order}`}
										className="flex items-center gap-2"
									>
										<div className="flex items-center gap-2">
											{getSortIcon(option.order)}
											<span>{option.label}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Filter Actions */}
					<div className="space-y-2 min-w-0 flex flex-col justify-end">
						<div className="flex gap-2">
							<Button
								onClick={handleReset}
								variant="outline"
								className="flex-1 gap-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
							>
								<FilterX className="h-4 w-4" />
								Reset
							</Button>
							<Button
								onClick={handleApply}
								className="flex-1 gap-2 bg-[#6B9AC4] hover:bg-[#5A89B3] text-white"
							>
								<Search className="h-4 w-4" />
								Apply
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
