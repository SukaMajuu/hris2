import React from "react";
import { Card, CardHeader } from "@/components/ui/card";

const SeatTierCardSkeleton: React.FC = () => {
	return (
		<Card className="rounded-lg p-6 flex flex-col h-full shadow-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse">
			<CardHeader className="p-0 mb-3 pt-2">
				{/* Package name skeleton */}
				<div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-20 mb-3"></div>
				{/* Employee range skeleton */}
				<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-full mb-3"></div>
				{/* Pricing skeleton */}
				<div className="space-y-2">
					<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
					<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3"></div>
				</div>
			</CardHeader>
			<div className="mt-auto">
				{/* Button skeleton */}
				<div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
			</div>
		</Card>
	);
};

export default SeatTierCardSkeleton;
