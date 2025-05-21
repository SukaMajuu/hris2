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
