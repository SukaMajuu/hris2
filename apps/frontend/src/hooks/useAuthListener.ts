// src/hooks/useAuthListener.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/services/auth.service";
import { tokenService } from "@/services/token.service";
import { toast } from "sonner";

export function useAuthListener() {
	const router = useRouter();
	const setUser = useAuthStore((state) => state.setUser);
	const clearUser = useAuthStore((state) => state.logout);
	const [checkedInitialAuth, setCheckedInitialAuth] = useState(false);

	useEffect(() => {
		let isInitialCheckDone = false;

		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
					if (session?.access_token) {
						try {
							if (
								useAuthStore.getState().isAuthenticated &&
								tokenService.getAccessToken()
							) {
							} else {
								const backendResponse = await authService.registerWithGoogle(
									session.access_token
								);
								setUser(backendResponse.user);
								toast.success("Successfully logged in!");
							}
						} catch (error) {
							console.error(
								"Backend Google auth sync failed (hook):",
								error
							);
							toast.error(
								error instanceof Error
									? error.message
									: "Failed to sync session with backend."
							);
							await supabase.auth.signOut();
							tokenService.clearTokens();
							clearUser();
							router.push("/login");
						}
					} else {
						if (
							useAuthStore.getState().isAuthenticated ||
							tokenService.getAccessToken()
						) {
							tokenService.clearTokens();
							clearUser();
							router.push("/login");
						}
					}
				} else if (event === "SIGNED_OUT") {
					tokenService.clearTokens();
					clearUser();
					router.push("/login");
				} else if (event === "TOKEN_REFRESHED") {
					if (session?.access_token) {
						tokenService.setAccessToken(session.access_token);
					}
				}

				if (!isInitialCheckDone) {
					setCheckedInitialAuth(true);
					isInitialCheckDone = true;
				}
			}
		);

		const checkSessionOnLoad = async () => {
			if (!isInitialCheckDone) {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (
					!session &&
					(useAuthStore.getState().isAuthenticated ||
						tokenService.getAccessToken())
				) {
					tokenService.clearTokens();
					clearUser();
					router.push("/login");
				}
				setCheckedInitialAuth(true);
				isInitialCheckDone = true;
			}
		};
		const timerId = setTimeout(checkSessionOnLoad, 150);

		return () => {
			if (authListener && authListener.subscription) {
				authListener.subscription.unsubscribe();
			}
			clearTimeout(timerId);
		};
	}, [setUser, clearUser, router]);

	return { checkedInitialAuth };
}
