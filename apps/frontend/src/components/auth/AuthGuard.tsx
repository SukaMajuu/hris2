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
		console.log("[AuthGuard] State check:", {
			isAuthStoreLoading,
			isAuthenticated,
			isPasswordRecovery,
			pathname,
			isPublicPage,
		});

		if (isAuthStoreLoading) {
			console.log("[AuthGuard] Auth store still loading, waiting...");
			return;
		}

		// Special handling for root path - let useAuthListener handle password recovery
		if (pathname === "/" && !isAuthenticated) {
			console.log(
				"[AuthGuard] Root path with unauthenticated user, letting useAuthListener handle"
			);
			// Don't redirect immediately from root, let useAuthListener handle it
			return;
		}

		// Don't redirect during password recovery flow
		if (isPasswordRecovery && pathname === "/reset-password") {
			console.log(
				"[AuthGuard] Password recovery mode on reset-password page, allowing access"
			);
			return;
		}

		// Redirect authenticated users away from auth pages to dashboard
		if (isAuthenticated && isPublicPage && pathname !== "/") {
			console.log(
				"[AuthGuard] Authenticated user on public page, redirecting to dashboard"
			);
			router.replace("/dashboard");
			return;
		}

		// Redirect unauthenticated users to login when accessing protected routes
		if (!isAuthenticated && !isPublicPage) {
			console.log(
				"[AuthGuard] Unauthenticated user on protected route, redirecting to login"
			);
			router.replace("/login");
			return;
		}

		console.log("[AuthGuard] No action needed, allowing access");
	}, [
		isAuthStoreLoading,
		isAuthenticated,
		isPublicPage,
		isPasswordRecovery,
		router,
		pathname,
	]);

	// Show loader during auth store loading
	if (isAuthStoreLoading) {
		return <FullPageLoader />;
	}

	// Show loader while redirecting authenticated users away from auth pages
	if (
		isAuthenticated &&
		isPublicPage &&
		pathname !== "/" &&
		!(isPasswordRecovery && pathname === "/reset-password")
	) {
		return <FullPageLoader />;
	}

	// Show loader while redirecting unauthenticated users to login
	if (!isAuthenticated && !isPublicPage) {
		return <FullPageLoader />;
	}

	return <>{children}</>;
}
