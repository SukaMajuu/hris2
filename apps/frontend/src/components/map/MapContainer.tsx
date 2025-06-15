"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapContainerProps {
	initialLat?: number;
	initialLng?: number;
	interactive?: boolean;
	onMapReady?: (map: L.Map) => void;
}

export const MapContainer = ({
	initialLat = 0,
	initialLng = 0,
	interactive = true,
	onMapReady,
}: MapContainerProps) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<L.Map | null>(null);
	const mapInitialized = useRef(false);

	// Initialize map only once
	useEffect(() => {
		if (mapInitialized.current || !mapRef.current) return;

		const DefaultIcon = L.icon({
			iconUrl:
				"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
			iconRetinaUrl:
				"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
			shadowUrl:
				"https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41],
		});

		L.Marker.prototype.options.icon = DefaultIcon;

		const initialZoom = initialLat && initialLng ? 13 : 2;

		const mapInstance = L.map(mapRef.current, {
			minZoom: 2,
			maxZoom: 18,
			maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
			maxBoundsViscosity: 1.0,
			worldCopyJump: false,
			zoomControl: interactive,
			dragging: interactive,
			boxZoom: interactive,
			doubleClickZoom: interactive,
			scrollWheelZoom: interactive,
			keyboard: interactive,
			attributionControl: true,
		}).setView([initialLat, initialLng], initialZoom);

		L.tileLayer(
			"https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=l1lKcXOmHNvH2YPTkRWZ",
			{
				attribution:
					'<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
				noWrap: true,
				bounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)),
			}
		).addTo(mapInstance);

		setMap(mapInstance);
		mapInitialized.current = true;

		if (onMapReady) {
			onMapReady(mapInstance);
		}

		// Cleanup function
		return () => {
			if (mapInstance) {
				mapInstance.remove();
				mapInitialized.current = false;
			}
		};
	}, [initialLat, initialLng, interactive, onMapReady]);

	return (
		<div
			ref={mapRef}
			style={{ height: "400px", width: "100%", borderRadius: "8px" }}
		/>
	);
};
