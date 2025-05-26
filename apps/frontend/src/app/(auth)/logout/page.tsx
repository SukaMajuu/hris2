"use client";

import { useEffect, useState, useRef } from "react";
import { useLogout } from "./useLogout";

export default function LogoutPage() {
	const { logout, isLoading } = useLogout();
	const [uiError, setUiError] = useState(false);
	const logoutEffectCalled = useRef(false);

	useEffect(() => {
		if (!logoutEffectCalled.current) {
			logoutEffectCalled.current = true;

			const initiateLogout = async () => {
				try {
					console.log(
						"[LogoutPage] Calling logout from useLogout hook..."
					);
					await logout();
				} catch (err) {
					console.error(
						"[LogoutPage] An unexpected error occurred after calling logout():",
						err
					);
					setUiError(true);
				}
			};

			initiateLogout();
		}
	}, [logout]);

	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="typography-h5 font-bold text-gray-900 mb-4">
					{isLoading
						? "Logging out..."
						: uiError
						? "Logout Error"
						: "Logout Process Initiated"}
				</h1>
				<p className="typography-body2 text-gray-600">
					{isLoading
						? "Please wait while we process your logout."
						: uiError
						? "An unexpected error occurred. You are being logged out and redirected."
						: "Logout has been initiated. You will be redirected shortly."}
				</p>
			</div>
		</div>
	);
}
