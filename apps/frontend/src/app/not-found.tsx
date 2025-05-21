"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
			<h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100">
				404
			</h1>
			<p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
				Oops! Page Not Found.
			</p>
			<p className="mt-2 text-md text-gray-500 dark:text-gray-400">
				Sorry, the page you are looking for does not exist or has been
				moved.
			</p>
			<Button
				variant="outline"
				size="lg"
				onClick={() => router.back()}
				className="mt-8"
			>
				Go Back
			</Button>
		</div>
	);
}
