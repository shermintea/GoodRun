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
*******************************************************/

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

export default function MapView() {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    useEffect(() => {
        if ("geolocation" in navigator){
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const {latitude, longitude} = pos.coords;
                    setUserLocation([latitude, longitude]);
                },
                (err) => {
                    console.error("Geolocation error: ", err);
                }
            );
        } else {
            console.warn("Geolocation not supported by this browser.");
        }
    }, []);

    return (
        <MapContainer
            center={userLocation || [-37.7963, 144.9614]} // fallback to UniMelb
            zoom={userLocation ? 15 : 12}
            style={{height: "400px", width: "100%"}}
        >
            <TileLayer
                attribution='&copy;<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userLocation && (
                <Marker position={userLocation}>
                <Popup>📍 You are here</Popup>
            </Marker>
            )}
        </MapContainer>
    );
}
