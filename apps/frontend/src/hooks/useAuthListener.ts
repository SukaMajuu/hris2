"use client";

import { jwtDecode } from "jwt-decode";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

import { supabase } from "@/lib/supabase";
import { TokenService } from "@/services/token.service";
import { useAuthStore, User as AppUser, Role } from "@/stores/auth.store";

interface DecodedJwtPayload {
	user_id: number;
	email: string;
	role: Role;
	token_type?: string;
	sub: string;
	iat?: number;
	exp?: number;
}

const useAuthListener = () => {
	const router = useRouter();
	const pathname = usePathname();
	const setUser = useAuthStore((state) => state.setUser);
	const clearUser = useAuthStore((state) => state.logout);
	const setIsLoading = useAuthStore((state) => state.setIsLoading);
	const setIsPasswordRecovery = useAuthStore(
		(state) => state.setIsPasswordRecovery
	);

	const [initialSetupCompleted, setInitialSetupCompleted] = useState(false);
	const justLoggedOutRef = useRef(false);

	useEffect(() => {
		if (pathname === "/auth/callback") {
			setIsLoading(false);
			setInitialSetupCompleted(true);
			return undefined;
		}

		const token = TokenService.getAccessToken();
		const currentAuthStoreState = useAuthStore.getState();

		if (!currentAuthStoreState.isAuthenticated && token) {
			try {
				const decodedPayload = jwtDecode<DecodedJwtPayload>(token);
				const userFromToken: AppUser = {
					id: decodedPayload.user_id,
					email: decodedPayload.email,
					role: decodedPayload.role || "admin",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				setUser(userFromToken);
			} catch (error) {
				console.error(
					"[AuthListener] Error rehydrating from token:",
					error
				);
				TokenService.clearTokens();
				clearUser();
			}
		} else if (
			currentAuthStoreState.isAuthenticated &&
			!token &&
			!currentAuthStoreState.isPasswordRecovery
		) {
			clearUser();
		}

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (pathname === "/auth/callback") {
					return undefined;
				}

				const appState = useAuthStore.getState();

				if (event === "PASSWORD_RECOVERY") {
					setIsPasswordRecovery(true);
					if (pathname !== "/reset-password") {
						router.replace("/reset-password");
					}
					setIsLoading(false);
					setInitialSetupCompleted(true);
					return undefined;
				}

				if (event === "SIGNED_OUT") {
					justLoggedOutRef.current = true;
					setIsPasswordRecovery(false);

					if (
						appState.isAuthenticated ||
						TokenService.getAccessToken()
					) {
						TokenService.clearTokens();
						clearUser();
					}

					if (
						pathname !== "/login" &&
						pathname !== "/register" &&
						pathname !== "/forgot-password" &&
						pathname !== "/reset-password" &&
						pathname !== "/login/id-employee" &&
						pathname !== "/check-email" &&
						pathname !== "/link-expired" &&
						pathname !== "/auth/callback"
					) {
						router.push("/login");
					}
					setIsLoading(false);
					setInitialSetupCompleted(true);
					setTimeout(() => {
						justLoggedOutRef.current = false;
					}, 500);
					return undefined;
				}

				if (
					session?.user &&
					(event === "INITIAL_SESSION" || event === "SIGNED_IN")
				) {
					if (justLoggedOutRef.current) {
						setIsLoading(false);
						setInitialSetupCompleted(true);
						return undefined;
					}

					if (event === "SIGNED_IN") {
						setIsPasswordRecovery(false);
					}

					if (
						appState.isAuthenticated &&
						TokenService.getAccessToken()
					) {
						setIsLoading(false);
					}
				} else if (!session && event === "INITIAL_SESSION") {
					const tokenExists = !!TokenService.getAccessToken();
					if (!tokenExists && appState.isAuthenticated) {
						clearUser();
					} else if (!tokenExists && !appState.isAuthenticated) {
						setIsLoading(false);
					}
				}
				setInitialSetupCompleted(true);
				if (useAuthStore.getState().isLoading) setIsLoading(false);
				return undefined;
			}
		);

		const fallbackTimer = setTimeout(() => {
			if (!initialSetupCompleted || useAuthStore.getState().isLoading) {
				const state = useAuthStore.getState();
				if (!state.isAuthenticated && !TokenService.getAccessToken()) {
					if (
						pathname !== "/login" &&
						pathname !== "/register" &&
						pathname !== "/forgot-password" &&
						pathname !== "/reset-password" &&
						pathname !== "/login/id-employee" &&
						pathname !== "/auth/callback"
					) {
						router.push("/login");
					}
				}
				setIsLoading(false);
				setInitialSetupCompleted(true);
			}
		}, 1000);

		if (
			!token &&
			!currentAuthStoreState.isAuthenticated &&
			!initialSetupCompleted
		) {
			setIsLoading(false);
		}

		return () => {
			if (authListener?.subscription)
				authListener.subscription.unsubscribe();
			clearTimeout(fallbackTimer);
		};
	}, [
		setUser,
		clearUser,
		setIsLoading,
		router,
		pathname,
		initialSetupCompleted,
		setIsPasswordRecovery,
	]);

	return { initialAuthCheckCompleted: initialSetupCompleted };
};

export { useAuthListener };
