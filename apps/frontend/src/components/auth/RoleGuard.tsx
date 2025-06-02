"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Role } from "@/const/role";
import { toast } from "sonner";
import FullPageLoader from "@/components/ui/full-page-loader";

interface RoleGuardProps {
	children: React.ReactNode;
	allowedRoles: Role[];
	fallbackPath?: string;
}

export function RoleGuard({
	children,
	allowedRoles,
	fallbackPath = "/unauthorized",
}: RoleGuardProps) {
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const isAuthStoreLoading = useAuthStore((state) => state.isLoading);

	const userRole = user?.role as Role | undefined;
	const isAuthorized = userRole ? allowedRoles.includes(userRole) : false;

	useEffect(() => {
		if (isAuthStoreLoading) {
			return;
		}

		if (!isAuthorized) {
			toast.error("You are not authorized to view this page.");
			router.replace(fallbackPath);
		}
	}, [
		isAuthorized,
		userRole,
		allowedRoles,
		router,
		fallbackPath,
		isAuthStoreLoading,
	]);

	if (isAuthStoreLoading) {
		return <FullPageLoader />;
	}

	if (!isAuthorized) {
		toast.error("You are not authorized to view this page.");
		return <FullPageLoader />;
	}

	return <>{children}</>;
}
