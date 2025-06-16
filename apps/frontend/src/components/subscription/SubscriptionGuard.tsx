"use client";

import { AlertCircle, LogOut } from "lucide-react";
import { useRouter , usePathname , redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useLogout } from "@/app/(auth)/logout/useLogout";
import { Button } from "@/components/ui/button";
import FullPageLoader from "@/components/ui/full-page-loader";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

interface SubscriptionGuardProps {
	children: React.ReactNode;
	adminRedirectTo?: string;
	showToast?: boolean;
}

export const SubscriptionGuard = ({
	children,
	adminRedirectTo = "/subscription",
	showToast = true,
}: SubscriptionGuardProps) => {
	const router = useRouter();
	const { logout, isLoading: isLoggingOut } = useLogout();
	const pathname = usePathname();

	const {
		hasActiveSubscription,
		isLoading,
		isAdmin,
		userSubscription,
		isFetchingSubscription,
		isNewUser,
		isEligibleForTrial,
	} = useSubscriptionStatus();

	useEffect(() => {
		if (isLoading) {
			return;
		}

		if (
			isAdmin &&
			!hasActiveSubscription &&
			!isFetchingSubscription &&
			!isNewUser
		) {
			if (
				userSubscription === null ||
				(userSubscription && !hasActiveSubscription)
			) {
				if (showToast) {
					toast.error(
						"Active subscription required to access admin features."
					);
				}
				router.replace(adminRedirectTo);
			}
		}
	}, [
		isFetchingSubscription,
		hasActiveSubscription,
		isLoading,
		isAdmin,
		userSubscription,
		router,
		adminRedirectTo,
		showToast,
		isNewUser,
	]);

	if (isLoading) {
		return <FullPageLoader />;
	}

	if (pathname === "/subscription" || pathname === "/welcome") {
		return <>{children}</>;
	}

	if (
		isAdmin &&
		(isNewUser || isEligibleForTrial) &&
		pathname !== "/subscription"
	) {
		redirect("/welcome");
	}

	if (isAdmin && !hasActiveSubscription) {
		redirect("/subscription");
	}

	if (!isAdmin && !hasActiveSubscription && userSubscription !== undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
				<div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 text-center">
					<div className="mb-6">
						<AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
						<h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
							Subscription Expired
						</h1>
						<p className="text-slate-600 dark:text-slate-400 leading-relaxed">
							Your organization&apos;s subscription has expired.
							Please contact your administrator to renew the
							subscription and regain access to the system.
						</p>
					</div>

					<div className="space-y-4">
						<div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
							<p className="text-sm text-slate-700 dark:text-slate-300">
								<strong>Need help?</strong>
								<br />
								Contact your system administrator for
								subscription renewal.
							</p>
						</div>

						<Button
							onClick={logout}
							disabled={isLoggingOut}
							variant="outline"
							className="w-full"
						>
							<LogOut className="h-4 w-4 mr-2" />
							{isLoggingOut ? "Logging out..." : "Logout"}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return <>{children}</>;
}
