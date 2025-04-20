import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function getGoogleToken(): Promise<string> {
	try {
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);
		const credential = GoogleAuthProvider.credentialFromResult(result);

		if (!credential?.accessToken) {
			throw new Error("No access token received from Google");
		}

		return credential.accessToken;
	} catch (error) {
		console.error("Google authentication error:", error);
		throw error;
	}
}
