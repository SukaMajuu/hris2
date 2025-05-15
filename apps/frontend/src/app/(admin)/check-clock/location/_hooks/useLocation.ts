import { useState } from "react";

export interface Location {
	id: number;
	nama: string;
	latitude?: number;
	longitude?: number;
	radius?: number;
}

export function useLocation() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [locations, setLocations] = useState<Location[]>(
		[...Array(5)].map((_, index) => ({
			id: index + 1,
			nama: `Location ${index + 1}`,
			latitude: -7.95 + index * 0.01,
			longitude: 112.61 + index * 0.01,
			radius: 10 + index * 10,
		}))
	);

	return {
		locations,
	};
}
