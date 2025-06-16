import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
	useChangeSeatPlan,
	useChangeSubscriptionPlan,
	useConvertTrialToPaid,
} from "@/api/mutations/subscription.mutation";
import {
	ChangeSeatPlanRequest,
	UpgradeSubscriptionPlanRequest,
	ConvertTrialToPaidRequest,
	SubscriptionChangeResponse,
} from "@/types/subscription.types";

export const useSubscriptionUpgrade = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const changePlanMutation = useChangeSubscriptionPlan();
	const changeSeatMutation = useChangeSeatPlan();
	const convertTrialMutation = useConvertTrialToPaid();

	const changePlan = async (
		request: UpgradeSubscriptionPlanRequest
	): Promise<SubscriptionChangeResponse | null> => {
		try {
			setIsLoading(true);
			const response = await changePlanMutation.mutateAsync(request);

			if (response.payment_required && response.payment_amount) {
				const params = new URLSearchParams({
					planId: request.new_subscription_plan_id.toString(),
					seatPlanId:
						response.checkout_session?.seat_plan_id?.toString() ||
						"1",
					isMonthly: request.is_monthly.toString(),
					amount: response.payment_amount.toString(),
					upgrade: "true",
				});

				router.push(`/subscription/checkout?${params.toString()}`);
				toast.success(
					"Redirecting to checkout to complete the change..."
				);
			} else {
				toast.success(response.message || "Plan changed successfully!");
			}

			return response;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to change plan";
			toast.error(errorMessage);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const changeSeat = async (
		request: ChangeSeatPlanRequest
	): Promise<SubscriptionChangeResponse | null> => {
		try {
			setIsLoading(true);
			const response = await changeSeatMutation.mutateAsync(request);

			if (response.payment_required && response.payment_amount) {
				const params = new URLSearchParams({
					planId:
						response.subscription?.subscription_plan?.id?.toString() ||
						response.checkout_session?.subscription_plan_id?.toString() ||
						"2", // Use plan ID 2 (Premium) as fallback
					seatPlanId: request.new_seat_plan_id.toString(),
					isMonthly: request.is_monthly.toString(),
					amount: response.payment_amount.toString(),
					upgrade: "true",
				});

				router.push(`/subscription/checkout?${params.toString()}`);
				toast.success(
					"Redirecting to checkout to complete the upgrade..."
				);
			} else {
				toast.success(
					response.message || "Seat plan changed successfully!"
				);
			}

			return response;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to change seat plan";
			toast.error(errorMessage);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	const convertTrial = async (
		request: ConvertTrialToPaidRequest
	): Promise<SubscriptionChangeResponse | null> => {
		try {
			setIsLoading(true);
			const response = await convertTrialMutation.mutateAsync(request);

			if (response.payment_required && response.payment_amount) {
				// Redirect to checkout for payment
				const params = new URLSearchParams({
					planId: request.subscription_plan_id?.toString() || "1",
					seatPlanId: request.seat_plan_id?.toString() || "1",
					isMonthly: request.is_monthly.toString(),
					amount: response.payment_amount.toString(),
					trial_conversion: "true",
				});

				router.push(`/subscription/checkout?${params.toString()}`);
				toast.success(
					"Redirecting to checkout to complete the conversion..."
				);
			} else {
				toast.success(
					response.message || "Trial converted successfully!"
				);
			}

			return response;
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to convert trial";
			toast.error(errorMessage);
			return null;
		} finally {
			setIsLoading(false);
		}
	};

	// Quick redirect helpers for components that want to go straight to checkout
	const redirectToUpgrade = (
		planId: number,
		seatPlanId: number,
		isMonthly: boolean = true
	) => {
		const params = new URLSearchParams({
			planId: planId.toString(),
			seatPlanId: seatPlanId.toString(),
			isMonthly: isMonthly.toString(),
			upgrade: "true",
		});

		router.push(`/subscription/checkout?${params.toString()}`);
	};

	const redirectToTrialConversion = (
		planId: number,
		seatPlanId: number,
		isMonthly: boolean = true
	) => {
		const params = new URLSearchParams({
			planId: planId.toString(),
			seatPlanId: seatPlanId.toString(),
			isMonthly: isMonthly.toString(),
			trial_conversion: "true",
		});

		router.push(`/subscription/checkout?${params.toString()}`);
	};

	return {
		isLoading,
		changePlan,
		changeSeat,
		convertTrial,
		redirectToUpgrade,
		redirectToTrialConversion,
	};
};
