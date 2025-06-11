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
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: InitiatePaidCheckoutRequest) =>
			subscriptionService.initiatePaidCheckout(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};

export const useCompleteTrialCheckout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: CompleteTrialCheckoutRequest) =>
			subscriptionService.completeTrialCheckout(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data
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
			// Invalidate user subscription query to refresh data
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
	});
};

export const useChangeSubscriptionPlan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: UpgradeSubscriptionPlanRequest) =>
			subscriptionService.changeSubscriptionPlan(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};

export const usePreviewSeatPlanChange = () => {
	return useMutation({
		mutationFn: (request: ChangeSeatPlanRequest) =>
			subscriptionService.previewSeatPlanChange(request),
	});
};

export const useChangeSeatPlan = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ChangeSeatPlanRequest) =>
			subscriptionService.changeSeatPlan(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};

export const useConvertTrialToPaid = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (request: ConvertTrialToPaidRequest) =>
			subscriptionService.convertTrialToPaid(request),
		onSuccess: () => {
			// Invalidate user subscription query to refresh data
			queryClient.invalidateQueries({
				queryKey: queryKeys.subscription.userSubscription,
			});
		},
	});
};
