import { useQuery } from "@tanstack/react-query";

import { subscriptionService } from "@/services/subscription.service";

import { queryKeys } from "../query-keys";

export const useSubscriptionPlans = () => useQuery({
		queryKey: queryKeys.subscription.plans,
		queryFn: () => subscriptionService.getSubscriptionPlans(),
	});

export const useSeatPlans = (subscriptionPlanId: number) => useQuery({
		queryKey: queryKeys.subscription.seatPlans(subscriptionPlanId),
		queryFn: () => subscriptionService.getSeatPlans(subscriptionPlanId),
		enabled: !!subscriptionPlanId,
	});

export const useUserSubscription = () => useQuery({
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
		enabled: true,
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

export const useCheckoutSession = (sessionId: string) => useQuery({
		queryKey: queryKeys.subscription.checkoutSession(sessionId),
		queryFn: () => subscriptionService.getCheckoutSession(sessionId),
		enabled: !!sessionId,
	});
