/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/job/[id]/jobMapView.tsx
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
import {MapContainer, TileLayer, Marker, Popup, Polyline, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {getGraphHopperRoute} from "@/lib/services/graphhopper";

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

// create custom SVG job marker
const jobSvgIcon = L.divIcon({
  html: `
    <svg width="24" height="24" viewBox="0 0 24 24">
      <polygon 
        points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" fill="#007498" stroke="white" stroke-width="1"/>
    </svg>
  `,
  className: "leaflet-div-icon",   // ← one-line fix so pin renders
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12], 
});

// auto fit map for best display
const FitBounds = ({
  userLocation,
  jobLocation,
}: {
  userLocation: { lat: number; lng: number };
  jobLocation: { lat: number; lng: number };
}) => {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds([userLocation, jobLocation]);
    map.fitBounds(bounds, {padding: [50, 50]});
  }, [map, userLocation, jobLocation]);
  return null;
};

export default function JobMapView({ jobLocation }: JobMapViewProps) {
  const [userLocation, setUserLocation] =
    useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
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

  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation) return;
      try {
        const coords = await getGraphHopperRoute(userLocation, jobLocation);
        setRoute(coords);
      } catch (error) {
        console.error("Error fetching GraphHopper route:", error);
      }
    };
    fetchRoute();
  }, [userLocation, jobLocation]);

  if (!userLocation)
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        Loading map . . .
      </div>
    );

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here !</Popup>
      </Marker>

      <Marker position={[jobLocation.lat, jobLocation.lng]} icon={jobSvgIcon}>
        <Popup>Job Location</Popup>
      </Marker>

      {route.length > 0 && <Polyline positions={route} color="blue" weight={4} />}

      <FitBounds userLocation={userLocation} jobLocation={jobLocation} />
    </MapContainer>
  );
}
