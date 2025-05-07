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

export async function getAccessTokenFromSession(): Promise<string | null> {
	const { data, error } = await supabase.auth.getSession();
	if (error) {
		console.error("Error getting Supabase session:", error.message);
		return null;
	}
	return data.session?.access_token ?? null;
}
