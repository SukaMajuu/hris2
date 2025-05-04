"use client";

import type React from "react";
import MainLayout from "@/app/_components/MainLayout";

export default function UserLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <MainLayout>{children}</MainLayout>;
}
