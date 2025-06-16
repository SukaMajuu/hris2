"use client";

import type React from "react";

import MainLayout from "@/app/_components/MainLayout";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ROLES } from "@/const/role";

const UserLayout = ({ children }: { children: React.ReactNode }) => (
	<MainLayout>
		<RoleGuard allowedRoles={[ROLES.user]}>{children}</RoleGuard>
	</MainLayout>
);

export default UserLayout;
