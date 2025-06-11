"use client";

import React, { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { useCheckout } from "./_hooks/useCheckout";
import CheckoutPageSkeleton from "./_components/CheckoutPageSkeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formatCurrency = (value: number) => {
	// Format Indonesian Rupiah without locale-specific issues
	return `Rp ${value.toLocaleString("en-US")}`;
};

function CheckoutPageContent() {
	const router = useRouter();
	const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

	const {
		// URL Parameters
		planId,
		seatPlanId,
		isUpgrade,
		isTrialConversion,
		presetAmount,

		// Selected data
		selectedPlan,
		selectedSeatPlan,
		selectedBillingOption,
		userSubscription,

		// Change context
		changeContext,

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

		// Additional pricing context
		basePrice,
		isUpgradeAmount,

		// Validation
		isValidCheckout,

		// Loading and error states
		isLoading,
		hasError,

		// Subscription change handler
		processSubscriptionChange,
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

	const handleContinueToPayment = async () => {
		if (isProcessingCheckout) return;

		setIsProcessingCheckout(true);

		try {
			if (
				presetAmount &&
				(isUpgrade ||
					isTrialConversion ||
					changeContext.type === "plan_change" ||
					changeContext.type === "seat_change")
			) {
				const isMonthly = selectedBillingOption?.id === "monthly";
				const params = new URLSearchParams({
					planId: planId.toString(),
					seatPlanId: seatPlanId.toString(),
					isMonthly: isMonthly.toString(),
					amount: presetAmount.toString(),
				});

				// Add context flags
				if (isUpgrade) params.set("upgrade", "true");
				if (isTrialConversion) params.set("trial_conversion", "true");

				router.push(`/payment/process?${params.toString()}`);
				return;
			}

			if (changeContext.type !== "new_subscription") {
				const response = await processSubscriptionChange();

				if (response?.payment_required) {
					if (response.checkout_session?.payment_url) {
						window.location.href =
							response.checkout_session.payment_url;
						return;
					}

					const params = new URLSearchParams({
						planId: planId.toString(),
						seatPlanId: seatPlanId.toString(),
						isMonthly: (
							selectedBillingOption?.id === "monthly"
						).toString(),
						amount:
							response.payment_amount?.toString() ||
							totalAtRenewal.toString(),
					});

					if (isUpgrade) params.set("upgrade", "true");
					if (isTrialConversion)
						params.set("trial_conversion", "true");

					router.push(`/payment/process?${params.toString()}`);
					return;
				} else {
					toast.success(
						response?.message ||
							"Subscription updated successfully!"
					);
					router.push("/subscription?updated=true");
					return;
				}
			}

			const isMonthly = selectedBillingOption?.id === "monthly";
			const params = new URLSearchParams({
				planId: planId.toString(),
				seatPlanId: seatPlanId.toString(),
				isMonthly: isMonthly.toString(),
				amount: totalAtRenewal.toString(),
			});

			router.push(`/payment/process?${params.toString()}`);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to process subscription change. Please try again."
			);
		} finally {
			setIsProcessingCheckout(false);
		}
	};

	const getPageTitle = () => {
		switch (changeContext.type) {
			case "trial_conversion":
				return "Convert Trial to Paid Plan";
			case "plan_change":
				return changeContext.isUpgrade
					? "Upgrade Your Plan"
					: "Downgrade Your Plan";
			case "seat_change":
				return changeContext.isUpgrade
					? "Upgrade Team Size"
					: "Downgrade Team Size";
			default:
				return "Complete Your Subscription";
		}
	};

	const getPageDescription = () => {
		switch (changeContext.type) {
			case "trial_conversion":
				return "Convert your trial to a paid subscription to continue using all features.";
			case "plan_change":
				if (changeContext.isUpgrade) {
					return `Upgrade from ${changeContext.currentPlan?.name} to ${changeContext.newPlan?.name} plan.`;
				}
				return `Downgrade from ${changeContext.currentPlan?.name} to ${changeContext.newPlan?.name} plan.`;
			case "seat_change":
				if (changeContext.isUpgrade) {
					return `Increase your team capacity from ${changeContext.currentSeatPlan?.max_employees} to ${changeContext.newSeatPlan?.max_employees} employees.`;
				}
				return `Reduce your team capacity from ${changeContext.currentSeatPlan?.max_employees} to ${changeContext.newSeatPlan?.max_employees} employees.`;
			default:
				return "Review your subscription details and complete your purchase.";
		}
	};

	const getButtonText = () => {
		switch (changeContext.type) {
			case "trial_conversion":
				return "Convert to Paid Plan";
			case "plan_change":
			case "seat_change":
				return "Complete Change";
			default:
				return "Continue to Payment";
		}
	};

	return (
		<div className="bg-slate-100 dark:bg-slate-950 p-4 md:p-8">
			<div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 items-start">
				<div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg">
					<h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
						{getPageTitle()}
					</h1>
					<p className="text-slate-600 dark:text-slate-400 mb-2">
						{getPageDescription()}
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
						{changeContext.type === "new_subscription"
							? "Order Summary"
							: "Change Summary"}
					</h2>

					{/* Show current subscription info for changes */}
					{(changeContext.type === "plan_change" ||
						changeContext.type === "seat_change" ||
						changeContext.type === "trial_conversion") &&
						userSubscription && (
							<div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
								<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
									Current Subscription
								</h3>
								<div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
									<div className="flex justify-between">
										<span>Plan:</span>
										<span>
											{
												userSubscription
													.subscription_plan?.name
											}
										</span>
									</div>
									<div className="flex justify-between">
										<span>Team Size:</span>
										<span>
											{
												userSubscription.seat_plan
													?.min_employees
											}
											-
											{
												userSubscription.seat_plan
													?.max_employees
											}
										</span>
									</div>
									{userSubscription.is_in_trial && (
										<div className="flex justify-between">
											<span>Status:</span>
											<span className="text-orange-600 dark:text-orange-400">
												Trial (
												{
													userSubscription.remaining_trial_days
												}{" "}
												days left)
											</span>
										</div>
									)}
								</div>
							</div>
						)}

					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							{changeContext.type === "new_subscription"
								? "Package:"
								: "New Package:"}
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
							{changeContext.type === "new_subscription"
								? "Team Size:"
								: "New Team Size:"}
						</span>
						<span className="font-medium text-slate-700 dark:text-slate-200">
							{selectedSeatPlan!.min_employees}-
							{selectedSeatPlan!.max_employees}
						</span>
					</div>

					{/* Show full plan price for reference when upgrading */}
					{isUpgradeAmount && (
						<div className="flex justify-between text-sm">
							<span className="text-slate-600 dark:text-slate-400">
								New Plan Price:
							</span>
							<span className="font-medium text-slate-700 dark:text-slate-200">
								{formatCurrency(basePrice)}
							</span>
						</div>
					)}

					<div className="flex justify-between text-sm">
						<span className="text-slate-600 dark:text-slate-400">
							{isUpgradeAmount
								? "Amount Due Today:"
								: presetAmount
								? "Change Amount:"
								: "Price:"}
						</span>
						<span
							className={`font-medium ${
								isUpgradeAmount
									? "text-green-600 dark:text-green-400"
									: "text-slate-700 dark:text-slate-200"
							}`}
						>
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
							{isUpgradeAmount ? "Total Due Today:" : "Total:"}
						</span>
						<span
							className={`${
								isUpgradeAmount
									? "text-green-600 dark:text-green-400"
									: "text-slate-800 dark:text-slate-100"
							}`}
						>
							{formatCurrency(totalAtRenewal)}
						</span>
					</div>

					{/* Show additional context for changes */}
					{changeContext.type !== "new_subscription" && (
						<div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
							{changeContext.type === "trial_conversion" && (
								<p>
									This will convert your trial to a paid
									subscription.
								</p>
							)}
							{(changeContext.type === "plan_change" ||
								changeContext.type === "seat_change") && (
								<>
									<p>
										Changes will be prorated and take effect
										immediately.
									</p>
									{isUpgradeAmount && (
										<p className="mt-1 text-green-600 dark:text-green-400">
											You're only paying the difference
											for the remaining billing period.
										</p>
									)}
								</>
							)}
						</div>
					)}

					<Button
						size="lg"
						className="w-full mt-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white text-base py-3 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={handleContinueToPayment}
						disabled={
							!selectedBillingOption || isProcessingCheckout
						}
					>
						{isProcessingCheckout ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Processing...
							</>
						) : (
							getButtonText()
						)}
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
