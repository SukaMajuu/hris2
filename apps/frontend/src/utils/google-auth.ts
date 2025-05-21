import { supabase } from "@/lib/supabase";

export async function getSupabaseGoogleToken(): Promise<string> {
	try {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});

		if (error) {
			console.error("Supabase Google sign-in error:", error.message);
			throw error;
		}
		console.warn(
			"Initiated Google OAuth flow. Token must be retrieved after redirect."
		);
		return "";
	} catch (error) {
		console.error("Google authentication error:", error);
		throw error;
	}
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 300;

export async function getAccessTokenFromSession(
	retryCount = 0
): Promise<string | null> {
	console.log(
		`[getAccessTokenFromSession] Attempting to get session, try #${
			retryCount + 1
		}`
	);
	const { data, error } = await supabase.auth.getSession();

	if (error) {
		console.error(
			`[getAccessTokenFromSession] Error getting Supabase session (try #${
				retryCount + 1
			}):`,
			error.message
		);
		return null;
	}

	if (data.session?.access_token) {
		console.log(
			`[getAccessTokenFromSession] Session and access token found (try #${
				retryCount + 1
			}).`
		);
		return data.session.access_token;
	}

	if (retryCount < MAX_RETRIES - 1) {
		console.log(
			`[getAccessTokenFromSession] Session not found yet (try #${
				retryCount + 1
			}). Retrying in ${RETRY_DELAY_MS}ms...`
		);
		await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
		return getAccessTokenFromSession(retryCount + 1);
	}

	console.warn(
		`[getAccessTokenFromSession] Session not found after ${MAX_RETRIES} retries.`
	);
	return null;
}
