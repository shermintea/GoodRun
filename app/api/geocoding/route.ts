/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/geocoding/route.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      19-10-2025
* Version:   1.1
* Purpose:   Translate addresses to coordinates (lat/lng)
*            using LocationIQ API, with detailed error
*            reporting for debugging and rate-limit handling.
* Revisions:
* v1.0 - Initial implementation
* v1.1 - Added verbose logging and safer error handling
* v2.0 - Translate addresses to coordinates (lat/lng)
*            via LocationIQ with detailed error reporting.
*******************************************************/


import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  const key = process.env.GEOCODING_KEY;
  if (!key) {
    console.error("GEOCODING_KEY not set in environment variables.");
    return NextResponse.json({ error: "GEOCODING_KEY not set on server" }, { status: 500 });
  }

  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${encodeURIComponent(
      address
    )}&format=json`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[Geocoding] LocationIQ error:", res.status, text);
      return NextResponse.json(
        { error: "LocationIQ request failed", status: res.status, details: text || "No body" },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      const location = {
        latitude: parseFloat(first.lat),
        longitude: parseFloat(first.lon),
        formattedAddress: first.display_name,
      };
      return NextResponse.json(location, { status: 200 });
    }

    return NextResponse.json({ error: "No results found", address }, { status: 404 });
  } catch (err: any) {
    console.error(`[Geocoding] Error for "${address}":`, err);
    return NextResponse.json(
      { error: "Server error while geocoding", details: err?.message },
      { status: 500 }
    );
  }
}
