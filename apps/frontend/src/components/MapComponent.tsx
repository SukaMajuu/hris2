"use client";

import L from "leaflet";
import { useState, useCallback, useEffect } from "react";

import { MapContainer, MapMarker, MapCircle, MapControls } from "./map";
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
	const [map, setMap] = useState<L.Map | null>(null);
	const [currentLat, setCurrentLat] = useState<number | undefined>(latitude);
	const [currentLng, setCurrentLng] = useState<number | undefined>(longitude);

	useEffect(() => {
		setCurrentLat(latitude);
		setCurrentLng(longitude);
	}, [latitude, longitude]);

	const handlePositionChange = useCallback(
		(lat: number, lng: number) => {
			setCurrentLat(lat);
			setCurrentLng(lng);
			if (onPositionChange) {
				onPositionChange(lat, lng);
			}
		},
		[onPositionChange]
	);

	const handleMapReady = useCallback((mapInstance: L.Map) => {
		setMap(mapInstance);
	}, []);

	return (
		<>
			<MapContainer
				initialLat={latitude}
				initialLng={longitude}
				interactive={interactive}
				onMapReady={handleMapReady}
			/>
			{map && (
				<>
					<MapMarker
						map={map}
						latitude={currentLat}
						longitude={currentLng}
						interactive={interactive}
						onPositionChange={handlePositionChange}
					/>
					{showRadius && (
						<MapCircle
							map={map}
							latitude={currentLat}
							longitude={currentLng}
							radius={radius}
						/>
					)}
					<MapControls
						map={map}
						interactive={interactive}
						onPositionChange={handlePositionChange}
					/>
				</>
			)}
		</>
	);
};
