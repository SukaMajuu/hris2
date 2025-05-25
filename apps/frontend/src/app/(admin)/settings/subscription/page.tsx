"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface PricingPlan {
	id: string;
	name: string;
	description: string;
	features: string[];
}

interface SeatTier {
	id: string; // e.g., standard-tier1-50
	packageName: string; // e.g., STANDARD, PREMIUM, ULTRA - for display
	employeeRangeDescription: string; // e.g., "For 1-50 Employees"
	planId: string; // e.g., "standard"
	sizeTierId: string; // e.g., "std-tier1-50" - for checkout query param
}

const ADMIN_CURRENT_PLAN_ID = "premium";
// This should map to a dynamically generated ID if we want to show a seat tier as current
// e.g., if admin's current setup is Premium plan and 51-100 tier, this would be 'premium-tier51-100'
const ADMIN_CURRENT_SEAT_ID_FOR_SELECTED_PLAN = "premium-tier51-100"; // Example ID, will be generated

const plansData: PricingPlan[] = [
	{
		id: "standard",
		name: "Standard",
		description: "Best for small business",
		features: [
			"Employee database view & export",
			"Manual admin attendance",
			"Clock-in/out (manual + approval)",
			"Attendance status (on-time/late)",
			"Leave requests (sick, permit, annual)",
			"Employee dashboard (working hours, leave, status)",
		],
	},
	{
		id: "premium",
		name: "Premium",
		description: "Best for growing business",
		features: [
			"Admin dashboard & employee analytics",
			"GPS-based attendance",
			"Work schedule & shift management",
			"Tax & overtime calculation",
			"Fingerprint integration",
			"Detailed attendance reports",
		],
	},
	{
		id: "ultra",
		name: "Ultra",
		description: "Small businesses & startups",
		features: [
			"Face recognition attendance",
			"Auto check-out",
			"Turnover analytics",
			"Custom HR dashboards",
			"Custom overtime rules",
			"HR letters/contracts",
			"Manage subscription & seat plans",
		],
	},
];

// Helper to generate seat tiers for a given plan
const generateSeatTiersForPlan = (
	planId: string,
	planName: string
): SeatTier[] => {
	const tierRanges = [
		{
			idSuffix: "tier1-50",
			label: "1-50 Employees",
			checkoutSizeTierIdPrefix: planId.substring(0, 3),
		},
		{
			idSuffix: "tier51-100",
			label: "51-100 Employees",
			checkoutSizeTierIdPrefix: planId.substring(0, 3),
		},
		{
			idSuffix: "tier101-250",
			label: "101-250 Employees",
			checkoutSizeTierIdPrefix: planId.substring(0, 3),
		},
	];

	return tierRanges.map((range) => ({
		id: `${planId}-${range.idSuffix}`,
		packageName: planName.toUpperCase(),
		employeeRangeDescription: `For ${range.label}`,
		planId: planId,
		sizeTierId: `${range.checkoutSizeTierIdPrefix}-${range.idSuffix}`,
	}));
};

interface PlanCardComponentProps {
	plan: PricingPlan;
	currentAdminPlanId: string;
	onSelectPlan: (planId: string) => void;
}

const PlanCardComponent: React.FC<PlanCardComponentProps> = ({
	plan,
	currentAdminPlanId,
	onSelectPlan,
}) => {
	const isActuallyCurrentPlan = plan.id === currentAdminPlanId;

	const cardClasses = `
    rounded-xl p-6 flex flex-col h-full shadow-lg relative
    ${
		isActuallyCurrentPlan
			? "border-2 border-pink-500"
			: "border border-slate-200 dark:border-slate-700"
	}
  `;
	const textColor = "text-slate-700 dark:text-slate-300";

	return (
		<Card className={cardClasses}>
			{isActuallyCurrentPlan && (
				<div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
					Current Package
				</div>
			)}
			<CardHeader className="p-0 pt-2">
				<CardTitle
					className={`text-4xl font-bold text-slate-900 dark:text-slate-100`}
				>
					{plan.name}
				</CardTitle>
				<p className={`text-sm ${textColor}`}>{plan.description}</p>
			</CardHeader>
			<CardContent className="p-0 flex-grow">
				<ul className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
					{plan.features.map((feature, index) => (
						<li
							key={index}
							className={`flex items-center justify-between gap-2 ${textColor}`}
						>
							<span>{feature}</span>
							<CheckIcon className="w-4 h-4 bg-green-500 text-white rounded-full p-0.5 flex-shrink-0" />
						</li>
					))}
				</ul>
			</CardContent>
			<div className="mt-6">
				<Button
					onClick={() => onSelectPlan(plan.id)}
					className={`w-full font-semibold py-3 text-white ${
						isActuallyCurrentPlan
							? "bg-blue-600 hover:bg-blue-700"
							: "bg-pink-600 hover:bg-pink-700"
					}`}
				>
					{isActuallyCurrentPlan
						? "Configure Seats"
						: "Select a Package"}
					<ArrowRightIcon className="ml-2 w-4 h-4" />
				</Button>
			</div>
		</Card>
	);
};

interface SeatTierCardComponentProps {
	tier: SeatTier;
	isCurrentAdminTier: boolean;
	onSelectSeatTier: (planId: string, sizeTierId: string) => void;
}

const SeatTierCardComponent: React.FC<SeatTierCardComponentProps> = ({
	tier,
	isCurrentAdminTier,
	onSelectSeatTier,
}) => {
	return (
		<Card
			className={`
    rounded-lg p-6 flex flex-col h-full shadow-md bg-slate-50 dark:bg-slate-800
    border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-pink-500
  `}
		>
			{isCurrentAdminTier && (
				<div className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
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
			</CardHeader>
			<div className="mt-auto">
				<Button
					onClick={() =>
						onSelectSeatTier(tier.planId, tier.sizeTierId)
					}
					className={`w-full font-semibold py-2.5 text-sm ${
						isCurrentAdminTier
							? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
							: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white"
					}`}
					disabled={isCurrentAdminTier}
				>
					{isCurrentAdminTier ? "Current Tier" : "Select Tier"}
					{!isCurrentAdminTier && (
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
	const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => {
		// If linked directly to seat view, try to get planId from settings or default to null
		// This part might need actual data from settings page if we want to pre-select plan when view=seat
		return initialStepQueryParam === "seat" ? ADMIN_CURRENT_PLAN_ID : null;
	});

	const [currentSeatTiers, setCurrentSeatTiers] = useState<SeatTier[]>([]);

	useEffect(() => {
		if (initialStepQueryParam === "seat" && !selectedPlanId) {
			// If trying to go to seats but no plan is selected (e.g. direct link without prior selection)
			// and no admin current plan to default to, go to package selection.
			// Or, if we have ADMIN_CURRENT_PLAN_ID, we could set it here.
			setActiveView("package");
		} else if (selectedPlanId) {
			const plan = plansData.find((p) => p.id === selectedPlanId);
			if (plan) {
				setCurrentSeatTiers(
					generateSeatTiersForPlan(plan.id, plan.name)
				);
			}
		}
	}, [initialStepQueryParam, selectedPlanId]);

	const handleSelectPlan = (planId: string) => {
		setSelectedPlanId(planId);
		setActiveView("seat");
	};

	const handleSelectSeatTier = (planId: string, sizeTierId: string) => {
		router.push(
			`/settings/subscription/checkout?planId=${planId}&sizeTierId=${sizeTierId}`
		);
	};

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
								selectedPlanId
									? plansData.find(
											(p) => p.id === selectedPlanId
									  )?.name
									: ""
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
					{plansData.map((plan) => (
						<div key={plan.id} className="md:col-span-1">
							<PlanCardComponent
								plan={plan}
								currentAdminPlanId={ADMIN_CURRENT_PLAN_ID}
								onSelectPlan={handleSelectPlan}
							/>
						</div>
					))}
				</div>
			)}

			{activeView === "seat" && selectedPlanId && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{currentSeatTiers.map((tier) => (
						<SeatTierCardComponent
							key={tier.id}
							tier={tier}
							isCurrentAdminTier={
								tier.id ===
									ADMIN_CURRENT_SEAT_ID_FOR_SELECTED_PLAN &&
								tier.planId === ADMIN_CURRENT_PLAN_ID
							}
							onSelectSeatTier={handleSelectSeatTier}
						/>
					))}
				</div>
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
