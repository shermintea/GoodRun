/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/job\[id]/jobMapView.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      14-10-2025
* Version:   1.0
* Purpose:   Client-side Leaflet map component displayed
*            on the volunteer dashboard, showing current
*            location markers and OpenStreetMap tiles
* Revisions:
* v1.0 - Initial implementation of Leaflet map and tracking
*        user location
*******************************************************/

"use client";

import {useEffect, useState} from "react";
import {MapContainer, TileLayer, Marker, Popup, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface JobMapViewProps {
  jobLocation: { lat: number; lng: number };
}

export default function JobMapView( {jobLocation}: JobMapViewProps) {
    const [userLocation, setUserLocation] = useState <{ lat: number; lng: number} | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });
                },
                (err) => console.warn("Geolocation error:", err)
            );
        }
    }, []);

    // Bound map around markers
    const FitBounds = () => {
        const map = useMap();
        useEffect(() => {
            if (userLocation) {
                const bounds = L.latLngBounds([userLocation, jobLocation]);
                map.fitBounds(bounds, {padding: [50, 50]});
            }
        }, [map, userLocation]);
        return null;
    };

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={jobLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        <Marker position={jobLocation}>
          <Popup>Job Location</Popup>
        </Marker>
        {userLocation && <FitBounds />}
      </MapContainer>
    </div>
  );

}
