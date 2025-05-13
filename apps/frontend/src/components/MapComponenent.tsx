"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
	latitude?: number;
	longitude?: number;
	radius: number;
	onPositionChange: (lat: number, lng: number) => void;
}

export const MapComponent = ({
	latitude,
	longitude,
	radius,
	onPositionChange,
}: MapComponentProps) => {
	const [map, setMap] = useState<L.Map | null>(null);
	const [marker, setMarker] = useState<L.Marker | null>(null);
	const [circle, setCircle] = useState<L.Circle | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;

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

		const mapInstance = L.map("map").setView(
			[initialLat, initialLng],
			initialZoom
		);

		L.tileLayer(
			"https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=l1lKcXOmHNvH2YPTkRWZ",
			{
				attribution:
					'<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
			}
		).addTo(mapInstance);

		setMap(mapInstance);

		if (latitude && longitude) {
			const newMarker = L.marker([latitude, longitude], {
				draggable: true,
			}).addTo(mapInstance);

			const newCircle = L.circle([latitude, longitude], {
				radius: radius || 100,
				color: "#3388ff",
				fillColor: "#3388ff",
				fillOpacity: 0.2,
			}).addTo(mapInstance);

			newMarker.on("dragend", (e) => {
				const position = e.target.getLatLng();
				onPositionChange(position.lat, position.lng);
				newCircle.setLatLng(position);
			});

			setMarker(newMarker);
			setCircle(newCircle);
		}

		mapInstance.on("click", (e) => {
			mapInstance.eachLayer((layer) => {
				if (layer instanceof L.Marker || layer instanceof L.Circle) {
					mapInstance.removeLayer(layer);
				}
			});

			setMarker(null);
			setCircle(null);

			const newMarker = L.marker(e.latlng, {
				draggable: true,
			}).addTo(mapInstance);

			const newCircle = L.circle(e.latlng, {
				radius: radius || 100,
				color: "#3388ff",
				fillColor: "#3388ff",
				fillOpacity: 0.2,
			}).addTo(mapInstance);

			newMarker.on("dragend", (e) => {
				const position = e.target.getLatLng();
				onPositionChange(position.lat, position.lng);
				newCircle.setLatLng(position);
			});

			setMarker(newMarker);
			setCircle(newCircle);

			onPositionChange(e.latlng.lat, e.latlng.lng);
		});

		return () => {
			mapInstance.remove();
		};
	}, []);

	useEffect(() => {
		if (map) {
			if (latitude && longitude) {
				map.setView([latitude, longitude], map.getZoom());

				if (marker && map.hasLayer(marker)) {
					marker.setLatLng([latitude, longitude]);
				} else {
					const newMarker = L.marker([latitude, longitude], {
						draggable: true,
					}).addTo(map);

					const newCircle = L.circle([latitude, longitude], {
						radius: radius || 100,
						color: "#3388ff",
						fillColor: "#3388ff",
						fillOpacity: 0.2,
					}).addTo(map);

					newMarker.on("dragend", (e) => {
						const position = e.target.getLatLng();
						onPositionChange(position.lat, position.lng);
						newCircle.setLatLng(position);
					});

					setMarker(newMarker);
					setCircle(newCircle);
				}

				if (circle && map.hasLayer(circle)) {
					circle.setLatLng([latitude, longitude]);
				}
			} else {
				if (marker && map.hasLayer(marker)) {
					map.removeLayer(marker);
				}
				if (circle && map.hasLayer(circle)) {
					map.removeLayer(circle);
				}

				setMarker(null);
				setCircle(null);

				map.setView([0, 0], 2);
			}
		}
	}, [latitude, longitude, map, marker, circle, radius, onPositionChange]);

	useEffect(() => {
		if (circle && radius) {
			circle.setRadius(radius);
		}
	}, [radius]);

	return (
		<div
			id="map"
			style={{ height: "400px", width: "100%", borderRadius: "8px" }}
		/>
	);
};
