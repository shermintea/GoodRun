/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      availableJobs/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      24-09-2025
* Version:   1.4
* Purpose:   Dashboard where volunteers can see all available
*            jobs, consisting of a header with GoodRun logo on
*            the left, Dashboard + Profile buttons on the right,
*            and a scrollable list of jobs.
*            + Filter/sort by distance (GPS)
* Revisions:
* v1.0 - Initial page layout (front end)
* v1.1 - Updated header to use GoodRun branding
* v1.2 - Added Dashboard shortcut and replaced logo
* v1.3 - Moved page to dashboard/availableJobs, replaced with reusable header
* v1.4 - Added distance-based filter, sorting with GPS and add the sort-by dropdown.

*******************************************************/

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type JobItem = {
    id: string;
    title: string;
    summary?: string;
    // Optional coords; when present, distance calc works immediately.
    // When missing, items still show (sorted after known-distance items).
    lat?: number;
    lng?: number;
};

export default function AvailableJobsPage() {
    // --- Mock jobs (you can remove coords once DB provides them) ---
    const [jobs] = useState<JobItem[]>([
        { id: '1', title: 'Job example 1', summary: 'Clickable, takes user to job details.', lat: -37.8136, lng: 144.9631 },
        { id: '2', title: 'Job example 2', summary: 'Clickable, takes user to job details.', lat: -37.80, lng: 144.9660 },
        { id: '3', title: 'Job example 3', summary: 'Clickable, takes user to job details.' },
        { id: '4', title: 'Job example 4', summary: 'Clickable, takes user to job details.', lat: -37.8211, lng: 144.9520 },
        { id: '5', title: 'Job example 5', summary: 'Clickable, takes user to job details.' },
        { id: '6', title: 'Job example 6', summary: 'Clickable, takes user to job details.', lat: -37.7945, lng: 144.9780 },
    ]);

    // --- Distance filter state ---
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [radiusKm, setRadiusKm] = useState<number>(10);
    const [sortOrder, setSortOrder] = useState<'nearest' | 'farthest'>('nearest');

    const toRad = (x: number) => (x * Math.PI) / 180;
    const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
        const R = 6371;
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const lat1 = toRad(a.lat);
        const lat2 = toRad(b.lat);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    };

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation not supported in this browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => {
                console.error(err);
                alert('Could not retrieve your location.');
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    };

    // --- Compute filtered/sorted list with distance attached ---
    const displayed = useMemo(() => {
        let list = jobs.map((j) => {
            const hasCoords = typeof j.lat === 'number' && typeof j.lng === 'number';
            const distanceKm =
                userLoc && hasCoords ? haversineKm(userLoc, { lat: j.lat!, lng: j.lng! }) : null;
            return { ...j, distanceKm };
        });

        // If a location is set: filter out items beyond the radius.
        // Keep unknown-distance jobs visible so volunteers still see options.
        if (userLoc) {
            list = list.filter((j) => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
        }

        // Sort: known-distance items first (asc/desc), unknowns after in original order.
        if (userLoc) {
            list.sort((a, b) => {
                const da = a.distanceKm, db = b.distanceKm;
                const aKnown = da != null, bKnown = db != null;
                if (aKnown && !bKnown) return -1;
                if (!aKnown && bKnown) return 1;
                if (!aKnown && !bKnown) return 0;
                return sortOrder === 'nearest' ? (da! - db!) : (db! - da!);
            });
        }

        return list;
    }, [jobs, userLoc, radiusKm, sortOrder]);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Page content */}
            <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">

                {/* Page title panel */}
                <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
                    <h1 className="text-2xl font-semibold">Available Jobs</h1>
                </div>

                {/* Controls row (distance + sort) */}
                <div className="rounded-lg bg-white p-4 shadow-sm grid gap-3 md:grid-cols-3">
                    {/* GPS Button (no raw coords shown) */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={useMyLocation}
                            className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-2 text-white text-sm font-semibold"
                        >
                            Use my location
                        </button>
                        {userLoc && (
                            <span className="text-xs rounded-md bg-emerald-50 text-emerald-700 px-2 py-1">
                                Location set
                            </span>
                        )}
                    </div>

                    {/* Distance control */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium">Distance (km)</label>
                        <input
                            type="range"
                            min={1}
                            max={50}
                            step={1}
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(Number(e.target.value))}
                            className="w-full"
                        />
                        <span className="text-sm w-10 text-right">{radiusKm}</span>
                    </div>

                    {/* Sort dropdown */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Sort by:</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as 'nearest' | 'farthest')}
                            className="rounded-md border px-2 py-1 text-sm"
                            aria-label="Sort by distance"
                            title="Sort by distance"
                        >
                            <option value="nearest">Nearest first</option>
                            <option value="farthest">Farthest first</option>
                        </select>
                    </div>
                </div>

                {/* Main content area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Scrollable job list */}
                    <div className="md:col-span-3">
                        <div className="h-[400px] md:h-[600px] w-full rounded-lg border border-gray-200 bg-slate-100 text-slate-600 px-4 py-4 overflow-y-auto space-y-4">

                            {/* Render job cards */}
                            {displayed.map((job) => (
                                <a
                                    key={job.id}
                                    href="/job"
                                    className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <h2 className="font-semibold text-[#171e3a]">{job.title}</h2>
                                    <p className="mt-2 text-sm text-gray-600">
                                        {job.summary ?? 'Clickable, takes user to job details.'}
                                    </p>
                                    {typeof (job as any).distanceKm === 'number' && (
                                        <p className="mt-2 text-sm text-gray-700">
                                            Distance: {(job as any).distanceKm!.toFixed(1)} km
                                        </p>
                                    )}
                                </a>
                            ))}

                            {displayed.length === 0 && (
                                <div className="rounded-lg bg-white p-6 text-center text-neutral-600 shadow-sm border border-gray-200">
                                    {userLoc
                                        ? 'No available jobs within this distance.'
                                        : 'Use your location to filter by distance.'}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
