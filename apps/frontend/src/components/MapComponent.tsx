"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
	latitude?: number;
	longitude?: number;
	radius: number;
	onPositionChange?: (lat: number, lng: number) => void;
	interactive?: boolean;
	showRadius?: boolean;
}

export const MapComponent = ({
	latitude,
	longitude,
	radius,
	onPositionChange,
	interactive = true,
	showRadius = true,
}: MapComponentProps) => {
	const mapRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<L.Map | null>(null);
	const markerRef = useRef<L.Marker | null>(null);
	const circleRef = useRef<L.Circle | null>(null);
	const mapInitialized = useRef(false);
	const currentLatRef = useRef<number | undefined>(undefined);
	const currentLngRef = useRef<number | undefined>(undefined);

	// Memoize the position change callback to prevent infinite loops
	const handlePositionChange = useCallback(
		(lat: number, lng: number) => {
			// Only call if position actually changed
			if (
				currentLatRef.current !== lat ||
				currentLngRef.current !== lng
			) {
				currentLatRef.current = lat;
				currentLngRef.current = lng;
				if (onPositionChange) {
					onPositionChange(lat, lng);
				}
			}
		},
		[onPositionChange]
	);

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

		const initialLat = latitude || 0;
		const initialLng = longitude || 0;
		const initialZoom = latitude && longitude ? 13 : 2;

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

		// Add click handler for interactive mode
		if (interactive) {
			mapInstance.on("click", (e) => {
				// Remove existing markers and circles
				mapInstance.eachLayer((layer) => {
					if (
						layer instanceof L.Marker ||
						layer instanceof L.Circle
					) {
						mapInstance.removeLayer(layer);
					}
				});

				// Create new marker
				const newMarker = L.marker(e.latlng, {
					draggable: true,
				}).addTo(mapInstance);

				// Create new circle only if showRadius is true
				let newCircle = null;
				if (showRadius) {
					newCircle = L.circle(e.latlng, {
						radius: radius || 100,
						color: "#3388ff",
						fillColor: "#3388ff",
						fillOpacity: 0.2,
					}).addTo(mapInstance);
				}

				// Add drag handler
				newMarker.on("dragend", (dragEvent) => {
					const position = dragEvent.target.getLatLng();
					handlePositionChange(position.lat, position.lng);
					if (newCircle) {
						newCircle.setLatLng(position);
					}
				});

				// Update refs
				markerRef.current = newMarker;
				circleRef.current = newCircle;

				// Call position change callback
				handlePositionChange(e.latlng.lat, e.latlng.lng);
			});
		}

		// Cleanup function
		return () => {
			if (mapInstance) {
				mapInstance.remove();
				mapInitialized.current = false;
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [interactive, showRadius]); // Only depend on props that affect map initialization

	// Update marker and circle when props change
	useEffect(() => {
		if (!map || !latitude || !longitude) return;

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

		// Remove existing markers and circles
		if (markerRef.current) {
			map.removeLayer(markerRef.current);
			markerRef.current = null;
		}
		if (circleRef.current) {
			map.removeLayer(circleRef.current);
			circleRef.current = null;
		}

		// Add new marker
		const newMarker = L.marker([latitude, longitude], {
			draggable: interactive,
		}).addTo(map);

		// Add new circle only if showRadius is true
		let newCircle = null;
		if (showRadius) {
			newCircle = L.circle([latitude, longitude], {
				radius: radius || 100,
				color: "#3388ff",
				fillColor: "#3388ff",
				fillOpacity: 0.2,
			}).addTo(map);
		}

		if (interactive) {
			newMarker.on("dragend", (e) => {
				const position = e.target.getLatLng();
				handlePositionChange(position.lat, position.lng);
				if (newCircle) {
					newCircle.setLatLng(position);
				}
			});
		}

		markerRef.current = newMarker;
		circleRef.current = newCircle;

		// Center map on the marker
		map.setView([latitude, longitude], map.getZoom());
	}, [
		latitude,
		longitude,
		map,
		interactive,
		showRadius,
		handlePositionChange,
	]);

	// Update circle radius when radius changes (only if circle exists)
	useEffect(() => {
		if (circleRef.current && radius && showRadius) {
			circleRef.current.setRadius(radius);
		}
	}, [radius, showRadius]);

	return (
		<div
			ref={mapRef}
			style={{ height: "400px", width: "100%", borderRadius: "8px" }}
		/>
	);
};
