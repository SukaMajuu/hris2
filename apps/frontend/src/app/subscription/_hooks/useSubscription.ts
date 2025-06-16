import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

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
	const [isDowngradeContext, setIsDowngradeContext] = useState(false);

	// API calls
	const {
		data: subscriptionPlans,
		isLoading: isLoadingPlans,
		error: plansError,
	} = useSubscriptionPlans();

	const {
		data: userSubscription,
		isLoading: isLoadingUserSubscription,
	} = useUserSubscription();

	const {
		data: seatPlans,
		isLoading: isLoadingSeatPlans,
		error: seatPlansError,
	} = useSeatPlans(selectedPlanId || 0);

	// Check for downgrade context from URL parameters (immediate) or sessionStorage (backup)
	useEffect(() => {
		const checkDowngradeContext = () => {
			// First check URL parameters for immediate detection
			const isDowngradeFromURL = searchParams.get("downgrade") === "true";
			const targetPlanId = searchParams.get("targetPlanId");
			const targetPlanName = searchParams.get("targetPlanName");

			if (isDowngradeFromURL && targetPlanId && targetPlanName) {
				setSelectedPlanId(parseInt(targetPlanId, 10));
				setActiveView("seat");
				setIsDowngradeContext(true);

				// Store in sessionStorage for consistency
				const downgradeData = {
					planId: parseInt(targetPlanId, 10),
					planName: targetPlanName,
					isDowngrade: true,
				};
				sessionStorage.setItem(
					"targetDowngradePlan",
					JSON.stringify(downgradeData)
				);

				// Clean up URL parameters to keep URL clean
				const currentUrl = new URL(window.location.href);
				currentUrl.searchParams.delete("downgrade");
				currentUrl.searchParams.delete("targetPlanId");
				currentUrl.searchParams.delete("targetPlanName");

				// Replace URL without page reload
				window.history.replaceState({}, "", currentUrl.toString());

				return; // Exit early since we found URL params
			}

			// Fallback to sessionStorage (for page refreshes or direct navigation)
			const stored = sessionStorage.getItem("targetDowngradePlan");

			if (stored) {
				try {
					const parsed = JSON.parse(stored);
					setSelectedPlanId(parsed.planId);
					setActiveView("seat");
					setIsDowngradeContext(true);
				} catch (error) {
					console.error(
						"Failed to parse downgrade context in useSubscription:",
						error
					);
				}
			} else {
				setIsDowngradeContext(false);
			}
		};

		checkDowngradeContext();
	}, [searchParams]); // Include searchParams in dependency array

	// Normal initialization logic
	useEffect(() => {
		// Skip normal initialization if we're in downgrade context
		if (isDowngradeContext) return;

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
	}, [initialStepQueryParam, userSubscription, isDowngradeContext]);

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
			// Clear downgrade context when going back to package view
			const stored = sessionStorage.getItem("targetDowngradePlan");
			if (stored) {
				sessionStorage.removeItem("targetDowngradePlan");
				setIsDowngradeContext(false);
			}
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
	const hasError = plansError;
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
