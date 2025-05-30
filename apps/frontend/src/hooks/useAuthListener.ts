"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore, User as AppUser, Role } from "@/stores/auth.store";
import { tokenService } from "@/services/token.service";
import { jwtDecode } from "jwt-decode";

interface DecodedJwtPayload {
	user_id: number;
	email: string;
	role: Role;
	token_type?: string;
	sub: string;
	iat?: number;
	exp?: number;
}

export function useAuthListener() {
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
		const token = tokenService.getAccessToken();
		const currentAuthStoreState = useAuthStore.getState();

		if (!currentAuthStoreState.isAuthenticated && token) {
			try {
				const decodedPayload = jwtDecode<DecodedJwtPayload>(token);
				const userFromToken: AppUser = {
					id: decodedPayload.user_id,
					email: decodedPayload.email,
					role: decodedPayload.role || "user",
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				};
				setUser(userFromToken);
			} catch (error) {
				console.error(
					"[AuthListener] Error rehydrating from token:",
					error
				);
				tokenService.clearTokens();
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
				const appState = useAuthStore.getState();

				if (event === "PASSWORD_RECOVERY") {
					setIsPasswordRecovery(true);
					if (pathname !== "/reset-password") {
						router.replace("/reset-password");
					}
					setIsLoading(false);
					setInitialSetupCompleted(true);
					return;
				}

				if (event === "SIGNED_OUT") {
					justLoggedOutRef.current = true;
					setIsPasswordRecovery(false);
					if (
						appState.isAuthenticated ||
						tokenService.getAccessToken()
					) {
						tokenService.clearTokens();
						clearUser();
					}
					if (
						pathname !== "/login" &&
						pathname !== "/register" &&
						pathname !== "/forgot-password" &&
						pathname !== "/reset-password" &&
						pathname !== "/login/id-employee" &&
						pathname !== "/check-email" &&
						pathname !== "/link-expired"
					) {
						router.push("/login");
					}
					setIsLoading(false);
					setInitialSetupCompleted(true);
					setTimeout(() => {
						justLoggedOutRef.current = false;
					}, 500);
					return;
				}

				if (
					session?.user &&
					(event === "INITIAL_SESSION" || event === "SIGNED_IN")
				) {
					if (justLoggedOutRef.current) {
						setIsLoading(false);
						setInitialSetupCompleted(true);
						return;
					}

					if (event === "SIGNED_IN") {
						setIsPasswordRecovery(false);
					}

					const supabaseUserIdAsNumber = parseInt(
						session.user.id,
						10
					);
					const finalUserId = !isNaN(supabaseUserIdAsNumber)
						? supabaseUserIdAsNumber
						: 0;
					if (
						!appState.isAuthenticated ||
						appState.user?.id !== finalUserId
					) {
						const appUserToSet: AppUser = {
							id: finalUserId,
							email: session.user.email || "default@example.com",
							role:
								(session.user.app_metadata
									?.role as AppUser["role"]) || "user",
							created_at:
								session.user.created_at ||
								new Date().toISOString(),
							updated_at:
								session.user.updated_at ||
								new Date().toISOString(),
						};
						setUser(appUserToSet);
					}
					if (
						event === "INITIAL_SESSION" &&
						appState.isAuthenticated &&
						appState.user?.id === finalUserId
					) {
						setIsLoading(false);
					}
				} else if (!session && event === "INITIAL_SESSION") {
					const tokenExists = !!tokenService.getAccessToken();
					if (!tokenExists && appState.isAuthenticated) {
						clearUser();
					} else if (!tokenExists && !appState.isAuthenticated) {
						setIsLoading(false);
					}
				}
				setInitialSetupCompleted(true);
				if (useAuthStore.getState().isLoading) setIsLoading(false);
			}
		);

		const fallbackTimer = setTimeout(() => {
			if (!initialSetupCompleted || useAuthStore.getState().isLoading) {
				const state = useAuthStore.getState();
				if (!state.isAuthenticated && !tokenService.getAccessToken()) {
					if (
						pathname !== "/login" &&
						pathname !== "/register" &&
						pathname !== "/forgot-password" &&
						pathname !== "/reset-password" &&
						pathname !== "/login/id-employee"
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
}
