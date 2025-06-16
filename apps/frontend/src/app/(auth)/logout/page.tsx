"use client";

import { useEffect, useState, useRef } from "react";

import { useLogout } from "./useLogout";

const LogoutPage = () => {
	const { logout, isLoading } = useLogout();
	const [uiError, setUiError] = useState(false);
	const logoutEffectCalled = useRef(false);

	useEffect(() => {
		if (!logoutEffectCalled.current) {
			logoutEffectCalled.current = true;

			const initiateLogout = async () => {
				try {
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

	// Determine the title based on state
	const getTitle = () => {
		if (isLoading) return "Logging out...";
		if (uiError) return "Logout Error";
		return "Logout Process Initiated";
	};

	// Determine the description based on state
	const getDescription = () => {
		if (isLoading) return "Please wait while we process your logout.";
		if (uiError)
			return "An unexpected error occurred. You are being logged out and redirected.";
		return "Logout has been initiated. You will be redirected shortly.";
	};

	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="typography-h5 font-bold text-gray-900 mb-4">
					{getTitle()}
				</h1>
				<p className="typography-body2 text-gray-600">
					{getDescription()}
				</p>
			</div>
		</div>
	);
};

export default LogoutPage;
