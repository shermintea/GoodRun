/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/services/graphhopper.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      16-10-2025
* Version:   2.0
* Purpose:   Interacts with GraphHopper Routing API.
*            Provides functions to fetch routes between two locations
* Revisions:
* v1.0 - Initial implementation
* v2.0 - Returns [] when no route is found or errors occur,
*            so the UI can render gracefully without crashing.
*******************************************************/

export type LatLng = { lat: number; lng: number };

/**
 * Fetch a route between two points from GraphHopper and return an array
 * of [lat, lng] pairs suitable for Leaflet Polyline.
 *
 * Will return [] on any error or if no path is available.
 */
export async function getGraphHopperRoute(
  from: LatLng,
  to: LatLng,
  opts: { vehicle?: "car" | "foot" | "bike" | "hike" | "motorcycle" } = {}
): Promise<[number, number][]> {
  const key = process.env.NEXT_PUBLIC_GRAPHHOPPER_KEY;
  if (!key) {
    console.error("[GraphHopper] Missing NEXT_PUBLIC_GRAPHHOPPER_KEY");
    return [];
  }

  const vehicle = opts.vehicle ?? "car";
  const url =
    `https://graphhopper.com/api/1/route` +
    `?point=${from.lat},${from.lng}` +
    `&point=${to.lat},${to.lng}` +
    `&vehicle=${encodeURIComponent(vehicle)}` +
    `&locale=en` +
    `&points_encoded=false` + // ensure we get GeoJSON-like coords
    `&key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Common statuses: 400 (bad params), 401/403 (bad key), 429 (rate limit)
      const text = await res.text().catch(() => "");
      console.error(`[GraphHopper] HTTP ${res.status}: ${text || "(no body)"}`);
      return [];
    }

    const data = await res.json();

    // Defensive guards against missing/empty paths
    const coords = data?.paths?.[0]?.points?.coordinates;
    if (!Array.isArray(coords) || coords.length === 0) {
      // Example when no route is possible: { paths: [] } or hints/messages
      if (data?.message) console.warn("[GraphHopper] message:", data.message);
      console.warn("[GraphHopper] No path returned.", data);
      return [];
    }

    // Convert GraphHopper [lon, lat] pairs to Leaflet-friendly [lat, lon]
    return coords.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );
  } catch (err: any) {
    console.error("[GraphHopper] Fetch error:", err?.message || err);
    return [];
  }
}
