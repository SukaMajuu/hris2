import { supabase } from "@/lib/supabase";
import { tokenService } from "@/services/token.service";

export async function getSupabaseGoogleToken(): Promise<string> {
	try {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo:
					typeof window !== "undefined"
						? `${window.location.origin}/auth/callback`
						: "/auth/callback",
			},
		});

		if (error) {
			throw error;
		}
		return "";
	} catch (error) {
		throw error;
	}
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 300;

export async function getAccessTokenFromSession(
	retryCount = 0
): Promise<string | null> {
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		return null;
	}

	if (data.session?.access_token) {
		return data.session.access_token;
	}

	if (retryCount < MAX_RETRIES - 1) {
		await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
		return getAccessTokenFromSession(retryCount + 1);
	}

	return null;
}

/**
 * Clear Supabase session and tokens
 * Used after successful HRIS authentication to prevent token conflicts
 */
export async function clearSupabaseSession(): Promise<void> {
	try {
		await supabase.auth.signOut();
	} catch (error) {
		console.warn("Failed to clear Supabase session:", error);
		// Don't throw error, just warn
	}
}

/**
 * Emergency cleanup function to resolve token conflicts
 * This clears all authentication-related storage from both Supabase and HRIS
 * Use this if you encounter issues with multiple tokens
 */
export async function emergencyAuthCleanup(): Promise<void> {
	try {
		await clearSupabaseSession();
		tokenService.clearAllAuthStorage();
	} catch (error) {
		throw error;
	}
}

if (typeof window !== "undefined") {
	(window as any).emergencyAuthCleanup = emergencyAuthCleanup;
}
