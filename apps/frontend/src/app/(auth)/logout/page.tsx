"use client";

import { useEffect, useState } from "react";
import { useLogout } from "./useLogout";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
	const { logout, isLoading } = useLogout();
	const [error, setError] = useState(false);
	const [logoutAttempted, setLogoutAttempted] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Only attempt logout once
		if (!logoutAttempted) {
			setLogoutAttempted(true);

			const performLogout = async () => {
				try {
					await logout();
				} catch (err) {
					console.error("Error during logout:", err);
					setError(true);

					// Even if there's an error, redirect to login after a short delay
					setTimeout(() => {
						router.push("/login");
					}, 2000);
				}
			};

			performLogout();
		}
	}, [logout, logoutAttempted, router]);

	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="typography-h5 font-bold text-gray-900 mb-4">
					{isLoading
						? "Logging out..."
						: error
						? "Logout Error"
						: "Logged out"}
				</h1>
				<p className="typography-body2 text-gray-600">
					{isLoading
						? "Please wait while we log you out."
						: error
						? "There was an error during logout, but you have been logged out locally. Redirecting to login page..."
						: "You have been successfully logged out. Redirecting to login page..."}
				</p>
			</div>
		</div>
	);
}
