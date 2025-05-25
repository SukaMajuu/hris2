"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, ArrowRightIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface PricingPlan {
	id: string;
	name: string;
	description: string;
	features: string[];
	isCurrentPlan?: boolean;
}

interface SeatTier {
	id: string;
	packageName: string;
	price: string;
	priceFrequency: string;
	employeeRangeDescription: string;
	isCurrent?: boolean;
}

const ADMIN_CURRENT_PLAN_ID = "premium";

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
		isCurrentPlan: false,
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
		isCurrentPlan: ADMIN_CURRENT_PLAN_ID === "premium",
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
		isCurrentPlan: false,
	},
];

const seatTiersData: SeatTier[] = [
	{
		id: "standard-50",
		packageName: "STANDARD",
		price: "Rp 15.000",
		priceFrequency: "/user/month",
		employeeRangeDescription: "This package for 1 until 50 employee",
		isCurrent: false,
	},
	{
		id: "premium-100",
		packageName: "PREMIUM",
		price: "Rp 12.000",
		priceFrequency: "/user/month",
		employeeRangeDescription: "This package for 51 until 100 employee",
		isCurrent: true,
	},
	{
		id: "ultra-50",
		packageName: "ULTRA",
		price: "Rp 19.000",
		priceFrequency: "/user/month",
		employeeRangeDescription: "This package for 1 until 50 employee",
		isCurrent: false,
	},
];

const PlanCardComponent: React.FC<{ plan: PricingPlan }> = ({ plan }) => {
	const cardClasses = `
    rounded-xl p-6 flex flex-col h-full shadow-lg relative
    ${
		plan.isCurrentPlan
			? "border-2 border-pink-500"
			: "border border-slate-200 dark:border-slate-700"
	}
  `;
	const textColor = "text-slate-700 dark:text-slate-300";

	return (
		<Card className={cardClasses}>
			<CardHeader className="p-0">
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
				{plan.isCurrentPlan ? (
					<Button
						disabled
						className={`w-full font-semibold py-3 text-white opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400`}
					>
						Current Plan
					</Button>
				) : (
					<Link
						href={`/settings/subscription/checkout?planId=${plan.id}`}
					>
						<Button
							className={`w-full font-semibold py-3 text-white bg-pink-600 hover:bg-pink-700`}
						>
							Select a Package
							<ArrowRightIcon className="ml-2 w-4 h-4" />
						</Button>
					</Link>
				)}
			</div>
		</Card>
	);
};

const SeatTierCardComponent: React.FC<{ tier: SeatTier }> = ({ tier }) => {
	const cardClasses = `
    rounded-lg p-6 flex flex-col h-full shadow-md bg-slate-50 dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    ${tier.isCurrent ? "ring-2 ring-pink-500" : ""}
  `;

	return (
		<Card className={cardClasses}>
			<CardHeader className="p-0 mb-3">
				<p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
					{tier.packageName}
				</p>
				<div className="mt-1 mb-1">
					<span className="text-3xl font-bold text-slate-700 dark:text-slate-200">
						{tier.price}
					</span>
					<span className="text-xs ml-1 text-slate-500 dark:text-slate-400">
						{tier.priceFrequency}
					</span>
				</div>
				<p className="text-sm text-slate-600 dark:text-slate-300">
					{tier.employeeRangeDescription}
				</p>
			</CardHeader>
			<div className="mt-auto">
				<Button
					className={`w-full font-semibold py-2.5 text-sm
                    ${
						tier.isCurrent
							? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
							: "bg-slate-600 hover:bg-slate-700 dark:bg-slate-500 dark:hover:bg-slate-600 text-white"
					}`}
					disabled={tier.isCurrent}
				>
					{tier.isCurrent ? "Current Paket" : "Upgrade Paket"}
					{!tier.isCurrent && (
						<ArrowRightIcon className="ml-1.5 w-4 h-4" />
					)}
				</Button>
			</div>
		</Card>
	);
};

export default function SubscriptionPage() {
	const [activeView, setActiveView] = useState<"package" | "seat">("package");

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
					Choose the plan that best suits your business! This HRIS
					offers both subscription and pay-as-you-go payment options,
					available in the following packages:
				</p>
			</header>

			<div className="flex justify-center mb-10">
				<div className="inline-flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
					<Button
						variant={activeView === "package" ? "default" : "ghost"}
						onClick={() => setActiveView("package")}
						className={`px-6 py-2 rounded-md text-sm font-medium
							${
								activeView === "package"
									? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow"
									: "text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
							}`}
					>
						Package
					</Button>
					<Button
						variant={activeView === "seat" ? "default" : "ghost"}
						onClick={() => setActiveView("seat")}
						className={`px-6 py-2 rounded-md text-sm font-medium
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
							<PlanCardComponent plan={plan} />
						</div>
					))}
				</div>
			)}

			{activeView === "seat" && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{seatTiersData.map((tier) => (
						<SeatTierCardComponent key={tier.id} tier={tier} />
					))}
				</div>
			)}
		</div>
	);
}
