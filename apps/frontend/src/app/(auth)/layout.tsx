"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const isAuthPage = ["/login", "/register", "/login/id-employee"].includes(
		pathname
	);

	return (
		<div
			className={`min-h-screen flex ${
				isAuthPage ? "flex-row" : "flex-row-reverse"
			}`}
		>
			{/* Left side - Image */}
			<div className="hidden lg:block lg:w-1/2 relative flex-[1]">
				<Image
					src="/auth-bg.jpg"
					alt="HRIS System"
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
					<div className="text-white text-center p-8">
						<h2 className="text-4xl font-bold mb-4">HRIS System</h2>
						<p className="text-lg">
							Streamline your HR processes with our comprehensive
							management system
						</p>
					</div>
				</div>
			</div>

			{/* Right side - Form */}
			<div className="relative w-full lg:w-1/3 flex items-center justify-center p-8">
				{children}
			</div>
		</div>
	);
}
