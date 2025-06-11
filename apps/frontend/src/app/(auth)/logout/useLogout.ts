import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { useLogoutMutation } from "@/api/mutations/auth.mutation";
import { AxiosError } from "axios";
import { useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { tokenService } from "@/services/token.service";

/**
 * Enhanced logout hook with comprehensive cache and storage clearing
 *
 * This hook provides secure logout functionality that:
 * 1. Prevents spam clicking with loading states
 * 2. Calls backend logout API (best effort)
 * 3. Clears ALL client-side storage and caches:
 *    - React Query cache (all cached API data)
 *    - localStorage (auth tokens, user preferences, etc.)
 *    - sessionStorage (temporary data, form state, etc.)
 *    - Cookies (authentication and tracking cookies)
 *    - Zustand persisted store (auth state)
 * 4. Resets auth store state
 * 5. Provides visual feedback via loading states and toasts
 *
 * This ensures no data leakage between user sessions, making it safe for:
 * - Shared computers/devices
 * - Switching between different user accounts
 * - Security-sensitive environments
 *
 * @returns {object} Object containing logout function and loading state
 */
export const useLogout = () => {
	const logoutFromStore = useAuthStore((state) => state.logout);
	const logoutMutation = useLogoutMutation();
	const queryClient = useQueryClient();
	const isLoggingOut = useRef(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const clearAllCaches = useCallback(() => {
		try {
			console.log("[useLogout] Clearing all caches and storage...");

			// 1. Clear React Query cache
			queryClient.clear();
			console.log("[useLogout] React Query cache cleared");

			// 2. Clear all localStorage (tokens, etc.)
			tokenService.clearAllAuthStorage(); // This clears auth tokens including Supabase

			// Clear any other localStorage items that might exist
			const localStorageKeysToKeep: string[] = []; // Keep nothing for security
			Object.keys(localStorage).forEach((key) => {
				if (!localStorageKeysToKeep.includes(key)) {
					localStorage.removeItem(key);
				}
			});
			console.log("[useLogout] localStorage cleared");

			// 3. Clear all sessionStorage
			sessionStorage.clear();
			console.log("[useLogout] sessionStorage cleared");

			// 4. Clear Zustand persisted storage (this should be handled by logoutFromStore, but let's be explicit)
			// The auth store will reset automatically, but let's clear the persisted storage key as well
			try {
				localStorage.removeItem("auth-storage");
			} catch (e) {
				console.warn("[useLogout] Could not clear auth-storage:", e);
			}

			// 5. Clear cookies (best effort)
			try {
				// Clear all cookies for the domain
				document.cookie.split(";").forEach((c) => {
					const eqPos = c.indexOf("=");
					const name =
						eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
					if (name) {
						// Clear for current path and domain
						document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
						document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
						// Also try with leading dot for subdomain cookies
						document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
					}
				});
				console.log("[useLogout] Cookies cleared");
			} catch (e) {
				console.warn("[useLogout] Could not clear cookies:", e);
			}

			// 6. Clear any IndexedDB or other storage if needed (for future use)
			// indexedDB can be cleared here if we use it in the future

			console.log(
				"[useLogout] All caches and storage cleared successfully"
			);
		} catch (error) {
			console.error("[useLogout] Error clearing caches:", error);
			// Don't throw error - logout should still proceed
		}
	}, [queryClient]);

	const performLogout = useCallback(async () => {
		// Prevent spam clicking
		if (isLoggingOut.current || isProcessing) {
			console.log(
				"[useLogout] Logout already in progress, ignoring duplicate call"
			);
			return;
		}

		isLoggingOut.current = true;
		setIsProcessing(true);

		try {
			console.log("[useLogout] Starting logout process...");

			// Try to logout from server first (best effort)
			await logoutMutation.mutateAsync();
			console.log("[useLogout] Server logout successful");
		} catch (error) {
			console.error(
				"[useLogout] Error during backend logout call:",
				error
			);
			if (error instanceof AxiosError && error.response?.status === 401) {
				// Token already invalid, proceed with local logout
				console.log(
					"[useLogout] Token already invalid, proceeding with local logout"
				);
			} else {
				toast.error(
					"Logout request to server failed, but logging out locally."
				);
			}
		} finally {
			// Always clear local state and caches, regardless of server response
			console.log("[useLogout] Clearing local state and caches...");

			// Clear all caches and storage first
			clearAllCaches();

			// Then clear the auth store (this will also trigger any auth-related cleanup)
			logoutFromStore();

			toast.success("You have been logged out.");

			// Keep the processing state for a bit longer to prevent rapid re-clicking
			setTimeout(() => {
				isLoggingOut.current = false;
				setIsProcessing(false);

				// Optional: Force a hard refresh to ensure completely clean state
				// This can be useful if you want to guarantee that no residual state exists
				// Uncomment the next line if you want to force a page reload after logout
				// This will redirect to login page and ensure a completely fresh start
				// window.location.href = '/login';

				// Alternative: Just redirect without refresh (faster but may retain some in-memory state)
				// window.location.replace('/login');
			}, 1000); // Increased from 500ms to 1000ms
		}
	}, [logoutFromStore, logoutMutation, clearAllCaches]);

	return {
		logout: performLogout,
		isLoading:
			logoutMutation.isPending || isLoggingOut.current || isProcessing,
	};
};
