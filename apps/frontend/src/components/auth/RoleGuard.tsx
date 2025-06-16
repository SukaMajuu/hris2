"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import FullPageLoader from "@/components/ui/full-page-loader";
import { Role } from "@/const/role";
import { useAuthStore } from "@/stores/auth.store";

interface RoleGuardProps {
	children: React.ReactNode;
	allowedRoles: Role[];
	fallbackPath?: string;
}

export const RoleGuard = ({
	children,
	allowedRoles,
	fallbackPath = "/unauthorized",
}: RoleGuardProps) => {
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
