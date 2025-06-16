"use client";

import L from "leaflet";
import { useEffect } from "react";

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
	useEffect(() => {
		if (!map || !interactive || !onPositionChange) return () => {};

		const handleMapClick = (e: L.LeafletMouseEvent) => {
			map.eachLayer((layer) => {
				if (layer instanceof L.Marker || layer instanceof L.Circle) {
					map.removeLayer(layer);
				}
			});

			onPositionChange(e.latlng.lat, e.latlng.lng);
		};

		map.on("click", handleMapClick);

		return () => {
			map.off("click", handleMapClick);
		};
	}, [map, interactive, onPositionChange]);

	return null;
};
