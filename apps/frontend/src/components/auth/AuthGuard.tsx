"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/full-page-loader";

// Pages that don't require authentication
const PUBLIC_PAGES = [
	"/", // Root path for password recovery redirects
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/login/id-employee",
	"/check-email",
	"/link-expired",
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

	useEffect(() => {
		if (isAuthStoreLoading) {
			return;
		}

		if (pathname === "/" && !isAuthenticated) {
			return;
		}

		if (isPasswordRecovery && pathname === "/reset-password") {
			return;
		}

		if (isAuthenticated && isPublicPage && pathname !== "/") {
			router.replace("/dashboard");
			return;
		}

		if (!isAuthenticated && !isPublicPage) {
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
	]);

	if (isAuthStoreLoading) {
		return <FullPageLoader />;
	}

	if (
		isAuthenticated &&
		isPublicPage &&
		pathname !== "/" &&
		!(isPasswordRecovery && pathname === "/reset-password")
	) {
		return <FullPageLoader />;
	}

	if (!isAuthenticated && !isPublicPage) {
		return <FullPageLoader />;
	}

	return <>{children}</>;
}
