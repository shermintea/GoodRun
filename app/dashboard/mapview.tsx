/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      dashboard/mapview.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      07-10-2025
* Version:   1.0
* Purpose:   Client-side Leaflet map component displayed
*            on the volunteer dashboard, showing current
*            location markers and OpenStreetMap tiles
* Revisions:
* v1.0 - Initial implementation of Leaflet map and tracking
*        user location
* v1.2 - Added geocoding API functionality
* v1.3 - Extended API functionality to be more flexible and allow code
*        to be modified based on where it is called. Changed default to 
*        Medical Pantry's warehouse.
*******************************************************/
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

type Coordinates = [number, number];

interface MapViewProps {
    addresses?: string[];            // destination addresses
    showUserLocation?: boolean;      // whether to show user's location
    fallbackCenter?: Coordinates;    // default center if no data
    zoom?: number;                   // default zoom
}

type Destination = {
    coords: Coordinates;
    label: string;
};

export default function MapView({
    addresses = [],
    showUserLocation = true,
    fallbackCenter = [-37.7963, 144.9614], // default center
    zoom = 12,
}: MapViewProps) {
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [destinations, setDestinations] = useState<Destination[]>([]);

    // Fetch user's location if requested
    useEffect(() => {
        if (showUserLocation && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.error("Geolocation error:", err)
            );
        }
    }, [showUserLocation]);

    // Fetch coordinates for addresses
    useEffect(() => {
        async function fetchCoordinates(address: string): Promise<Coordinates | null> {
            try {
                const res = await fetch(`/api/geocoding?address=${encodeURIComponent(address)}`);
                if (!res.ok) return null;
                const data = await res.json();
                if (data.latitude && data.longitude) return [data.latitude, data.longitude];
                return null;
            } catch (err) {
                console.error(`Error fetching coordinates for "${address}":`, err);
                return null;
            }
        }

        async function loadDestinations() {
            const coords: Destination[] = [];
            for (const addr of addresses) {
                const result = await fetchCoordinates(addr);
                if (result) coords.push({ coords: result, label: addr });
            }
            setDestinations(coords);
        }

        if (addresses.length > 0) {
            loadDestinations();
        } else {
            setDestinations([]);
        }
    }, [addresses]);

    // Auto-fit map bounds component
    function FitBounds({ points }: { points: Coordinates[] }) {
        const map = useMap();
        useEffect(() => {
            if (points.length === 0) return;
            const bounds = L.latLngBounds(points.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }, [points, map]);
        return null;
    }

    // Combine user location + destinations for bounds
    const allPoints: Coordinates[] = [
        ...(showUserLocation && userLocation ? [userLocation] : []),
        ...destinations.map((d) => d.coords),
    ];

    // Default center if no points yet
    const initialCenter = allPoints[0] || fallbackCenter;
    const initialZoom = zoom;

    return (
        <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: "400px", width: "100%" }}>
            <TileLayer
                attribution='&copy;<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showUserLocation && userLocation && (
                <Marker position={userLocation}>
                    <Popup>📍 You are here</Popup>
                </Marker>
            )}

            {destinations.map((dest, i) => (
                <Marker key={i} position={dest.coords}>
                    <Popup>📌 {dest.label}</Popup>
                </Marker>
            ))}

            {allPoints.length > 0 && <FitBounds points={allPoints} />}
        </MapContainer>
    );
}
