"use client";

import { useAuthListener } from "@/hooks/useAuthListener";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { initialAuthCheckCompleted } = useAuthListener();

	if (!initialAuthCheckCompleted) {
		return <div>Loading authentication...</div>;
	}

	return <>{children}</>;
}
