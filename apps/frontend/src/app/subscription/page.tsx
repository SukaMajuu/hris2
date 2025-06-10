"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, AlertCircle, LogOut } from "lucide-react";
import Link from "next/link";
import PlanCardComponent from "./_components/PlanCardComponent";
import SeatTierCardComponent from "./_components/SeatTierCardComponent";
import SubscriptionPageSkeleton from "./_components/SubscriptionPageSkeleton";
import SeatTierCardSkeleton from "./_components/SeatTierCardSkeleton";
import { useSubscription } from "./_hooks/useSubscription";
import { useLogout } from "../(auth)/logout/useLogout";

function SubscriptionPageContent() {
	const { logout, isLoading: isLoggingOut } = useLogout();

	const {
		// State
		activeView,
		selectedPlanId,

		// Data
		subscriptionPlans,
		userSubscription,
		transformedSeatTiers,
		selectedPlanName,

		// Loading states
		isLoading,
		isLoadingSeatPlans,
		hasError,
		seatPlansError,

		// Event handlers
		handleSelectPlan,
		handleSelectSeatTier,
		handleViewChange,
	} = useSubscription();

	// Loading state
	if (isLoading) {
		return <SubscriptionPageSkeleton view={activeView} />;
	}

	// Error state
	if (hasError) {
		return (
			<div className="max-w-5xl mx-auto">
				<div className="flex items-center justify-center min-h-96">
					<div className="text-center">
						<AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
						<p className="text-red-600 dark:text-red-400">
							Failed to load subscription data. Please try again.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto min-h-[95vh] flex flex-col gap-12">
			{/* Show different navigation based on user subscription status */}
			{userSubscription?.subscription_plan ? (
				// User has subscription - show go back to settings
				<div className="mb-8">
					<Link
						href="/settings"
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
					>
						<ArrowLeftIcon className="w-4 h-4 mr-1" />
						Go Back
					</Link>
				</div>
			) : (
				// User doesn't have subscription - show back to welcome and logout
				<div className="h-12 flex items-center justify-between">
					<Link
						href="/welcome"
						className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
					>
						<ArrowLeftIcon className="w-4 h-4 mr-1" />
						Kembali ke Welcome
					</Link>
					<Button
						onClick={logout}
						disabled={isLoggingOut}
						variant="outline"
						size="sm"
						className="text-slate-600 bg-primary text-white hover:bg-primary/80 cursor-pointer"
					>
						<LogOut className="h-4 w-4 mr-2" />
						{isLoggingOut ? "Logging out..." : "Logout"}
					</Button>
				</div>
			)}
			<div>
				<header className="text-center mb-12">
					<h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-5xl">
						HRIS Pricing Plans
					</h1>
					<p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
						{activeView === "package"
							? userSubscription?.subscription_plan
								? "Step 1: Choose a new plan that best suits your business features."
								: "Step 1: Choose the plan that best suits your business features."
							: `Step 2: Select an employee tier for the ${selectedPlanName} plan.`}
					</p>
				</header>

				<div className="flex justify-center mb-10">
					<div className="inline-flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
						<Button
							variant={
								activeView === "package" ? "default" : "ghost"
							}
							onClick={() => handleViewChange("package")}
							className={`px-6 py-2 rounded-md text-sm font-medium
							${
								activeView === "package"
									? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow cursor-default"
									: "text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
							}
						`}
						>
							Package
						</Button>
						<Button
							variant={
								activeView === "seat" ? "default" : "ghost"
							}
							className={`px-6 py-2 rounded-md text-sm font-medium cursor-default
							${
								activeView === "seat"
									? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow"
									: "text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
							}`}
						>
							Seat
						</Button>
					</div>
				</div>

				{activeView === "package" && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
						{subscriptionPlans?.map((plan) => (
							<div key={plan.id} className="md:col-span-1">
								<PlanCardComponent
									plan={plan}
									currentUserPlan={
										userSubscription?.subscription_plan ||
										null
									}
									onSelectPlan={handleSelectPlan}
								/>
							</div>
						))}
					</div>
				)}

				{activeView === "seat" && selectedPlanId && (
					<>
						{isLoadingSeatPlans ? (
							<div className="flex justify-center">
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl">
									{[...Array(6)].map((_, index) => (
										<SeatTierCardSkeleton key={index} />
									))}
								</div>
							</div>
						) : seatPlansError ? (
							<div className="flex items-center justify-center min-h-48">
								<div className="text-center">
									<AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
									<p className="text-red-600 dark:text-red-400">
										Failed to load seat plans. Please try
										again.
									</p>
								</div>
							</div>
						) : (
							<div className="flex justify-center">
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl">
									{transformedSeatTiers.map((tier) => (
										<SeatTierCardComponent
											key={tier.id}
											tier={tier}
											isCurrentTier={
												userSubscription?.seat_plan
													?.id === tier.id &&
												userSubscription
													?.subscription_plan?.id ===
													selectedPlanId
											}
											onSelectSeatTier={
												handleSelectSeatTier
											}
										/>
									))}
								</div>
							</div>
						)}
					</>
				)}

				{activeView === "seat" && !selectedPlanId && (
					<div className="text-center text-slate-500 dark:text-slate-400">
						<p>
							Please select a package first to see seat options.
						</p>
						<Button
							variant="link"
							onClick={() => handleViewChange("package")}
						>
							Go to Package Selection
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export default function SubscriptionPage() {
	return (
		<Suspense fallback={<SubscriptionPageSkeleton />}>
			<SubscriptionPageContent />
		</Suspense>
	);
}
