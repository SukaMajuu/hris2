"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapCircleProps {
	map: L.Map;
	latitude: number;
	longitude: number;
	radius: number;
}

export const MapCircle = ({
	map,
	latitude,
	longitude,
	radius,
}: MapCircleProps) => {
	const circleRef = useRef<L.Circle | null>(null);

	// Update circle when props change
	useEffect(() => {
		if (!map) return;

		// Remove existing circle
		if (circleRef.current) {
			map.removeLayer(circleRef.current);
			circleRef.current = null;
		}

		// Add new circle
		const newCircle = L.circle([latitude, longitude], {
			radius: radius || 100,
			color: "#3388ff",
			fillColor: "#3388ff",
			fillOpacity: 0.2,
		}).addTo(map);

		circleRef.current = newCircle;
	}, [latitude, longitude, map, radius]);

	// Update circle radius when radius changes
	useEffect(() => {
		if (circleRef.current && radius) {
			circleRef.current.setRadius(radius);
		}
	}, [radius]);

	return null;
};
