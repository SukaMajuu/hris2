"use client";

import { useEffect } from "react";
import L from "leaflet";

interface MapControlsProps {
	map: L.Map;
	interactive: boolean;
	onPositionChange?: (lat: number, lng: number) => void;
}

export const MapControls = ({
	map,
	interactive,
	onPositionChange,
}: MapControlsProps) => {
	// Add click handler for interactive mode
	useEffect(() => {
		if (!map || !interactive || !onPositionChange) return;

		const handleMapClick = (e: L.LeafletMouseEvent) => {
			// Remove existing markers and circles
			map.eachLayer((layer) => {
				if (layer instanceof L.Marker || layer instanceof L.Circle) {
					map.removeLayer(layer);
				}
			});

			// Call position change callback
			onPositionChange(e.latlng.lat, e.latlng.lng);
		};

		map.on("click", handleMapClick);

		return () => {
			map.off("click", handleMapClick);
		};
	}, [map, interactive, onPositionChange]);

	return null;
};
