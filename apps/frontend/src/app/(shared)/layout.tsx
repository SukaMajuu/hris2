"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import MainLayout from "../_components/MainLayout";
import { ROLES } from "@/const/role";

interface SharedLayoutProps {
	children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
	return (
		<MainLayout>
			<RoleGuard allowedRoles={[ROLES.user, ROLES.admin]}>
				{children}
			</RoleGuard>
		</MainLayout>
	);
}
