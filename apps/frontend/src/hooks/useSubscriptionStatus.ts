import { useUserSubscription } from "@/api/queries/subscription.queries";
import { useAuthStore } from "@/stores/auth.store";
import { ROLES, Role } from "@/const/role";

export function useSubscriptionStatus() {
	const user = useAuthStore((state) => state.user);
	const isAuthStoreLoading = useAuthStore((state) => state.isLoading);

	const {
		data: userSubscription,
		isLoading: isLoadingSubscription,
	} = useUserSubscription();

	const userRole = user?.role as Role | undefined;
	const isAdmin = userRole === ROLES.admin;

	const hasActiveSubscription =
		userSubscription?.subscription_plan &&
		(userSubscription?.status === "active" ||
			userSubscription?.status === "trial");

	const isLoading = isAuthStoreLoading || isLoadingSubscription;

	const shouldShowLayout = hasActiveSubscription;

	return {
		hasActiveSubscription,
		isLoading,
		isAdmin,
		shouldShowLayout,
		userSubscription,
		user,
	};
}
