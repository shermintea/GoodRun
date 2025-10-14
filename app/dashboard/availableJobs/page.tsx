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

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Urgency = 'LOW' | 'MEDIUM' | 'HIGH';

type JobItem = {
    id: string;
    title: string;
    summary?: string;
    address?: string;
    lat?: number;   // optional until backend provides coords
    lng?: number;
    urgency?: Urgency; // defaults to MEDIUM in UI
};

export default function AvailableJobsPage() {
    /* -------- Mock data (include urgency/coords for demo) -------- */
    const [jobs] = useState<JobItem[]>([
        { id: '1', title: 'Job example 1', summary: 'Food hamper pickup – Carlton', lat: -37.8136, lng: 144.9631, urgency: 'HIGH' },
        { id: '2', title: 'Job example 2', summary: 'Donation pickup – CBD', lat: -37.8000, lng: 144.9660, urgency: 'MEDIUM' },
        { id: '3', title: 'Job example 3', summary: 'Grocery delivery – Richmond', urgency: 'LOW' },
        { id: '4', title: 'Job example 4', summary: 'Urgent pickup – Docklands', lat: -37.8211, lng: 144.9520, urgency: 'HIGH' },
        { id: '5', title: 'Job example 5', summary: 'Local drop-off – Fitzroy', urgency: 'MEDIUM' },
        { id: '6', title: 'Job example 6', summary: 'Parcel delivery – Parkville', lat: -37.7945, lng: 144.9780, urgency: 'LOW' },
    ]);

    /* -------- Filter state (identical to Ongoing) -------- */
    const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
    const [radiusKm, setRadiusKm] = useState<number>(10);
    const [applyRadius, setApplyRadius] = useState<boolean>(true);
    const [sortOrder, setSortOrder] = useState<'nearest' | 'farthest'>('nearest');
    const [urgencySort, setUrgencySort] = useState<'none' | 'highFirst' | 'lowFirst'>('none');

    /* -------- Auto-use geolocation if permission is already granted -------- */
    useEffect(() => {
        const tryAutoGeo = async () => {
            try {
                // @ts-expect-error: permissions typing not universal
                const status = await navigator.permissions?.query?.({ name: 'geolocation' });
                if (status?.state === 'granted') {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                        () => { }
                    );
                }
            } catch {
                // ignore if Permissions API not supported
            }
        };
        tryAutoGeo();
    }, []);

    /* -------- Distance helpers -------- */
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
    const urgencyRank = (u: Urgency) => (u === 'HIGH' ? 3 : u === 'MEDIUM' ? 2 : 1);

    /* -------- Compute filtered/sorted list -------- */
    const displayed = useMemo(() => {
        let list = jobs.map(j => {
            const has = typeof j.lat === 'number' && typeof j.lng === 'number';
            const distanceKm = userLoc && has ? haversineKm(userLoc, { lat: j.lat!, lng: j.lng! }) : null;
            return { ...j, urgency: j.urgency ?? 'MEDIUM', distanceKm };
        });

        // Limit to radius (optional). Unknown-distance stays visible.
        if (userLoc && applyRadius) {
            list = list.filter(j => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
        }

        // Sort by urgency (optional)
        if (urgencySort !== 'none') {
            list.sort((a, b) => {
                const diff = urgencyRank(b.urgency as Urgency) - urgencyRank(a.urgency as Urgency); // HIGH→LOW
                return urgencySort === 'highFirst' ? diff : -diff; // LOW→HIGH
            });
        }

        // Sort by distance: known first; then nearest/farthest
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
    }, [jobs, userLoc, radiusKm, applyRadius, sortOrder, urgencySort]);

    /* -------- UI helpers -------- */
    const urgencyBadge = (u: Urgency) =>
        u === 'HIGH'
            ? { text: 'High', classes: 'bg-rose-100 text-rose-700' }
            : u === 'LOW'
                ? { text: 'Low', classes: 'bg-sky-100 text-sky-700' }
                : { text: 'Medium', classes: 'bg-amber-100 text-amber-700' };

    /* -------- Render -------- */
    return (
        <main className="min-h-screen bg-gray-50">
            <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
                {/* Title */}
                <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
                    <h1 className="text-2xl font-semibold">Available Jobs</h1>
                </div>

                {/* Controls (identical 3-tile layout to Ongoing) */}
                <div className="rounded-xl bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Distance */}
                        <div className="rounded-lg border p-3">
                            <div className="text-xs font-medium text-gray-500 mb-2">Distance (km)</div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={1}
                                    max={50}
                                    step={1}
                                    value={radiusKm}
                                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                                    className="w-full accent-red-600"
                                />
                                <span className="text-sm w-8 text-right">{radiusKm}</span>
                            </div>
                            {!userLoc && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Tip: allow location in browser to enable distance sorting.
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    id="limit-radius"
                                    type="checkbox"
                                    checked={applyRadius}
                                    onChange={(e) => setApplyRadius(e.target.checked)}
                                    disabled={!userLoc}
                                />
                                <label htmlFor="limit-radius" className={`text-sm ${!userLoc ? 'text-gray-400' : ''}`}>
                                    Limit to radius
                                </label>
                            </div>
                        </div>

                        {/* Sort by distance */}
                        <div className="rounded-lg border p-3">
                            <div className="text-xs font-medium text-gray-500 mb-2">Sort by distance</div>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'nearest' | 'farthest')}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                disabled={!userLoc}
                                title={!userLoc ? 'Enable location to sort by distance' : 'Sort by distance'}
                            >
                                <option value="nearest">Nearest first</option>
                                <option value="farthest">Farthest first</option>
                            </select>
                        </div>

                        {/* Sort by urgency */}
                        <div className="rounded-lg border p-3">
                            <div className="text-xs font-medium text-gray-500 mb-2">Sort by urgency</div>
                            <select
                                value={urgencySort}
                                onChange={(e) => setUrgencySort(e.target.value as 'none' | 'highFirst' | 'lowFirst')}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                aria-label="Sort by urgency"
                            >
                                <option value="none">None</option>
                                <option value="highFirst">Highest first</option>
                                <option value="lowFirst">Lowest first</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                        <div className="h-[400px] md:h-[600px] w-full rounded-lg border border-gray-200 bg-slate-100 text-slate-600 px-4 py-4 overflow-y-auto space-y-4">
                            {displayed.map((job) => {
                                const badge = urgencyBadge(job.urgency as Urgency);
                                return (
                                    <Link
                                        key={job.id}
                                        href={`/jobs/${job.id}`}
                                        className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="font-semibold text-[#171e3a]">{job.title}</h2>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.classes}`}>
                                                {badge.text}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-600">{job.summary ?? 'View details'}</p>
                                        {typeof (job as any).distanceKm === 'number' && (
                                            <p className="mt-2 text-sm text-gray-700">
                                                Distance: {(job as any).distanceKm!.toFixed(1)} km
                                            </p>
                                        )}
                                    </Link>
                                );
                            })}

                            {displayed.length === 0 && (
                                <div className="rounded-lg bg-white p-6 text-center text-neutral-600 shadow-sm border border-gray-200">
                                    {userLoc
                                        ? 'No available jobs match these filters.'
                                        : 'Allow location (browser/site settings) to filter by distance, or adjust urgency sort.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
