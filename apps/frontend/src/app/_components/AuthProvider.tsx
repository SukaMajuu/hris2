"use client";

import { useAuthListener } from "@/hooks/useAuthListener";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const { checkedInitialAuth } = useAuthListener();

	if (!checkedInitialAuth) {
		return <div>Loading authentication...</div>;
	}

	return <>{children}</>;
}
