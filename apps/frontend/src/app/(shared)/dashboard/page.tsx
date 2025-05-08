"use client";

import { useAuthStore } from "@/stores/auth.store";
import { type Role } from "@/const/role";

export default function DashboardPage() {
	const { user } = useAuthStore();
	const role = (user?.role as Role) || "admin";

	const isAdminDashboard = role === "admin";

	return (
		<div>
			<h1 className="text-2xl font-bold mb-6">{role} Dashboard</h1>

			{isAdminDashboard ? (
				<div>Admin Dashboard</div>
			) : (
				<div>User Dashboard</div>
			)}
		</div>
	);
}
