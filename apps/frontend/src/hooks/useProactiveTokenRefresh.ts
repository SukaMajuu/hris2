"use client";

import { useEffect, useCallback, useRef } from "react";
import { authService } from "@/services/auth.service";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/stores/auth.store";
import { supabase } from "@/lib/supabase";

const REFRESH_CHECK_INTERVAL_MS = 60 * 1000;
const NEAR_EXPIRY_BUFFER_MS = 2 * 60 * 1000;

export function useProactiveTokenRefresh() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const clearAuthStoreUser = useAuthStore((state) => state.logout);
	const isRefreshingRef = useRef(false);

	const attemptRefresh = useCallback(async () => {
		if (isRefreshingRef.current) {
			return;
		}

		if (
			tokenService.isAuthenticated() &&
			tokenService.isAccessTokenNearingExpiry(NEAR_EXPIRY_BUFFER_MS)
		) {
			isRefreshingRef.current = true;
			try {
				const refreshSuccessful = await authService.proactivelyRefreshAccessToken();
				if (!refreshSuccessful) {
					tokenService.clearTokens();
					clearAuthStoreUser();
					await supabase.auth.signOut();
				}
			} catch (error) {
				console.error(
					"[ProactiveRefresh] Error during proactive refresh attempt:",
					error
				);
				tokenService.clearTokens();
				clearAuthStoreUser();
				await supabase.auth.signOut();
			} finally {
				isRefreshingRef.current = false;
			}
		} else if (!tokenService.isAuthenticated() && isAuthenticated) {
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
}
