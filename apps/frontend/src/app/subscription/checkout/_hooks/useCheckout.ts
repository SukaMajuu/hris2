import { useState, useMemo } from "react";
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

	// Subscription change mutations
	const changePlanMutation = useChangeSubscriptionPlan();
	const changeSeatMutation = useChangeSeatPlan();
	const convertTrialMutation = useConvertTrialToPaid();

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

		if (isTrialConversion) return { type: "trial_conversion" };

		if (isUpgrade) {
			const currentPlan = userSubscription.subscription_plan;
			const currentSeatPlan = userSubscription.seat_plan;

			// Determine if it's a plan change or seat change
			if (
				currentPlan &&
				selectedPlan &&
				currentPlan.id !== selectedPlan.id
			) {
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
		}

		return { type: "new_subscription" };
	}, [
		userSubscription,
		isTrialConversion,
		isUpgrade,
		selectedPlan,
		selectedSeatPlan,
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
		// Use preset amount if available (for upgrades/downgrades), otherwise calculate from selected options
		const pricePerUser =
			presetAmount || Number(selectedBillingOption?.pricePerUser || 0);
		const subtotal = pricePerUser;
		const taxAmount = subtotal * taxRate;
		const totalAtRenewal = subtotal + taxAmount;

		return {
			pricePerUser,
			subtotal,
			taxAmount,
			totalAtRenewal,
		};
	}, [selectedBillingOption, taxRate, presetAmount]);

	// Validation
	const isValidCheckout = useMemo(() => {
		return planId && seatPlanId && selectedPlan && selectedSeatPlan;
	}, [planId, seatPlanId, selectedPlan, selectedSeatPlan]);

	// Loading and error states
	const isLoading =
		isLoadingPlans || isLoadingSeatPlans || isLoadingUserSubscription;
	const hasError = plansError || seatPlansError;

	// Function to handle subscription changes
	const processSubscriptionChange = async () => {
		if (!selectedBillingOption || !planId || !seatPlanId) {
			throw new Error("Missing required checkout information");
		}

		const isMonthly = selectedBillingOption.id === "monthly";

		try {
			// Handle different change scenarios
			if (isTrialConversion) {
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
