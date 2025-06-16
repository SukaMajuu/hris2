import { useUserSubscription } from "@/api/queries/subscription.queries";
import { ROLES, Role } from "@/const/role";
import { useAuthStore } from "@/stores/auth.store";

const useSubscriptionStatus = () => {
	const user = useAuthStore((state) => state.user);
	const isAuthStoreLoading = useAuthStore((state) => state.isLoading);
	const isNewUser = useAuthStore((state) => state.isNewUser);

	const {
		data: userSubscription,
		isLoading: isLoadingSubscription,
		isFetching: isFetchingSubscription,
	} = useUserSubscription();

	const userRole = user?.role as Role | undefined;
	const isAdmin = userRole === ROLES.admin;

	const hasActiveSubscription = Boolean(
		userSubscription?.subscription_plan &&
			(userSubscription?.status === "active" ||
				userSubscription?.status === "trial")
	);

	const isLoading = isAuthStoreLoading || isLoadingSubscription;

	// Check if user is eligible for trial (admin without subscription)
	// This covers both new users and existing users who haven't activated trial yet
	const isEligibleForTrial = Boolean(
		isAdmin && !hasActiveSubscription && userSubscription === null // No subscription found (404 response indicates eligible for trial)
	);

	// For new users or trial-eligible users, temporarily bypass subscription check
	const shouldShowLayout =
		hasActiveSubscription || isNewUser || isEligibleForTrial;

	return {
		hasActiveSubscription:
			hasActiveSubscription || isNewUser || isEligibleForTrial,
		isLoading,
		isAdmin,
		shouldShowLayout,
		userSubscription,
		user,
		isLoadingSubscription,
		isFetchingSubscription,
		isNewUser,
		isEligibleForTrial,
	};
};

export { useSubscriptionStatus };
