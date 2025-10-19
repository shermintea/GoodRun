/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/geocoding/route.ts  
* Author:    IT Project – Medical Pantry – Group 17
* Date:      19-10-2025
* Version:   1.0
* Purpose:   Provide a service that translates addresses to coordinates.
* Revisions:
*
*******************************************************/

// npm install node-geocode

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  const key = process.env.GEOCODING_KEY;
  if (!key) {
    return NextResponse.json({ error: "GEOCODING_KEY not set" }, { status: 500 });
  }

  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${encodeURIComponent(address)}&format=json`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: `LocationIQ request failed: ${res.status}` }, { status: 500 });
    }

    const data = await res.json();

    if (data && data.length > 0) {
      const location = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        formattedAddress: data[0].display_name,
      };
      console.log(`Geocoded "${address}" -> (${location.latitude}, ${location.longitude})`);
      return NextResponse.json(location);
    } else {
      return NextResponse.json({ message: "No results found" }, { status: 404 });
    }
  } catch (err: any) {
    console.error(`Error geocoding "${address}":`, err);
    return NextResponse.json({ error: "Server error while geocoding" }, { status: 500 });
  }
}
