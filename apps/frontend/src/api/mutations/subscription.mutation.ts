import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription.service";
import { queryKeys } from "../query-keys";
import {
	InitiateTrialCheckoutRequest,
	InitiatePaidCheckoutRequest,
	CompleteTrialCheckoutRequest,
	UpgradeSubscriptionPlanRequest,
	ChangeSeatPlanRequest,
	ConvertTrialToPaidRequest,
} from "@/types/subscription";

export const useInitiateTrialCheckout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: InitiateTrialCheckoutRequest) =>
			subscriptionService.initiateTrialCheckout(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};

export const useInitiatePaidCheckout = () => {
	return useMutation({
		mutationFn: (request: InitiatePaidCheckoutRequest) =>
			subscriptionService.initiatePaidCheckout(request),
		// Don't invalidate subscription query on payment initiation
		// as it doesn't change subscription status
	});
};

export const useCompleteTrialCheckout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CompleteTrialCheckoutRequest) =>
			subscriptionService.completeTrialCheckout(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data after trial completion
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};

export const useActivateTrial = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => subscriptionService.activateTrial(),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data after trial activation
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};

// New upgrade/downgrade mutations

export const usePreviewSubscriptionPlanChange = () => {
	return useMutation({
		mutationFn: (request: UpgradeSubscriptionPlanRequest) =>
			subscriptionService.previewSubscriptionPlanChange(request),
		// Don't invalidate subscription query on preview as it doesn't change status
	});
};

export const useChangeSubscriptionPlan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: UpgradeSubscriptionPlanRequest) =>
			subscriptionService.changeSubscriptionPlan(request),
		onSuccess: (data) => {
			// Only invalidate if subscription was actually changed (no payment required)
			if (!data.payment_required) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.subscription.userSubscription,
				});
			}
		},
	});
};

export const usePreviewSeatPlanChange = () => {
	return useMutation({
		mutationFn: (request: ChangeSeatPlanRequest) =>
			subscriptionService.previewSeatPlanChange(request),
		// Don't invalidate subscription query on preview as it doesn't change status
	});
};

export const useChangeSeatPlan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ChangeSeatPlanRequest) =>
			subscriptionService.changeSeatPlan(request),
		onSuccess: (data) => {
			// Only invalidate if subscription was actually changed (no payment required)
			if (!data.payment_required) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.subscription.userSubscription,
				});
			}
		},
	});
};

export const useConvertTrialToPaid = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ConvertTrialToPaidRequest) =>
			subscriptionService.convertTrialToPaid(request),
		onSuccess: (data) => {
			// Only invalidate if subscription was actually changed (no payment required)
			if (!data.payment_required) {
				queryClient.invalidateQueries({
					queryKey: queryKeys.subscription.userSubscription,
				});
			}
		},
	});
};
