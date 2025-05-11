"use client";

import { useParams } from "next/navigation";

export default function Page() {
	const params = useParams();
	const id = params.id;

	return (
		<div className="flex flex-col items-center justify-center w-full h-full p-4">
			<h1 className="text-2xl font-bold">{id}</h1>
		</div>
	);
}
