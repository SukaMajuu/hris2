import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
	useSubscriptionPlans,
	useSeatPlans,
	useUserSubscription,
} from "@/api/queries/subscription.queries";
import {
	useChangeSubscriptionPlan,
	useChangeSeatPlan,
	useConvertTrialToPaid,
	usePreviewSubscriptionPlanChange,
	usePreviewSeatPlanChange,
} from "@/api/mutations/subscription.mutation";
import {
	UpgradeSubscriptionPlanRequest,
	ChangeSeatPlanRequest,
	ConvertTrialToPaidRequest,
} from "@/types/subscription";

interface BillingOption {
	id: string;
	label: string;
	pricePerUser: number;
	type: "yearly" | "monthly";
	suffix: string;
}

export const useCheckout = () => {
	const searchParams = useSearchParams();
	const planIdParam = searchParams.get("planId");
	const seatPlanIdParam = searchParams.get("seatPlanId");
	const isMonthlyParam = searchParams.get("isMonthly");
	const upgradeParam = searchParams.get("upgrade");
	const trialConversionParam = searchParams.get("trial_conversion");
	const amountParam = searchParams.get("amount");

	const planId = planIdParam ? parseInt(planIdParam) : null;
	const seatPlanId = seatPlanIdParam ? parseInt(seatPlanIdParam) : null;
	const isUpgrade = upgradeParam === "true";
	const isTrialConversion = trialConversionParam === "true";
	const presetAmount = amountParam ? parseFloat(amountParam) : null;

	// Default billing option based on URL param or monthly
	const defaultBillingOption =
		isMonthlyParam === "false" ? "yearly" : "monthly";

	const [selectedBillingOptionId, setSelectedBillingOptionId] = useState(
		defaultBillingOption
	);
	const [taxRate] = useState(0.0);

	// State for calculated proration amounts
	const [calculatedAmount, setCalculatedAmount] = useState<number | null>(
		null
	);
	const [isCalculatingAmount, setIsCalculatingAmount] = useState(false);
	const [calculationError, setCalculationError] = useState<string | null>(
		null
	);

	// Track calculation for different billing periods
	const [calculatedAmounts, setCalculatedAmounts] = useState<{
		monthly?: number | null;
		yearly?: number | null;
	}>({});

	// Subscription change mutations
	const changePlanMutation = useChangeSubscriptionPlan();
	const changeSeatMutation = useChangeSeatPlan();
	const convertTrialMutation = useConvertTrialToPaid();

	// Preview mutations for auto-calculation
	const previewPlanMutation = usePreviewSubscriptionPlanChange();
	const previewSeatMutation = usePreviewSeatPlanChange();

	// API calls
	const {
		data: subscriptionPlans,
		isLoading: isLoadingPlans,
		error: plansError,
	} = useSubscriptionPlans();

	const {
		data: seatPlans,
		isLoading: isLoadingSeatPlans,
		error: seatPlansError,
	} = useSeatPlans(planId || 0);

	const {
		data: userSubscription,
		isLoading: isLoadingUserSubscription,
	} = useUserSubscription();

	// Find selected plan and seat plan
	const selectedPlan = useMemo(() => {
		return subscriptionPlans?.find((plan) => plan.id === planId);
	}, [subscriptionPlans, planId]);

	const selectedSeatPlan = useMemo(() => {
		return seatPlans?.find((seatPlan) => seatPlan.id === seatPlanId);
	}, [seatPlans, seatPlanId]);

	// Determine change type and current subscription info
	const changeContext = useMemo(() => {
		if (!userSubscription) return { type: "new_subscription" };

		// SAFEGUARD: If user has an active subscription, never treat it as trial conversion
		// even if URL incorrectly contains trial_conversion=true
		const hasActiveSubscription = userSubscription.status === "active";
		const isActualTrialConversion =
			isTrialConversion && userSubscription.is_in_trial;

		if (isActualTrialConversion) return { type: "trial_conversion" };

		// Check for changes regardless of upgrade/downgrade status
		const currentPlan = userSubscription.subscription_plan;
		const currentSeatPlan = userSubscription.seat_plan;

		// Determine if it's a plan change or seat change
		if (currentPlan && selectedPlan && currentPlan.id !== selectedPlan.id) {
			return {
				type: "plan_change",
				isUpgrade: selectedPlan.id > currentPlan.id,
				currentPlan,
				newPlan: selectedPlan,
			};
		}

		if (
			currentSeatPlan &&
			selectedSeatPlan &&
			currentSeatPlan.id !== selectedSeatPlan.id
		) {
			return {
				type: "seat_change",
				isUpgrade:
					selectedSeatPlan.max_employees >
					currentSeatPlan.max_employees,
				currentSeatPlan,
				newSeatPlan: selectedSeatPlan,
			};
		}

		return { type: "new_subscription" };
	}, [userSubscription, isTrialConversion, selectedPlan, selectedSeatPlan]);

	// Auto-calculate prorated amount for changes without preset amount
	// REMOVED: This was causing unnecessary refetches when billing period changes
	// Instead, we'll use local calculation for billing period changes

	// Generate billing options based on selected seat plan
	const billingOptions: BillingOption[] = useMemo(() => {
		if (!selectedSeatPlan) return [];

		return [
			{
				id: "monthly",
				label: "Monthly",
				pricePerUser: Number(selectedSeatPlan.price_per_month),
				type: "monthly" as const,
				suffix: "/ Month",
			},
			{
				id: "yearly",
				label: "Yearly",
				pricePerUser: Number(selectedSeatPlan.price_per_year),
				type: "yearly" as const,
				suffix: "/ Year",
			},
		];
	}, [selectedSeatPlan]);

	// Selected billing option
	const selectedBillingOption = useMemo(() => {
		return billingOptions.find((bo) => bo.id === selectedBillingOptionId);
	}, [billingOptions, selectedBillingOptionId]);

	// Price calculations
	const priceCalculations = useMemo(() => {
		const basePrice = Number(selectedBillingOption?.pricePerUser || 0);

		// For preset amounts (from URL), always use them regardless of billing period
		if (presetAmount !== null) {
			const pricePerUser = presetAmount;
			const subtotal = pricePerUser;
			const taxAmount = subtotal * taxRate;
			const totalAtRenewal = subtotal + taxAmount;

			return {
				pricePerUser,
				subtotal,
				taxAmount,
				totalAtRenewal,
				basePrice,
				isUpgradeAmount: true,
			};
		}

		// For plan/seat changes, use calculated proration amount if available
		if (
			(changeContext.type === "plan_change" ||
				changeContext.type === "seat_change") &&
			calculatedAmount !== null
		) {
			const pricePerUser = calculatedAmount;
			const subtotal = pricePerUser;
			const taxAmount = subtotal * taxRate;
			const totalAtRenewal = subtotal + taxAmount;

			return {
				pricePerUser,
				subtotal,
				taxAmount,
				totalAtRenewal,
				basePrice,
				isUpgradeAmount: true, // This is upgrade/change amount
			};
		}

		// For new subscriptions and trial conversions, use full price based on billing period
		const pricePerUser = basePrice;
		const subtotal = pricePerUser;
		const taxAmount = subtotal * taxRate;
		const totalAtRenewal = subtotal + taxAmount;

		return {
			pricePerUser,
			subtotal,
			taxAmount,
			totalAtRenewal,
			basePrice,
			isUpgradeAmount: false, // This is full price
		};
	}, [
		selectedBillingOption,
		taxRate,
		presetAmount,
		calculatedAmount,
		changeContext.type,
	]);

	// Validation
	const isValidCheckout = useMemo(() => {
		return planId && seatPlanId && selectedPlan && selectedSeatPlan;
	}, [planId, seatPlanId, selectedPlan, selectedSeatPlan]);

	// Loading and error states
	const isLoading =
		isLoadingPlans ||
		isLoadingSeatPlans ||
		isLoadingUserSubscription ||
		isCalculatingAmount;
	const hasError = plansError || seatPlansError;

	// Function to handle subscription changes
	const processSubscriptionChange = async () => {
		if (!selectedBillingOption || !planId || !seatPlanId) {
			throw new Error("Missing required checkout information");
		}

		const isMonthly = selectedBillingOption.id === "monthly";

		try {
			// SAFEGUARD: Prevent trial conversion API for active subscriptions
			const isActualTrialConversion =
				isTrialConversion && userSubscription?.is_in_trial;

			// Handle different change scenarios
			if (isActualTrialConversion) {
				// Trial conversion
				const request: ConvertTrialToPaidRequest = {
					subscription_plan_id: planId,
					seat_plan_id: seatPlanId,
					is_monthly: isMonthly,
				};
				return await convertTrialMutation.mutateAsync(request);
			}

			if (changeContext.type === "plan_change") {
				// Plan upgrade/downgrade
				const request: UpgradeSubscriptionPlanRequest = {
					new_subscription_plan_id: planId,
					new_seat_plan_id: seatPlanId,
					is_monthly: isMonthly,
				};
				return await changePlanMutation.mutateAsync(request);
			}

			if (changeContext.type === "seat_change") {
				// Seat tier change
				const request: ChangeSeatPlanRequest = {
					new_seat_plan_id: seatPlanId,
					is_monthly: isMonthly,
				};
				return await changeSeatMutation.mutateAsync(request);
			}

			// For new subscriptions, return null (handled by payment flow)
			return null;
		} catch (error) {
			console.error("Subscription change error:", error);
			throw error;
		}
	};

	// Smart auto-calculation that caches results for both billing periods
	useEffect(() => {
		const shouldCalculateAmount =
			!presetAmount && // No preset amount in URL
			!isTrialConversion && // Not a trial conversion
			changeContext.type !== "new_subscription" && // Not a new subscription
			planId &&
			seatPlanId && // Have required IDs
			!isCalculatingAmount && // Not already calculating
			userSubscription && // Have user subscription data
			// Only calculate if we don't have cached results for both periods
			(calculatedAmounts.monthly === undefined ||
				calculatedAmounts.yearly === undefined);

		if (shouldCalculateAmount) {
			setIsCalculatingAmount(true);
			setCalculationError(null);

			const calculateBothPeriods = async () => {
				try {
					const results: {
						monthly?: number | null;
						yearly?: number | null;
					} = {};

					// Calculate for both monthly and yearly
					for (const isMonthly of [true, false]) {
						const periodKey = isMonthly ? "monthly" : "yearly";

						// Skip if we already have this period calculated
						if (calculatedAmounts[periodKey] !== undefined) {
							results[periodKey] = calculatedAmounts[periodKey];
							continue;
						}

						try {
							if (changeContext.type === "plan_change") {
								const request: UpgradeSubscriptionPlanRequest = {
									new_subscription_plan_id: planId,
									new_seat_plan_id: seatPlanId,
									is_monthly: isMonthly,
								};
								const response = await previewPlanMutation.mutateAsync(
									request
								);

								if (
									response.requires_payment &&
									response.proration_amount !== undefined
								) {
									results[periodKey] = Number(
										response.proration_amount
									);
								} else {
									results[periodKey] = 0;
								}
							} else if (changeContext.type === "seat_change") {
								const request: ChangeSeatPlanRequest = {
									new_seat_plan_id: seatPlanId,
									is_monthly: isMonthly,
								};
								const response = await previewSeatMutation.mutateAsync(
									request
								);

								if (
									response.requires_payment &&
									response.proration_amount !== undefined
								) {
									results[periodKey] = Number(
										response.proration_amount
									);
								} else {
									results[periodKey] = 0;
								}
							}
						} catch (error) {
							console.error(
								`Failed to calculate ${periodKey} amount:`,
								error
							);
							results[periodKey] = null; // Mark as failed
						}
					}

					// Update cached amounts
					setCalculatedAmounts((prev) => ({ ...prev, ...results }));

					// Set current calculated amount based on selected billing period
					const currentPeriod =
						selectedBillingOptionId === "monthly"
							? "monthly"
							: "yearly";
					setCalculatedAmount(results[currentPeriod] ?? null);
				} catch (error) {
					console.error("Failed to auto-calculate amounts:", error);
					const errorMessage =
						error instanceof Error
							? error.message
							: "Unknown error";
					setCalculationError(errorMessage);
				} finally {
					setIsCalculatingAmount(false);
				}
			};

			calculateBothPeriods();
		}
	}, [
		presetAmount,
		isTrialConversion,
		changeContext.type,
		planId,
		seatPlanId,
		isCalculatingAmount,
		userSubscription,
		calculatedAmounts.monthly,
		calculatedAmounts.yearly,
		previewPlanMutation,
		previewSeatMutation,
		calculatedAmounts,
		selectedBillingOptionId,
	]);

	// Update calculatedAmount when billing period changes (using cached values)
	useEffect(() => {
		if (
			calculatedAmounts.monthly !== undefined &&
			calculatedAmounts.yearly !== undefined
		) {
			const currentPeriod =
				selectedBillingOptionId === "monthly" ? "monthly" : "yearly";
			setCalculatedAmount(calculatedAmounts[currentPeriod] ?? null);
		}
	}, [selectedBillingOptionId, calculatedAmounts]);

	return {
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
		...priceCalculations,
		taxRate,

		// Validation
		isValidCheckout,

		// Loading and error states
		isLoading,
		hasError,
		plansError,
		seatPlansError,

		// Function to handle subscription changes
		processSubscriptionChange,
	};
};
