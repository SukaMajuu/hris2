import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PlanCardSkeleton: React.FC = () => {
	return (
		<Card className="rounded-xl p-6 flex flex-col h-full shadow-lg border border-slate-200 dark:border-slate-700 animate-pulse">
			<CardHeader className="p-0 pt-2">
				{/* Plan name skeleton */}
				<div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md mb-3"></div>
				{/* Description skeleton */}
				<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
			</CardHeader>
			<CardContent className="p-0 flex-grow">
				{/* Features list skeleton */}
				<div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
					{[...Array(4)].map((_, index) => (
						<div
							key={index}
							className="flex items-center justify-between gap-2"
						>
							<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md flex-1"></div>
							<div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
						</div>
					))}
				</div>
			</CardContent>
			<div className="mt-6">
				{/* Button skeleton */}
				<div className="w-full h-12 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
			</div>
		</Card>
	);
};

export default PlanCardSkeleton;
