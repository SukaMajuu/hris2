"use client";

import type React from "react";

import MainLayout from "@/app/_components/MainLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { SubscriptionGuard } from "@/components/subscription/SubscriptionGuard";
import { ROLES } from "@/const/role";

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
	<MainLayout>
		<RoleGuard allowedRoles={[ROLES.admin]}>
			<SubscriptionGuard>{children}</SubscriptionGuard>
		</RoleGuard>
	</MainLayout>
);

export default AdminLayout;
