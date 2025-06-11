import { useState, useMemo, useEffect } from "react";
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

	const [selectedBillingOptionId, setSelectedBillingOptionId] = useState<
		string
	>(defaultBillingOption);
	const [taxRate] = useState(0.0);
	const [calculatedAmount, setCalculatedAmount] = useState<number | null>(
		null
	);
	const [isCalculatingAmount, setIsCalculatingAmount] = useState(false);
	const [calculationError, setCalculationError] = useState<string | null>(
		null
	);

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
	useEffect(() => {
		const shouldCalculateAmount =
			!presetAmount && // No preset amount in URL
			!isTrialConversion && // Not a trial conversion
			changeContext.type !== "new_subscription" && // Not a new subscription
			planId &&
			seatPlanId && // Have required IDs
			!isCalculatingAmount && // Not already calculating
			calculatedAmount === null && // Haven't calculated yet
			calculationError === null && // No previous error
			userSubscription; // Have user subscription data

		if (shouldCalculateAmount) {
			console.log(
				"Auto-calculating prorated amount for:",
				changeContext.type
			);
			setIsCalculatingAmount(true);
			setCalculationError(null);

			const calculateAmount = async () => {
				try {
					const isMonthly = defaultBillingOption === "monthly";

					if (changeContext.type === "plan_change") {
						const request: UpgradeSubscriptionPlanRequest = {
							new_subscription_plan_id: planId,
							is_monthly: isMonthly,
						};
						const response = await previewPlanMutation.mutateAsync(
							request
						);
						console.log("Preview plan change response:", response);
						console.log(
							"Requires payment:",
							response.requires_payment
						);
						console.log(
							"Proration amount:",
							response.proration_amount
						);

						if (
							response.requires_payment &&
							response.proration_amount !== undefined
						) {
							setCalculatedAmount(
								Number(response.proration_amount)
							);
						} else {
							console.log("No payment required for this change");
							// Set to 0 if no payment is required
							setCalculatedAmount(0);
						}
					} else if (changeContext.type === "seat_change") {
						const request: ChangeSeatPlanRequest = {
							new_seat_plan_id: seatPlanId,
							is_monthly: isMonthly,
						};
						const response = await previewSeatMutation.mutateAsync(
							request
						);
						console.log("Preview seat change response:", response);
						console.log(
							"Requires payment:",
							response.requires_payment
						);
						console.log(
							"Proration amount:",
							response.proration_amount
						);

						if (
							response.requires_payment &&
							response.proration_amount !== undefined
						) {
							setCalculatedAmount(
								Number(response.proration_amount)
							);
						} else {
							console.log("No payment required for this change");
							// Set to 0 if no payment is required
							setCalculatedAmount(0);
						}
					}
				} catch (error) {
					console.error("Failed to auto-calculate amount:", error);
					const errorMessage =
						error instanceof Error
							? error.message
							: "Unknown error";
					setCalculationError(errorMessage);
					// On error, fallback to base price calculation
					setCalculatedAmount(null);
				} finally {
					setIsCalculatingAmount(false);
				}
			};

			calculateAmount();
		}
	}, [
		presetAmount,
		isTrialConversion,
		changeContext.type,
		planId,
		seatPlanId,
		isCalculatingAmount,
		calculatedAmount, // Add this to prevent recalculation
		calculationError, // Add this to prevent retry on error
		userSubscription,
		defaultBillingOption,
	]);

	// Generate billing options based on selected seat plan
	const billingOptions: BillingOption[] = useMemo(() => {
		if (!selectedSeatPlan) return [];

		return [
			{
				id: "monthly",
				label: "Monthly",
				pricePerUser: Number(selectedSeatPlan.price_per_month),
				type: "monthly",
				suffix: "/ Month",
			},
			{
				id: "yearly",
				label: "Yearly",
				pricePerUser: Number(selectedSeatPlan.price_per_year),
				type: "yearly",
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
		// Use preset amount if available, then calculated amount, then fallback to base price
		const basePrice = Number(selectedBillingOption?.pricePerUser || 0);
		const effectiveAmount = presetAmount ?? calculatedAmount ?? basePrice;
		const isUpgradeAmount =
			presetAmount !== null || calculatedAmount !== null;
		const pricePerUser = effectiveAmount;
		const subtotal = pricePerUser;
		const taxAmount = subtotal * taxRate;
		const totalAtRenewal = subtotal + taxAmount;

		return {
			pricePerUser,
			subtotal,
			taxAmount,
			totalAtRenewal,
			basePrice, // Full price of the new plan
			isUpgradeAmount, // Whether we're showing upgrade amount or full price
		};
	}, [selectedBillingOption, taxRate, presetAmount, calculatedAmount]);

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
