import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
	useSubscriptionPlans,
	useSeatPlans,
} from "@/api/queries/subscription.queries";

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

	const planId = planIdParam ? parseInt(planIdParam) : null;
	const seatPlanId = seatPlanIdParam ? parseInt(seatPlanIdParam) : null;

	const [selectedBillingOptionId, setSelectedBillingOptionId] = useState<
		string
	>("monthly");
	const [taxRate] = useState(0.0);

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

	// Find selected plan and seat plan
	const selectedPlan = useMemo(() => {
		return subscriptionPlans?.find((plan) => plan.id === planId);
	}, [subscriptionPlans, planId]);

	const selectedSeatPlan = useMemo(() => {
		return seatPlans?.find((seatPlan) => seatPlan.id === seatPlanId);
	}, [seatPlans, seatPlanId]);

	// Generate billing options based on selected seat plan
	const billingOptions: BillingOption[] = useMemo(() => {
		if (!selectedSeatPlan) return [];

		return [
			{
				id: "monthly",
				label: "Monthly",
				pricePerUser: selectedSeatPlan.price_per_month,
				type: "monthly",
				suffix: "/ Month",
			},
			{
				id: "yearly",
				label: "Yearly",
				pricePerUser: selectedSeatPlan.price_per_year,
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
		const pricePerUser = selectedBillingOption?.pricePerUser || 0;
		const subtotal = pricePerUser;
		const taxAmount = subtotal * taxRate;
		const totalAtRenewal = subtotal + taxAmount;

		return {
			pricePerUser,
			subtotal,
			taxAmount,
			totalAtRenewal,
		};
	}, [selectedBillingOption, taxRate]);

	// Validation
	const isValidCheckout = useMemo(() => {
		return planId && seatPlanId && selectedPlan && selectedSeatPlan;
	}, [planId, seatPlanId, selectedPlan, selectedSeatPlan]);

	// Loading and error states
	const isLoading = isLoadingPlans || isLoadingSeatPlans;
	const hasError = plansError || seatPlansError;

	return {
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
		...priceCalculations,
		taxRate,

		// Validation
		isValidCheckout,

		// Loading and error states
		isLoading,
		hasError,
		plansError,
		seatPlansError,
	};
};
