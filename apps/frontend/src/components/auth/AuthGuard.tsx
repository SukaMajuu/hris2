"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import FullPageLoader from "@/components/ui/full-page-loader";
import { useAuthStore } from "@/stores/auth.store";

// Pages that don't require authentication
const PUBLIC_PAGES = [
	"/",
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/login/id-employee",
	"/check-email",
	"/link-expired",
	"/auth/callback",
	"/welcome", // Welcome page for onboarding after registration
];

interface AuthGuardProps {
	children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isAuthStoreLoading = useAuthStore((state) => state.isLoading);
	const isPasswordRecovery = useAuthStore(
		(state) => state.isPasswordRecovery
	);
	const router = useRouter();
	const pathname = usePathname();

	const isPublicPage = PUBLIC_PAGES.includes(pathname);
	const isCallbackPage = pathname === "/auth/callback";

	useEffect(() => {
		if (isCallbackPage) {
			return;
		}

		if (isAuthStoreLoading) {
			return;
		}

		if (pathname === "/" && !isAuthenticated) {
			return;
		}

		if (isPasswordRecovery && pathname === "/reset-password") {
			return;
		}

		if (
			isAuthenticated &&
			isPublicPage &&
			pathname !== "/" &&
			pathname !== "/welcome" &&
			!isCallbackPage
		) {
			router.replace("/dashboard");
			return;
		}

		if (!isAuthenticated && !isPublicPage && !isCallbackPage) {
			router.replace("/login");
			
		}
	}, [
		isAuthStoreLoading,
		isAuthenticated,
		isPublicPage,
		isPasswordRecovery,
		router,
		pathname,
		isCallbackPage,
	]);

	if (isCallbackPage) {
		return <>{children}</>;
	}

	if (isAuthStoreLoading) {
		return <FullPageLoader />;
	}

	if (
		isAuthenticated &&
		isPublicPage &&
		pathname !== "/" &&
		pathname !== "/welcome" &&
		!isCallbackPage &&
		!(isPasswordRecovery && pathname === "/reset-password")
	) {
		return <FullPageLoader />;
	}

	if (!isAuthenticated && !isPublicPage && !isCallbackPage) {
		return <FullPageLoader />;
	}

	return <>{children}</>;
}
