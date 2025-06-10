import { useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscription.service";
import { queryKeys } from "../query-keys";
import {
	InitiateTrialCheckoutRequest,
	InitiatePaidCheckoutRequest,
	CompleteTrialCheckoutRequest,
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
