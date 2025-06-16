"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ROLES } from "@/const/role";

import MainLayout from "../_components/MainLayout";

interface SharedLayoutProps {
	children: React.ReactNode;
}

const SharedLayout = ({ children }: SharedLayoutProps) => (
	<MainLayout>
		<RoleGuard allowedRoles={[ROLES.user, ROLES.admin]}>
			<SubscriptionGuard>{children}</SubscriptionGuard>
		</RoleGuard>
	</MainLayout>
);

export default SharedLayout;
