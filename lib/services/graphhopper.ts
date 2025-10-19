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
* v1.1 - Move call to GraphHopper from client-side to server-side by
*        calling internal API route instead.
*******************************************************/

export const getGraphHopperRoute = async (
    from: {lat:number; lng: number},
    to: {lat:number; lng: number}
) => {
    const res = await fetch(`/api/graphhopper/route?fromLat=${from.lat}&fromLng=${from.lng}&toLat=${to.lat}&toLng=${to.lng}`);
    const data = await res.json();
    return data.paths[0].points.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]);
};