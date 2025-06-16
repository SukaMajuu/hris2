"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const CheckEmailPage = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const userEmail = searchParams.get("email") || "your email address";

	const handleResend = () => {
		router.push("/forgot-password");
	};

	return (
		<div className="h-full w-full flex flex-col justify-center items-center gap-10 text-center">
			<div>
				<Mail size={64} className="text-gray-700" />
			</div>

			<div className="w-full max-w-xl flex flex-col gap-4">
				<h4 className="text-2xl font-bold">Check your email!</h4>
				<p className="text-sm text-gray-600">
					We sent a password reset link to your email ({userEmail})
					which valid for 24 hours after receives the email. Please
					check your inbox!
				</p>
			</div>

			<div className="w-full max-w-md flex flex-col gap-4">
				<Button
					onClick={handleResend}
					className="w-full h-12 text-base bg-white text-black border border-gray-300 hover:bg-gray-200 hover:cursor-pointer"
				>
					Click here to Resend
				</Button>
				<Link
					href="/login"
					className="font-medium text-indigo-600 hover:text-indigo-500"
				>
					Back to Login
				</Link>
			</div>
		</div>
	);
};

export default CheckEmailPage;
