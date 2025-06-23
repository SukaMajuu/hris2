import React from "react";

import PlanCardSkeleton from "./PlanCardSkeleton";
import SeatTierCardSkeleton from "./SeatTierCardSkeleton";

interface SubscriptionPageSkeletonProps {
	view?: "package" | "seat";
}

const SubscriptionPageSkeleton: React.FC<SubscriptionPageSkeletonProps> = ({
	view = "package",
}) => (
	<div className="container mx-auto animate-pulse">
		{/* Back button skeleton */}
		<div className="mb-8">
			<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-20" />
		</div>

		{/* Header skeleton */}
		<header className="text-center mb-12">
			<div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md w-96 mx-auto mb-4" />
			<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-80 mx-auto" />
		</header>

		{/* Navigation tabs skeleton */}
		<div className="flex justify-center mb-10">
			<div className="inline-flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 w-48 h-12" />
		</div>

		{/* Content skeleton */}
		{view === "package" ? (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
				{Array.from({ length: 3 }, (_, i) => (
					<div
						key={`plan-skeleton-${i + 1}`}
						className="md:col-span-1"
					>
						<PlanCardSkeleton />
					</div>
				))}
			</div>
		) : (
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
				{Array.from({ length: 6 }, (_, i) => (
					<SeatTierCardSkeleton key={`seat-skeleton-${i + 1}`} />
				))}
			</div>
		)}
	</div>
);

export default SubscriptionPageSkeleton;
