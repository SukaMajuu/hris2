"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import {
	getAccessTokenFromSession,
	clearSupabaseSession,
} from "@/utils/google-auth";
import { toast } from "sonner";
import { useGoogleAuthMutation } from "@/api/mutations/auth.mutation";
import { AxiosError } from "axios";

export default function AuthCallbackPage() {
	const router = useRouter();
	const setUser = useAuthStore((state) => state.setUser);
	const [message, setMessage] = useState("Auth Callback: Initializing...");
	const googleAuthMutation = useGoogleAuthMutation();
	const hasProcessed = useRef(false);

	useEffect(() => {
		if (hasProcessed.current) {
			return;
		}
		hasProcessed.current = true;
		setMessage("Auth Callback: Processing authentication...");

		const handleAuthCallback = async () => {
			try {
				setMessage("Retrieving session details from Google...");
				const supabaseAccessToken = await getAccessTokenFromSession();

				if (!supabaseAccessToken) {
					toast.error(
						"Could not retrieve session from Google. Please try logging in again."
					);
					setMessage(
						"Authentication failed: No session token found from Google."
					);
					router.push("/login");
					return;
				}

				setMessage("Verifying session with our application server...");

				const authResponse = await googleAuthMutation.mutateAsync(
					supabaseAccessToken
				);

				if (
					!authResponse ||
					!authResponse.user ||
					!authResponse.access_token
				) {
					toast.error(
						"Failed to authenticate with the application server. Invalid response."
					);
					setMessage(
						"Authentication failed: Could not verify session with our server."
					);
					router.push("/login");
					return;
				}

				// Clear Supabase session after successful HRIS authentication
				// This prevents confusion between Supabase and HRIS tokens
				setMessage("Cleaning up temporary authentication data...");
				await clearSupabaseSession();

				setUser(authResponse.user);
				toast.success("Successfully logged in with Google!");
				setMessage(
					"Authentication successful! Redirecting to dashboard..."
				);
				router.push("/dashboard");
			} catch (error) {
				let errorMessage =
					"An unknown error occurred during Google sign-in.";

				if (error instanceof AxiosError) {
					errorMessage =
						error.response?.data?.message ||
						error.message ||
						"Failed to communicate with the server.";
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}

				toast.error(`Google login failed: ${errorMessage}`);
				setMessage(
					`Authentication error: ${errorMessage}. Redirecting to login...`
				);

				if (
					typeof window !== "undefined" &&
					window.location.pathname !== "/login"
				) {
					router.push("/login");
				}
			}
		};

		handleAuthCallback();
	}, [router, setUser, googleAuthMutation]);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				flexDirection: "column",
			}}
		>
			<p>{message}</p>
			{googleAuthMutation.isPending && <p>Processing with server...</p>}
			{!googleAuthMutation.isPending &&
				message.startsWith("Auth Callback:") && (
					<p>Waiting for session or server response...</p>
				)}
		</div>
	);
}
