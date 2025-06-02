import React from "react";
import PlanCardSkeleton from "./PlanCardSkeleton";
import SeatTierCardSkeleton from "./SeatTierCardSkeleton";

interface SubscriptionPageSkeletonProps {
	view?: "package" | "seat";
}

const SubscriptionPageSkeleton: React.FC<SubscriptionPageSkeletonProps> = ({
	view = "package",
}) => {
	return (
		<div className="container mx-auto animate-pulse">
			{/* Back button skeleton */}
			<div className="mb-8">
				<div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-20"></div>
			</div>

			{/* Header skeleton */}
			<header className="text-center mb-12">
				<div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md w-96 mx-auto mb-4"></div>
				<div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-80 mx-auto"></div>
			</header>

			{/* Navigation tabs skeleton */}
			<div className="flex justify-center mb-10">
				<div className="inline-flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 w-48 h-12"></div>
			</div>

			{/* Content skeleton */}
			{view === "package" ? (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
					{[...Array(3)].map((_, index) => (
						<div key={index} className="md:col-span-1">
							<PlanCardSkeleton />
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
					{[...Array(6)].map((_, index) => (
						<SeatTierCardSkeleton key={index} />
					))}
				</div>
			)}
		</div>
	);
};

export default SubscriptionPageSkeleton;
