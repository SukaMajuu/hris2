"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/full-page-loader";

// Pages that don't require authentication
const PUBLIC_PAGES = [
	"/",
	"/landing-page",
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/login/id-employee",
	"/check-email",
	"/link-expired",
	"/auth/callback",
];

interface AuthGuardProps {
	children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
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
			!isCallbackPage
		) {
			router.replace("/dashboard");
			return;
		}

		if (!isAuthenticated && !isPublicPage && !isCallbackPage) {
			router.replace("/login");
			return;
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
