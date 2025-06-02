import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../query-keys";
import { subscriptionService } from "@/services/subscription.service";

export const useSubscriptionPlans = () => {
	return useQuery({
		queryKey: queryKeys.subscription.plans,
		queryFn: () => subscriptionService.getSubscriptionPlans(),
	});
};

export const useSeatPlans = (subscriptionPlanId: number) => {
	return useQuery({
		queryKey: queryKeys.subscription.seatPlans(subscriptionPlanId),
		queryFn: () => subscriptionService.getSeatPlans(subscriptionPlanId),
		enabled: !!subscriptionPlanId,
	});
};

export const useUserSubscription = () => {
	return useQuery({
		queryKey: queryKeys.subscription.userSubscription,
		queryFn: async () => {
			try {
				return await subscriptionService.getUserSubscription();
			} catch (error) {
				const errorObj = error as {
					response?: { status?: number };
					status?: number;
				};
				if (
					errorObj?.response?.status === 404 ||
					errorObj?.status === 404
				) {
					return null;
				}
				throw error;
			}
		},
		retry: (failureCount, error: unknown) => {
			const errorObj = error as {
				response?: { status?: number };
				status?: number;
			};
			if (
				errorObj?.response?.status === 404 ||
				errorObj?.status === 404
			) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

export const useCheckoutSession = (sessionId: string) => {
	return useQuery({
		queryKey: queryKeys.subscription.checkoutSession(sessionId),
		queryFn: () => subscriptionService.getCheckoutSession(sessionId),
		enabled: !!sessionId,
	});
};
