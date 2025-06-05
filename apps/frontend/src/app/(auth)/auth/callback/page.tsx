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
	const setIsLoading = useAuthStore((state) => state.setIsLoading);
	const [message, setMessage] = useState("Auth Callback: Initializing...");
	const googleAuthMutation = useGoogleAuthMutation();
	const hasProcessed = useRef(false);
	const isProcessing = useRef(false);

	useEffect(() => {
		if (hasProcessed.current || isProcessing.current) {
			return;
		}

		hasProcessed.current = true;
		isProcessing.current = true;

		// Ensure auth store is not in loading state during callback
		setIsLoading(false);
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
					// Clean up before redirect
					await clearSupabaseSession();
					setTimeout(() => router.replace("/login"), 1000);
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
					await clearSupabaseSession();
					setTimeout(() => router.replace("/login"), 1000);
					return;
				}

				// Clear Supabase session after successful HRIS authentication
				// This prevents confusion between Supabase and HRIS tokens
				setMessage("Cleaning up temporary authentication data...");
				await clearSupabaseSession();

				// Set user in auth store
				setUser(authResponse.user);
				setMessage(
					"Authentication successful! Redirecting to dashboard..."
				);

				// Show success toast
				toast.success("Google authentication successful!");

				// Ensure auth state is properly set before redirecting
				setTimeout(() => {
					router.replace("/dashboard");
				}, 1000);
			} catch (error) {
				console.error("[AuthCallback] Authentication error:", error);

				let errorMessage =
					"An unknown error occurred during Google sign-in.";

				if (error instanceof AxiosError) {
					if (error.response?.status === 500) {
						errorMessage =
							"Server error during authentication. Please try again.";
					} else {
						errorMessage =
							error.response?.data?.message ||
							error.message ||
							"Failed to communicate with the server.";
					}
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}

				toast.error(`Google login failed: ${errorMessage}`);
				setMessage(
					`Authentication error: ${errorMessage}. Redirecting to login...`
				);

				// Clean up any partial authentication state
				await clearSupabaseSession();

				// Redirect to login after showing error
				setTimeout(() => {
					router.replace("/login");
				}, 3000);
			} finally {
				isProcessing.current = false;
			}
		};

		handleAuthCallback();
	}, [router, setUser, setIsLoading, googleAuthMutation]);

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				flexDirection: "column",
				gap: "1rem",
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
