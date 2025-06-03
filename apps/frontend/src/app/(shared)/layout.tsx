"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import MainLayout from "../_components/MainLayout";
import { ROLES } from "@/const/role";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
interface SharedLayoutProps {
	children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
	return (
		<MainLayout>
			<RoleGuard allowedRoles={[ROLES.user, ROLES.admin]}>
				<SubscriptionGuard>{children}</SubscriptionGuard>
			</RoleGuard>
		</MainLayout>
	);
}
