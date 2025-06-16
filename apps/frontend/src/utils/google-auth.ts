import { supabase } from "@/lib/supabase";
import { tokenService } from "@/services/token.service";

const getSupabaseGoogleToken = async (): Promise<string> => {
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
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 300;

const getAccessTokenFromSession = async (
	retryCount = 0
): Promise<string | null> => {
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		return null;
	}

	if (data.session?.access_token) {
		return data.session.access_token;
	}

	if (retryCount < MAX_RETRIES - 1) {
		await new Promise((resolve) => {
			setTimeout(resolve, RETRY_DELAY_MS);
		});
		return getAccessTokenFromSession(retryCount + 1);
	}

	return null;
};

/**
 * Clear Supabase session and tokens
 * Used after successful HRIS authentication to prevent token conflicts
 */
const clearSupabaseSession = async (): Promise<void> => {
	await supabase.auth.signOut();
};

/**
 * Emergency cleanup function to resolve token conflicts
 * This clears all authentication-related storage from both Supabase and HRIS
 * Use this if you encounter issues with multiple tokens
 */
const emergencyAuthCleanup = async (): Promise<void> => {
	await clearSupabaseSession();
	tokenService.clearAllAuthStorage();
};

if (typeof window !== "undefined") {
	(window as typeof window & {
		emergencyAuthCleanup: typeof emergencyAuthCleanup;
	}).emergencyAuthCleanup = emergencyAuthCleanup;
}

export {
	getSupabaseGoogleToken,
	getAccessTokenFromSession,
	clearSupabaseSession,
	emergencyAuthCleanup,
};
