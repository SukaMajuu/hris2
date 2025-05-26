"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface BillingOption {
	id: string;
	label: string;
	pricePerUser: number;
	type: "single" | "monthly";
	suffix: string;
}

interface SizeTier {
	id: string;
	label: string;
	maxEmployees: number;
}

interface PlanCheckoutDetails {
	planId: string;
	planName: string;
	planSubtitle: string;
	billingOptions: BillingOption[];
	sizeTiers: SizeTier[];
}

const MOCK_CHECKOUT_DATA: Record<string, PlanCheckoutDetails> = {
	standard: {
		planId: "standard",
		planName: "Standard Plan",
		planSubtitle: "Review your Standard Plan options",
		billingOptions: [
			{
				id: "std-single",
				label: "Single Payment",
				pricePerUser: 16000,
				type: "single",
				suffix: "/ User",
			},
			{
				id: "std-monthly",
				label: "Monthly",
				pricePerUser: 15000,
				type: "monthly",
				suffix: "/ User",
			},
		],
		sizeTiers: [
			{ id: "std-tier1-50", label: "1-50", maxEmployees: 50 },
			{ id: "std-tier51-100", label: "51-100", maxEmployees: 100 },
			{ id: "std-tier101-250", label: "101-250", maxEmployees: 250 },
		],
	},
	premium: {
		planId: "premium",
		planName: "Premium Plan",
		planSubtitle: "Upgrade to Premium (Pro Plan)",
		billingOptions: [
			{
				id: "prem-single",
				label: "Single Payment",
				pricePerUser: 18000,
				type: "single",
				suffix: "/ User",
			},
			{
				id: "prem-monthly",
				label: "Monthly",
				pricePerUser: 17000,
				type: "monthly",
				suffix: "/ User",
			},
		],
		sizeTiers: [
			{ id: "pre-tier1-50", label: "1-50", maxEmployees: 50 },
			{ id: "pre-tier51-100", label: "51-100", maxEmployees: 100 },
			{ id: "pre-tier101-250", label: "101-250", maxEmployees: 250 },
		],
	},
	ultra: {
		planId: "ultra",
		planName: "Ultra Plan",
		planSubtitle: "Configure your Ultra Plan",
		billingOptions: [
			{
				id: "ultra-single",
				label: "Single Payment",
				pricePerUser: 22000,
				type: "single",
				suffix: "/ User",
			},
			{
				id: "ultra-monthly",
				label: "Monthly",
				pricePerUser: 20000,
				type: "monthly",
				suffix: "/ User",
			},
		],
		sizeTiers: [
			{ id: "ult-tier1-50", label: "1-50", maxEmployees: 50 },
			{ id: "ult-tier51-100", label: "51-100", maxEmployees: 100 },
			{ id: "ult-tier101-250", label: "101-250", maxEmployees: 250 },
		],
	},
};

const formatCurrency = (value: number) => {
	return `Rp ${value.toLocaleString("id-ID")}`;
};

function CheckoutPageContent() {
	const searchParams = useSearchParams();
	const planId = searchParams.get("planId");
	const sizeTierIdFromQuery = searchParams.get("sizeTierId");

	const [planDetails, setPlanDetails] = useState<PlanCheckoutDetails | null>(
		null
	);
	const [selectedBillingOptionId, setSelectedBillingOptionId] = useState<
		string | undefined
	>(undefined);
	const [selectedSizeTierId, setSelectedSizeTierId] = useState<
		string | undefined
	>(undefined);
	const [taxRate] = useState(0.0);

	useEffect(() => {
		if (planId && MOCK_CHECKOUT_DATA[planId]) {
			const details = MOCK_CHECKOUT_DATA[planId];
			setPlanDetails(details);
			if (details.billingOptions && details.billingOptions.length > 0) {
				setSelectedBillingOptionId(details?.billingOptions[0]?.id);
			}
			if (
				sizeTierIdFromQuery &&
				details.sizeTiers.find((st) => st.id === sizeTierIdFromQuery)
			) {
				setSelectedSizeTierId(sizeTierIdFromQuery);
			} else if (details.sizeTiers && details.sizeTiers.length > 0) {
				setSelectedSizeTierId(details?.sizeTiers[0]?.id);
			}
		} else {
			setPlanDetails(null);
		}
	}, [planId, sizeTierIdFromQuery]);

	const selectedBillingOption = planDetails?.billingOptions?.find(
		(bo) => bo.id === selectedBillingOptionId
	);
	const selectedSizeTier = planDetails?.sizeTiers?.find(
		(st) => st.id === selectedSizeTierId
	);

	const pricePerUser = selectedBillingOption?.pricePerUser || 0;
	const subtotal = pricePerUser;
	const taxAmount = subtotal * taxRate;
	const totalAtRenewal = subtotal + taxAmount;

	if (!planId) {
		return (
			<div className="container mx-auto p-8 text-center">
				Plan ID missing.{" "}
				<Link
					href="/settings/subscription"
					className="text-blue-500 hover:underline"
				>
					Go back to plans
				</Link>
				.
			</div>
		);
	}
	if (!planDetails && planId && MOCK_CHECKOUT_DATA[planId]) {
		return (
			<div className="container mx-auto p-8 text-center">
				Loading plan details...
			</div>
		);
	}
	if (!planDetails) {
		return (
			<div className="container mx-auto p-8 text-center">
				Invalid plan selected.{" "}
				<Link
					href="/settings/subscription"
					className="text-blue-500 hover:underline"
				>
					Go back to plans
				</Link>
				.
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
			<div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-start">
				<div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
						{planDetails.planName}
					</h1>
					<p className="text-slate-600 dark:text-slate-400 mb-2">
						{planDetails.planSubtitle}
					</p>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="mt-1 mb-2 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400/10"
					>
						<Link href="/settings/subscription">Change plan</Link>
					</Button>

					<div className="mt-6">
						<h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
							Billing Period
						</h2>
						<RadioGroup
							value={selectedBillingOptionId}
							onValueChange={setSelectedBillingOptionId}
							className="grid grid-cols-1 sm:grid-cols-2 gap-4"
						>
							{planDetails.billingOptions.map((option) => (
								<Label
									key={option.id}
									htmlFor={option.id}
									className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:scale-95 transition-all duration-300 cursor-pointer
										${
											selectedBillingOptionId ===
											option.id
												? "border-blue-500 ring-2 ring-blue-500 dark:border-blue-400"
												: "dark:border-slate-700"
										}
									`}
								>
									<RadioGroupItem
										value={option.id}
										id={option.id}
										className="sr-only"
									/>
									<span className="font-medium text-slate-800 dark:text-slate-100">
										{option.label}
									</span>
									<span className="text-xs text-slate-500 dark:text-slate-400">
										{formatCurrency(option.pricePerUser)}{" "}
										{option.suffix}
									</span>
								</Label>
							))}
						</RadioGroup>
					</div>

					<div className="mt-8">
						<h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-1">
							Size Matters
						</h2>
						<p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
							Choose the right fit for your team!
						</p>
						<RadioGroup
							value={selectedSizeTierId}
							onValueChange={setSelectedSizeTierId}
							className="flex space-x-4"
						>
							{planDetails.sizeTiers.map((tier) => (
								<div
									key={tier.id}
									className="flex items-center space-x-2"
								>
									<RadioGroupItem
										value={tier.id}
										id={tier.id}
									/>
									<Label
										htmlFor={tier.id}
										className="font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
									>
										{tier.label}
									</Label>
								</div>
							))}
						</RadioGroup>
					</div>
				</div>

				{/* Right Column: Order Summary */}
				<div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg space-y-4">
					<h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 border-b dark:border-slate-700 pb-3">
						Order Summary
					</h2>

					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Package:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{planDetails.planName.replace(" Plan", "")}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Billing Period:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{selectedBillingOption?.label.split(" - ")[0] ||
								"N/A"}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Team Size:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{selectedSizeTier?.label || "N/A"}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Price per User:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{formatCurrency(pricePerUser)}
						</span>
					</div>

					<hr className="border-slate-200 dark:border-slate-700" />

					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Subtotal:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{formatCurrency(subtotal)}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Tax ({taxRate * 100}%):
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{formatCurrency(taxAmount)}
						</span>
					</div>

					<hr className="border-slate-200 dark:border-slate-700" />

					<div className="flex justify-between text-lg font-bold">
						<span className="text-slate-800 dark:text-slate-100">
							Total at Renewal:
						</span>
						<span className="text-slate-800 dark:text-slate-100">
							{formatCurrency(totalAtRenewal)}
						</span>
					</div>

					<Button
						size="lg"
						className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
					>
						Confirm and upgrade
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto p-8 text-center">
					Loading page...
				</div>
			}
		>
			<CheckoutPageContent />
		</Suspense>
	);
}
