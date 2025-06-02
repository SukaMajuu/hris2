import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
	useSubscriptionPlans,
	useUserSubscription,
	useSeatPlans,
} from "@/api/queries/subscription.queries";
import { SeatTier } from "../_components/SeatTierCardComponent";

export const useSubscription = () => {
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

	// Event handlers
	const handleSelectPlan = (planId: number) => {
		setSelectedPlanId(planId);
		setActiveView("seat");
	};

	const handleSelectSeatTier = (planId: number, seatPlanId: number) => {
		router.push(
			`/subscription/checkout?planId=${planId}&seatPlanId=${seatPlanId}`
		);
	};

	const handleViewChange = (view: "package" | "seat") => {
		setActiveView(view);
		if (view === "package") {
			setSelectedPlanId(null);
		}
	};

	// Transform seat plans data for UI
	const transformedSeatTiers: SeatTier[] = useMemo(() => {
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

	// Computed values
	const isLoading = isLoadingPlans || isLoadingUserSubscription;
	const hasError = plansError || userSubscriptionError;
	const selectedPlanName =
		subscriptionPlans?.find((p) => p.id === selectedPlanId)?.name || "";

	return {
		// State
		activeView,
		selectedPlanId,

		// Data
		subscriptionPlans,
		userSubscription,
		transformedSeatTiers,
		selectedPlanName,

		// Loading states
		isLoading,
		isLoadingSeatPlans,
		hasError,
		seatPlansError,

		// Event handlers
		handleSelectPlan,
		handleSelectSeatTier,
		handleViewChange,
	};
};
