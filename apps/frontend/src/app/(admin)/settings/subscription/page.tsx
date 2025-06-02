"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CheckIcon,
	ArrowRightIcon,
	ArrowLeftIcon,
	AlertCircle,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
	useSubscriptionPlans,
	useUserSubscription,
	useSeatPlans,
} from "@/api/queries/subscription.queries";
import { SubscriptionPlan } from "@/types/subscription";

interface SeatTier {
	id: number;
	packageName: string;
	employeeRangeDescription: string;
	planId: number;
	sizeTierName: string;
	pricePerMonth: number;
	pricePerYear: number;
}

interface PlanCardComponentProps {
	plan: SubscriptionPlan;
	currentUserPlan: SubscriptionPlan | null;
	onSelectPlan: (planId: number) => void;
}

const PlanCardComponent: React.FC<PlanCardComponentProps> = ({
	plan,
	currentUserPlan,
	onSelectPlan,
}) => {
	const isCurrentPlan = currentUserPlan?.id === plan.id;
	const isInactive = plan.is_active === false;

	const cardClasses = `
		rounded-xl p-6 flex flex-col h-full shadow-lg relative
		${
			isCurrentPlan
				? "border-2 border-primary"
				: "border border-slate-200 dark:border-slate-700"
		}
		${isInactive ? "opacity-60 bg-slate-50 dark:bg-slate-800/50" : ""}
	`;
	const textColor = `text-slate-700 dark:text-slate-300 ${
		isInactive ? "opacity-70" : ""
	}`;

	return (
		<Card className={cardClasses}>
			{isCurrentPlan && (
				<div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Current Package
				</div>
			)}
			{isInactive && !isCurrentPlan && (
				<div className="absolute top-3 right-3 bg-slate-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Not Available
				</div>
			)}
			<CardHeader className="p-0 pt-2">
				<CardTitle
					className={`text-4xl font-bold text-slate-900 dark:text-slate-100 ${
						isInactive ? "opacity-70" : ""
					}`}
				>
					{plan.name}
				</CardTitle>
				<p className={`text-sm ${textColor}`}>{plan.description}</p>
			</CardHeader>
			<CardContent className="p-0 flex-grow">
				<ul className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
					{plan.features &&
					plan.features.length > 0 &&
					!isInactive ? (
						plan.features.map((feature, index) => (
							<li
								key={
									typeof feature === "object"
										? feature.id
										: index
								}
								className={`flex items-center justify-between gap-2 ${textColor}`}
							>
								<span>
									{typeof feature === "object"
										? feature.name
										: feature}
								</span>
								<CheckIcon
									className={`w-4 h-4 bg-green-500 text-white rounded-full p-0.5 flex-shrink-0 ${
										isInactive ? "opacity-50" : ""
									}`}
								/>
							</li>
						))
					) : (
						<li className={`${textColor} text-center py-4`}>
							No features available
						</li>
					)}
				</ul>
			</CardContent>
			<div className="mt-6">
				<Button
					onClick={() => !isInactive && onSelectPlan(plan.id)}
					disabled={isInactive}
					className={`w-full font-semibold py-3 text-white ${
						isCurrentPlan
							? "bg-primary hover:bg-primary/80"
							: isInactive
							? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
							: "bg-primary hover:bg-primary/80"
					}`}
				>
					{isInactive
						? "Not Available Right Now"
						: isCurrentPlan
						? "Configure Seats"
						: "Select a Package"}
					{!isInactive && <ArrowRightIcon className="ml-2 w-4 h-4" />}
				</Button>
			</div>
		</Card>
	);
};

interface SeatTierCardComponentProps {
	tier: SeatTier;
	isCurrentTier: boolean;
	onSelectSeatTier: (planId: number, seatPlanId: number) => void;
}

const SeatTierCardComponent: React.FC<SeatTierCardComponentProps> = ({
	tier,
	isCurrentTier,
	onSelectSeatTier,
}) => {
	const formatCurrency = (value: number) => {
		return `Rp ${value.toLocaleString("id-ID")}`;
	};

	return (
		<Card
			className={`
				rounded-lg p-6 flex flex-col h-full shadow-md bg-slate-50 dark:bg-slate-800
				border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-primary relative
			`}
		>
			{isCurrentTier && (
				<div className="absolute top-3 right-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Current Tier
				</div>
			)}
			<CardHeader className="p-0 mb-3 pt-2">
				<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
					{tier.packageName} Plan
				</p>
				<p className="text-lg font-medium text-slate-700 dark:text-slate-200 mt-2">
					{tier.employeeRangeDescription}
				</p>
				<div className="mt-2 space-y-1">
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Monthly: {formatCurrency(tier.pricePerMonth)}
					</p>
					<p className="text-sm text-slate-600 dark:text-slate-400">
						Yearly: {formatCurrency(tier.pricePerYear)}
					</p>
				</div>
			</CardHeader>
			<div className="mt-auto">
				<Button
					onClick={() => onSelectSeatTier(tier.planId, tier.id)}
					className={`w-full font-semibold py-2.5 text-sm ${
						isCurrentTier
							? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
							: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white"
					}`}
					disabled={isCurrentTier}
				>
					{isCurrentTier ? "Current Tier" : "Select Tier"}
					{!isCurrentTier && (
						<ArrowRightIcon className="ml-1.5 w-4 h-4" />
					)}
				</Button>
			</div>
		</Card>
	);
};

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
			`/settings/subscription/checkout?planId=${planId}&seatPlanId=${seatPlanId}`
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
		<div className="max-w-5xl mx-auto">
			<div className="mb-8">
				<Link
					href="/settings"
					className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
				>
					<ArrowLeftIcon className="w-4 h-4 mr-1" />
					Back to Settings
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
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
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
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
