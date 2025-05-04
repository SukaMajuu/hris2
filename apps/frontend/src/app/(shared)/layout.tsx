"use client";

import MainLayout from "../_components/MainLayout";

interface SharedLayoutProps {
	children: React.ReactNode;
}

export default function SharedLayout({ children }: SharedLayoutProps) {
	return <MainLayout>{children}</MainLayout>;
}
