"use client";

import L from "leaflet";
import { useEffect, useRef } from "react";

interface MapMarkerProps {
	map: L.Map;
	latitude: number | undefined;
	longitude: number | undefined;
	interactive?: boolean;
	onPositionChange?: (lat: number, lng: number) => void;
}

export const MapMarker = ({
	map,
	latitude,
	longitude,
	interactive = true,
	onPositionChange,
}: MapMarkerProps) => {
	const markerRef = useRef<L.Marker | null>(null);
	const currentLatRef = useRef<number | undefined>(undefined);
	const currentLngRef = useRef<number | undefined>(undefined);

	// Update marker when props change
	useEffect(() => {
		if (!map) return;

		// If coordinates are undefined, remove marker and return
		if (latitude === undefined || longitude === undefined) {
			if (markerRef.current) {
				map.removeLayer(markerRef.current);
				markerRef.current = null;
			}
			currentLatRef.current = undefined;
			currentLngRef.current = undefined;
			return;
		}

		// Check if position actually changed to prevent unnecessary updates
		if (
			currentLatRef.current === latitude &&
			currentLngRef.current === longitude
		) {
			return;
		}

		// Update current position refs
		currentLatRef.current = latitude;
		currentLngRef.current = longitude;

		// Remove existing marker
		if (markerRef.current) {
			map.removeLayer(markerRef.current);
			markerRef.current = null;
		}

		// Add new marker
		const newMarker = L.marker([latitude, longitude], {
			draggable: interactive,
		}).addTo(map);

		if (interactive && onPositionChange) {
			newMarker.on("dragend", (e) => {
				const position = e.target.getLatLng();
				onPositionChange(position.lat, position.lng);
			});
		}

		markerRef.current = newMarker;

		// Center map on the marker
		map.setView([latitude, longitude], map.getZoom());
	}, [latitude, longitude, map, interactive, onPositionChange]);

	return null;
};
