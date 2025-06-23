"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const UnauthorizedPage = () => (
		<div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
			<ShieldAlert className="w-16 h-16 text-yellow-500 mb-6" />
			<h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
				Access Denied
			</h1>
			<p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
				You do not have the necessary permissions to access this page.
			</p>
			<p className="mt-2 text-md text-gray-500 dark:text-gray-400">
				If you believe this is an error, please contact your
				administrator.
			</p>
			<Link href="/dashboard" className="mt-8">
				<Button variant="outline" size="lg">
					Return to Dashboard
				</Button>
			</Link>
		</div>
	);

export default UnauthorizedPage;
