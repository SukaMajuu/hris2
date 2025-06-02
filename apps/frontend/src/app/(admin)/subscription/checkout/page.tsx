"use client";

import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { useCheckout } from "./_hooks/useCheckout";
import CheckoutPageSkeleton from "./_components/CheckoutPageSkeleton";

const formatCurrency = (value: number) => {
	return `Rp ${value.toLocaleString("id-ID")}`;
};

function CheckoutPageContent() {
	const {
		// URL Parameters
		planId,
		seatPlanId,

		// Selected data
		selectedPlan,
		selectedSeatPlan,
		selectedBillingOption,

		// Billing options
		billingOptions,
		selectedBillingOptionId,
		setSelectedBillingOptionId,

		// Price calculations
		pricePerUser,
		subtotal,
		taxAmount,
		totalAtRenewal,
		taxRate,

		// Validation
		isValidCheckout,

		// Loading and error states
		isLoading,
		hasError,
	} = useCheckout();

	// Loading state
	if (isLoading) {
		return <CheckoutPageSkeleton />;
	}

	// Error state
	if (hasError) {
		return (
			<div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
				<div className="max-w-5xl mx-auto flex items-center justify-center min-h-96">
					<div className="text-center">
						<AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
						<p className="text-red-600 dark:text-red-400">
							Failed to load checkout data. Please try again.
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Validation
	if (!planId || !seatPlanId) {
		return (
			<div className="container mx-auto p-8 text-center">
				Plan ID or Seat Plan ID missing.{" "}
				<Link
					href="/subscription"
					className="text-blue-500 hover:underline"
				>
					Go back to plans
				</Link>
				.
			</div>
		);
	}

	if (!isValidCheckout) {
		return (
			<div className="container mx-auto p-8 text-center">
				Invalid plan or seat plan selected.{" "}
				<Link
					href="/subscription"
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
						{selectedPlan!.name}
					</h1>
					<p className="text-slate-600 dark:text-slate-400 mb-2">
						{selectedPlan!.description}
					</p>
					<Button
						variant="outline"
						size="sm"
						asChild
						className="mt-1 mb-2 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-400/10"
					>
						<Link href="/subscription">Change plan</Link>
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
							{billingOptions.map((option) => (
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
							Team Size
						</h2>
						<p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
							Your selected employee range
						</p>
						<div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
							<p className="font-medium text-slate-700 dark:text-slate-200">
								{selectedSeatPlan!.min_employees} -{" "}
								{selectedSeatPlan!.max_employees} Employees
							</p>
						</div>
					</div>

					{/* Display Features */}
					{selectedPlan!.features &&
						selectedPlan!.features.length > 0 && (
							<div className="mt-8">
								<h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">
									Included Features
								</h2>
								<ul className="space-y-2">
									{selectedPlan!.features.map((feature) => (
										<li
											key={feature.id}
											className="flex items-start space-x-2"
										>
											<div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
											<div>
												<p className="font-medium text-slate-700 dark:text-slate-200">
													{feature.name}
												</p>
												{feature.description && (
													<p className="text-sm text-slate-500 dark:text-slate-400">
														{feature.description}
													</p>
												)}
											</div>
										</li>
									))}
								</ul>
							</div>
						)}
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
							{selectedPlan!.name}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Billing Period:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{selectedBillingOption?.label || "N/A"}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Team Size:
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{selectedSeatPlan!.min_employees}-
							{selectedSeatPlan!.max_employees}
						</span>
					</div>
					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							Price:
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
							Total:
						</span>
						<span className="text-slate-800 dark:text-slate-100">
							{formatCurrency(totalAtRenewal)}
						</span>
					</div>

					<Button
						size="lg"
						className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3"
					>
						Continue to Payment
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	return (
		<Suspense fallback={<CheckoutPageSkeleton />}>
			<CheckoutPageContent />
		</Suspense>
	);
}
