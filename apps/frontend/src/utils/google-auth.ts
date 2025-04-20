import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function getGoogleToken(): Promise<string> {
	try {
		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);
		const user = result.user;

		// Get the Firebase ID token instead of the access token
		const idToken = await user.getIdToken();
		return idToken;
	} catch (error) {
		console.error("Google authentication error:", error);
		throw error;
	}
}
