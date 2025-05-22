"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		router.push("/login");
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<h1 className="typography-h1 text-accent">Hello, World!</h1>
		</div>
	);
}
