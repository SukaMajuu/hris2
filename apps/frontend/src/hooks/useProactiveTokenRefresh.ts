"use client";

import { useEffect, useCallback, useRef } from "react";

import { supabase } from "@/lib/supabase";
import { authService } from "@/services/auth.service";
import { TokenService } from "@/services/token.service";
import { useAuthStore } from "@/stores/auth.store";

const REFRESH_CHECK_INTERVAL_MS = 60 * 1000;
const NEAR_EXPIRY_BUFFER_MS = 2 * 60 * 1000;

const useProactiveTokenRefresh = () => {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const clearAuthStoreUser = useAuthStore((state) => state.logout);
	const isRefreshingRef = useRef(false);

	const attemptRefresh = useCallback(async () => {
		if (isRefreshingRef.current) {
			return;
		}

		if (
			TokenService.isAuthenticated() &&
			TokenService.isAccessTokenNearingExpiry(NEAR_EXPIRY_BUFFER_MS)
		) {
			isRefreshingRef.current = true;
			try {
				const refreshSuccessful = await authService.proactivelyRefreshAccessToken();
				if (!refreshSuccessful) {
					TokenService.clearTokens();
					clearAuthStoreUser();
					await supabase.auth.signOut();
				}
			} catch (error) {
				console.error(
					"[ProactiveRefresh] Error during proactive refresh attempt:",
					error
				);
				TokenService.clearTokens();
				clearAuthStoreUser();
				await supabase.auth.signOut();
			} finally {
				isRefreshingRef.current = false;
			}
		} else if (!TokenService.isAuthenticated() && isAuthenticated) {
			clearAuthStoreUser();
			await supabase.auth.signOut();
		}
	}, [isAuthenticated, clearAuthStoreUser]);

	useEffect(() => {
		const initialCheckTimer = setTimeout(() => {
			if (isAuthenticated) {
				attemptRefresh();
			}
		}, 5000);

		const intervalId = setInterval(() => {
			if (isAuthenticated) {
				attemptRefresh();
			}
		}, REFRESH_CHECK_INTERVAL_MS);

		return () => {
			clearTimeout(initialCheckTimer);
			clearInterval(intervalId);
		};
	}, [isAuthenticated, attemptRefresh]);
};

export { useProactiveTokenRefresh };
