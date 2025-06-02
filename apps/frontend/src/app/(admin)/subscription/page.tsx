"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
	useSubscriptionPlans,
	useUserSubscription,
	useSeatPlans,
} from "@/api/queries/subscription.queries";
import PlanCardComponent from "./_components/PlanCardComponent";
import SeatTierCardComponent, {
	SeatTier,
} from "./_components/SeatTierCardComponent";

function SubscriptionPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialStepQueryParam = searchParams.get("view");

	const [activeView, setActiveView] = useState<"package" | "seat">(
		initialStepQueryParam === "seat" ? "seat" : "package"
	);
	const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

	// API calls
	const {
		data: subscriptionPlans,
		isLoading: isLoadingPlans,
		error: plansError,
	} = useSubscriptionPlans();

	const {
		data: userSubscription,
		isLoading: isLoadingUserSubscription,
		error: userSubscriptionError,
	} = useUserSubscription();

	const {
		data: seatPlans,
		isLoading: isLoadingSeatPlans,
		error: seatPlansError,
	} = useSeatPlans(selectedPlanId || 0);

	// Set initial selected plan based on user subscription or view param
	useEffect(() => {
		if (
			initialStepQueryParam === "seat" &&
			userSubscription?.subscription_plan
		) {
			setSelectedPlanId(userSubscription.subscription_plan.id);
			setActiveView("seat");
		} else if (
			initialStepQueryParam === "seat" &&
			!userSubscription?.subscription_plan
		) {
			setActiveView("package");
		}
	}, [initialStepQueryParam, userSubscription]);

	const handleSelectPlan = (planId: number) => {
		setSelectedPlanId(planId);
		setActiveView("seat");
	};

	const handleSelectSeatTier = (planId: number, seatPlanId: number) => {
		router.push(
			`/subscription/checkout?planId=${planId}&seatPlanId=${seatPlanId}`
		);
	};

	// Transform seat plans data for UI
	const transformedSeatTiers: SeatTier[] = React.useMemo(() => {
		if (!seatPlans || !selectedPlanId) return [];

		const selectedPlan = subscriptionPlans?.find(
			(p) => p.id === selectedPlanId
		);

		return seatPlans.map((seatPlan) => ({
			id: seatPlan.id,
			packageName: selectedPlan?.name.toUpperCase() || "",
			employeeRangeDescription: `For ${seatPlan.min_employees}-${seatPlan.max_employees} Employees`,
			planId: selectedPlanId,
			sizeTierName: seatPlan.name,
			pricePerMonth: seatPlan.price_per_month,
			pricePerYear: seatPlan.price_per_year,
		}));
	}, [seatPlans, selectedPlanId, subscriptionPlans]);

	// Loading state
	if (isLoadingPlans || isLoadingUserSubscription) {
		return (
			<div className="max-w-5xl mx-auto flex items-center justify-center min-h-96">
				<div className="flex items-center space-x-2">
					<Loader2 className="h-4 w-4 animate-spin" />
					<span>Loading subscription plans...</span>
				</div>
			</div>
		);
	}

	// Error state
	if (plansError || userSubscriptionError) {
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
		<div className="container mx-auto">
			<div className="mb-8">
				<Link
					href="/settings"
					className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
				>
					<ArrowLeftIcon className="w-4 h-4 mr-1" />
					Go Back
				</Link>
			</div>
			<header className="text-center mb-12">
				<h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-5xl">
					HRIS Pricing Plans
				</h1>
				<p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
					{activeView === "package"
						? "Step 1: Choose the plan that best suits your business features."
						: `Step 2: Select an employee tier for the ${
								subscriptionPlans?.find(
									(p) => p.id === selectedPlanId
								)?.name || ""
						  } plan.`}
				</p>
			</header>

			<div className="flex justify-center mb-10">
				<div className="inline-flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
					<Button
						variant={activeView === "package" ? "default" : "ghost"}
						onClick={() => {
							setActiveView("package");
							setSelectedPlanId(null);
						}}
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
						variant={activeView === "seat" ? "default" : "ghost"}
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
									userSubscription?.subscription_plan || null
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
						<div className="flex items-center justify-center min-h-48">
							<div className="flex items-center space-x-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								<span>Loading seat plans...</span>
							</div>
						</div>
					) : seatPlansError ? (
						<div className="flex items-center justify-center min-h-48">
							<div className="text-center">
								<AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
								<p className="text-red-600 dark:text-red-400">
									Failed to load seat plans. Please try again.
								</p>
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
							{transformedSeatTiers.map((tier) => (
								<SeatTierCardComponent
									key={tier.id}
									tier={tier}
									isCurrentTier={
										userSubscription?.seat_plan?.id ===
											tier.id &&
										userSubscription?.subscription_plan
											?.id === selectedPlanId
									}
									onSelectSeatTier={handleSelectSeatTier}
								/>
							))}
						</div>
					)}
				</>
			)}

			{activeView === "seat" && !selectedPlanId && (
				<div className="text-center text-slate-500 dark:text-slate-400">
					<p>Please select a package first to see seat options.</p>
					<Button
						variant="link"
						onClick={() => setActiveView("package")}
					>
						Go to Package Selection
					</Button>
				</div>
			)}
		</div>
	);
}

export default function SubscriptionPage() {
	return (
		<Suspense fallback={<div>Loading subscription options...</div>}>
			<SubscriptionPageContent />
		</Suspense>
	);
}
