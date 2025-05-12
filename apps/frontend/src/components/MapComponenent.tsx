'use client'

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  latitude: number;
  longitude: number;
  radius: number;
  onPositionChange: (lat: number, lng: number) => void;
}

export const MapComponent = ({ latitude, longitude, radius, onPositionChange }: MapComponentProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [circle, setCircle] = useState<L.Circle | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mapInstance = L.map('map').setView([latitude || -6.2088, longitude || 106.8456], 13);

    // Gunakan MapTiler basemap
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=l1lKcXOmHNvH2YPTkRWZ', {
      attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">© MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
    }).addTo(mapInstance);

    setMap(mapInstance);

    // Tambahkan marker jika latitude dan longitude ada
    if (latitude && longitude) {
      const newMarker = L.marker([latitude, longitude], {
        draggable: true
      }).addTo(mapInstance);
      
      const newCircle = L.circle([latitude, longitude], {
        radius: radius || 100,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2
      }).addTo(mapInstance);

      newMarker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        onPositionChange(position.lat, position.lng);
        newCircle.setLatLng(position);
      });

      setMarker(newMarker);
      setCircle(newCircle);
    }

    // Handle klik peta untuk menambahkan marker baru
    mapInstance.on('click', (e) => {
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        const newMarker = L.marker(e.latlng, {
          draggable: true
        }).addTo(mapInstance);
        
        const newCircle = L.circle(e.latlng, {
          radius: radius || 100,
          color: '#3388ff',
          fillColor: '#3388ff',
          fillOpacity: 0.2
        }).addTo(mapInstance);

        newMarker.on('dragend', (e) => {
          const position = e.target.getLatLng();
          onPositionChange(position.lat, position.lng);
          newCircle.setLatLng(position);
        });

        setMarker(newMarker);
        setCircle(newCircle);
      }
      
      onPositionChange(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (marker && latitude && longitude) {
      marker.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (circle && radius) {
      circle.setRadius(radius);
    }
  }, [radius]);

  return <div id="map" style={{ height: '400px', width: '100%', borderRadius: '8px' }} />;
};