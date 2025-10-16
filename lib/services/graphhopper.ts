/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/services/graphhopper.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      16-10-2025
* Version:   1.0
* Purpose:   Interacts with GraphHopper Routing API.
*            Provides functions to fetch routes between two locations
* Revisions:
* v1.0 - Initial implementation
*******************************************************/

export const getGraphHopperRoute = async (
    from: {lat: number; lng: number},
    to: {lat: number; lng: number}
) => {
    const key = process.env.NEXT_PUBLIC_GRAPHHOPPER_KEY;
    const url = `https://graphhopper.com/api/1/route?point=${from.lat},${from.lng}&point=${to.lat},${to.lng}&vehicle=car&locale=en&points_encoded=false&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.paths[0].points.coordinates.map(([lon,lat]: [number, number]) => [lat, lon]);
};