"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
	latitude?: number;
	longitude?: number;
	radius: number;
	onPositionChange?: (lat: number, lng: number) => void;
	interactive?: boolean;
}

export const MapComponent = ({
	latitude,
	longitude,
	radius,
	onPositionChange,
	interactive = true,
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

		const mapInstance = L.map("map", {
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

		if (latitude && longitude) {
			const newMarker = L.marker([latitude, longitude], {
				draggable: interactive,
			}).addTo(mapInstance);

			if (interactive) {
				newMarker.on("drag", (e) => {
					const position = e.target.getLatLng();
					if (position.lat < -90) position.lat = -90;
					if (position.lat > 90) position.lat = 90;
					if (position.lng < -180) position.lng = -180;
					if (position.lng > 180) position.lng = 180;
					e.target.setLatLng(position);
				});
			}

			const newCircle = L.circle([latitude, longitude], {
				radius: radius || 100,
				color: "#3388ff",
				fillColor: "#3388ff",
				fillOpacity: 0.2,
			}).addTo(mapInstance);

			if (interactive && onPositionChange) {
				newMarker.on("dragend", (e) => {
					const position = e.target.getLatLng();
					onPositionChange(position.lat, position.lng);
					newCircle.setLatLng(position);
				});
			}

			setMarker(newMarker);
			setCircle(newCircle);
		}

		if (interactive) {
			mapInstance.on("click", (e) => {
				mapInstance.eachLayer((layer) => {
					if (
						layer instanceof L.Marker ||
						layer instanceof L.Circle
					) {
						mapInstance.removeLayer(layer);
					}
				});

				setMarker(null);
				setCircle(null);

				const newMarker = L.marker(e.latlng, {
					draggable: true,
				}).addTo(mapInstance);

				newMarker.on("drag", (e) => {
					const position = e.target.getLatLng();
					if (position.lat < -90) position.lat = -90;
					if (position.lat > 90) position.lat = 90;
					if (position.lng < -180) position.lng = -180;
					if (position.lng > 180) position.lng = 180;
					e.target.setLatLng(position);
				});

				const newCircle = L.circle(e.latlng, {
					radius: radius || 100,
					color: "#3388ff",
					fillColor: "#3388ff",
					fillOpacity: 0.2,
				}).addTo(mapInstance);

				newMarker.on("dragend", (e) => {
					const position = e.target.getLatLng();
					if (onPositionChange)
						onPositionChange(position.lat, position.lng);
					newCircle.setLatLng(position);
				});

				setMarker(newMarker);
				setCircle(newCircle);

				if (onPositionChange)
					onPositionChange(e.latlng.lat, e.latlng.lng);
			});
		}

		return () => {
			mapInstance.remove();
		};
	}, [interactive, latitude, longitude, onPositionChange, radius]);

	useEffect(() => {
		if (map) {
			if (latitude && longitude) {
				map.setView([latitude, longitude], map.getZoom());

				if (marker && map.hasLayer(marker)) {
					marker.setLatLng([latitude, longitude]);
				} else {
					const newMarker = L.marker([latitude, longitude], {
						draggable: interactive,
					}).addTo(map);

					if (interactive) {
						newMarker.on("drag", (e) => {
							const position = e.target.getLatLng();
							if (position.lat < -90) position.lat = -90;
							if (position.lat > 90) position.lat = 90;
							if (position.lng < -180) position.lng = -180;
							if (position.lng > 180) position.lng = 180;
							e.target.setLatLng(position);
						});
					}

					const newCircle = L.circle([latitude, longitude], {
						radius: radius || 100,
						color: "#3388ff",
						fillColor: "#3388ff",
						fillOpacity: 0.2,
					}).addTo(map);

					if (interactive && onPositionChange) {
						newMarker.on("dragend", (e) => {
							const position = e.target.getLatLng();
							onPositionChange(position.lat, position.lng);
							newCircle.setLatLng(position);
						});
					}

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
	}, [
		latitude,
		longitude,
		map,
		marker,
		circle,
		radius,
		onPositionChange,
		interactive,
	]);

	useEffect(() => {
		if (circle && radius) {
			circle.setRadius(radius);
		}
	}, [circle, radius]);

	return (
		<div
			id="map"
			style={{ height: "400px", width: "100%", borderRadius: "8px" }}
		/>
	);
};
