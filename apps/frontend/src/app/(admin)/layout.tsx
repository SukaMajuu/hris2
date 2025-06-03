"use client";

import type React from "react";
import MainLayout from "@/app/_components/MainLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ROLES } from "@/const/role";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<MainLayout>
			<RoleGuard allowedRoles={[ROLES.admin]}>
				<SubscriptionGuard>{children}</SubscriptionGuard>
			</RoleGuard>
		</MainLayout>
	);
}
