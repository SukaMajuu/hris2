"use client";

import MainLayout from "../_components/MainLayout";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return <MainLayout>{children}</MainLayout>;
}
