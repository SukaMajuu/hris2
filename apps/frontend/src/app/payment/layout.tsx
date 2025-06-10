"use client";

import type React from "react";
import MainLayout from "@/app/_components/MainLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ROLES } from "@/const/role";

export default function PaymentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<MainLayout>
			<RoleGuard allowedRoles={[ROLES.admin]}>{children}</RoleGuard>
		</MainLayout>
	);
}
