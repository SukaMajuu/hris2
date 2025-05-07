"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function LinkExpiredPage() {
	return (
		<div className="h-full w-full flex flex-col justify-center items-center gap-10 text-center">
			<div>
				<Clock size={64} className="text-destructive" />
			</div>

			<div className="w-full max-w-xl flex flex-col gap-4">
				<h4 className="text-2xl font-bold">Link Expired</h4>
				<p className="text-sm text-gray-600">
					The link you used has expired and is no longer valid. Please
					request a new one if you still need to reset your password.
				</p>
			</div>

			<div className="w-full max-w-xs flex flex-col gap-4">
				<Button
					asChild
					className="w-full h-12 text-base hover:cursor-pointer"
				>
					<Link href="/forgot-password">Request a new link</Link>
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
}
