"use client";

import { useAuthListener } from "@/hooks/useAuthListener";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { initialAuthCheckCompleted } = useAuthListener();

	if (!initialAuthCheckCompleted) {
		return <div>Loading authentication...</div>;
	}

	return <>{children}</>;
}
