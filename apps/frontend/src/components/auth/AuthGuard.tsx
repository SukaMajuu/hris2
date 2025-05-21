"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { usePathname, useRouter } from "next/navigation";
import FullPageLoader from "@/components/ui/full-page-loader";

const AUTH_FLOW_PAGES_TO_REDIRECT_FROM = [
	"/login",
	"/register",
	"/forgot-password",
	// "/reset-password",
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
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (isAuthStoreLoading) {
			return;
		}

		if (
			isAuthenticated &&
			AUTH_FLOW_PAGES_TO_REDIRECT_FROM.includes(pathname)
		) {
			router.replace("/dashboard");
		}
	}, [isAuthStoreLoading, isAuthenticated, router, pathname]);

	if (isAuthStoreLoading) {
		return <FullPageLoader />;
	}

	if (
		isAuthenticated &&
		AUTH_FLOW_PAGES_TO_REDIRECT_FROM.includes(pathname)
	) {
		return <FullPageLoader />;
	}

	return <>{children}</>;
}
