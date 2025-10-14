/*****************************************************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      page.tsx  (Accepted/Ongoing Jobs)
* Author:    IT Project – Medical Pantry – Group 17
* Date:      25-09-2025
* Version:   1.5
* Purpose:   - Display list of currently accepted jobs 
*            - Show job source (stored in DB vs admin-created) 
*            - Provide actions: Confirm Pickup / Confirm Drop Off, View Details 
*            - Filter and sort jobs by proximity to volunteer (via browser location)
* 
* Note: Uses mock data for layout. Real job data will later include coordinates
*       to enable automatic distance-based filtering.
* 
* Revisions: 
* v1.0 - 24-09-2025 - Initial implementation of basic layout of ongoing job page
* v1.1 - 25-09-2025 - Logo placement & interaction: clicking "Confirm Pickup" changes job status.
* v1.2 - 30-09-2025 - Updated formatting to match other pages.
* v1.3 - 10-10-2025 - Moved page to dashboard/ongoingJobs with reusable header.
* v1.4 - 14-10-2025 - Added distance-based filter, sorting with GPS and add the sort-by dropdown.
******************************************************************************************/

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type JobStatus = 'PICKUP' | 'DROPOFF';
type SourceType = 'stored' | 'admin_temp';

type JobItem = {
  id: string;
  name: string;
  status: JobStatus;
  address: string;
  pickupTime: string;
  source: SourceType;
  // Optional: when real data arrives, include coordinates
  lat?: number;
  lng?: number;
};

export default function AcceptedJobsPage() {
  // --- Mock data for layout (no lat/lng here yet) ---
  const [jobs, setJobs] = useState<JobItem[]>([
    { id: '1', name: 'Item name', status: 'DROPOFF', address: '12 Example St, Melbourne VIC', pickupTime: 'Today 4:30 PM', source: 'stored' },
    { id: '2', name: 'Item name', status: 'DROPOFF', address: '45 River Rd, Carlton VIC', pickupTime: 'Today 5:15 PM', source: 'admin_temp' },
    { id: '3', name: 'Item name', status: 'PICKUP', address: '88 Station St, Fitzroy VIC', pickupTime: 'Tomorrow 9:00 AM', source: 'stored' },
    { id: '4', name: 'Item name', status: 'PICKUP', address: '5 King St, Docklands VIC', pickupTime: 'Tomorrow 11:00 AM', source: 'admin_temp' },
  ]);

  const sorted = useMemo(() => jobs.slice(), [jobs]); // base order

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
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
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

  // --- Filter and sort by distance ---
  const displayed = useMemo(() => {
    // Attach distance if we can compute it
    let list = sorted.map((j) => {
      const hasCoords = typeof j.lat === 'number' && typeof j.lng === 'number';
      const distanceKm =
        userLoc && hasCoords ? haversineKm(userLoc, { lat: j.lat!, lng: j.lng! }) : null;
      return { ...j, distanceKm };
    });

    // If location is set, filter only those *with known distance* beyond radius; keep unknowns visible.
    if (userLoc) {
      list = list.filter((j) => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
    }

    // Sort: place known-distance jobs first (asc/desc), unknown-distance jobs after
    if (userLoc) {
      list.sort((a, b) => {
        const da = a.distanceKm;
        const db = b.distanceKm;

        const aKnown = da != null;
        const bKnown = db != null;

        // Known distances before unknown
        if (aKnown && !bKnown) return -1;
        if (!aKnown && bKnown) return 1;

        // Both unknown: keep original order
        if (!aKnown && !bKnown) return 0;

        // Both known: sort by chosen order
        return sortOrder === 'nearest' ? (da! - db!) : (db! - da!);
      });
    }

    return list;
  }, [sorted, userLoc, radiusKm, sortOrder]);

  // --- Confirm logic (mock) ---
  const onConfirm = (job: JobItem) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === job.id
          ? { ...j, status: j.status === 'PICKUP' ? 'DROPOFF' : 'DROPOFF' }
          : j
      )
    );
    alert(
      `${job.status === 'PICKUP' ? 'Pickup' : 'Drop Off'} confirmed for "${job.name}" (mock)`
    );
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">

      {/* Page title panel */}
      <section className="max-w-6xl mx-auto px-6 py-5 space-y-5">
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
          <h1 className="text-2xl font-semibold">Ongoing Jobs</h1>
        </div>

        {/* Distance filter controls */}
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

          {/* Sort dropdown (always usable; applies once location exists) */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'nearest' | 'farthest')}
              className="rounded-md border px-2 py-1 text-sm"
              aria-label="Sort by distance"
              title={!userLoc ? 'Sorting applies once location is set' : 'Sort by distance'}
            >
              <option value="nearest">Ascending </option>
              <option value="farthest">Descending </option>
            </select>
          </div>
        </div>

        {/* Scrollable job list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <div className="rounded-lg bg-[#11183A] h-[1150px] mx-auto w-full rounded-lg border px-4 md:px-6 lg:px-8 py-6 space-y-5 overflow-y-auto">
              {displayed.map((job) => (
                <JobCard key={job.id} job={job} onConfirm={onConfirm} />
              ))}

              {displayed.length === 0 && (
                <div className="rounded-2xl bg-white p-6 text-center text-neutral-600 shadow-sm">
                  {userLoc
                    ? 'No accepted jobs within this distance.'
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

/* -------------------- Presentational components -------------------- */

function JobCard({
  job,
  onConfirm,
}: {
  job: JobItem & { distanceKm?: number | null };
  onConfirm: (job: JobItem) => void;
}) {
  const confirmLabel =
    job.status === 'PICKUP' ? 'Confirm Pickup' : 'Confirm Drop Off';
  const sourceBadge =
    job.source === 'stored'
      ? { text: 'Stored in DB', classes: 'bg-emerald-100 text-emerald-700' }
      : { text: 'Admin-created', classes: 'bg-amber-100 text-amber-700' };

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-xl font-extrabold">{job.name}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${sourceBadge.classes}`}
        >
          {sourceBadge.text}
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <div>
          <span className="font-semibold">Status:</span>{' '}
          {job.status === 'PICKUP' ? 'Awaiting pickup' : 'Awaiting drop off'}
        </div>
        <div>
          <span className="font-semibold">Address:</span> {job.address}
        </div>
        {typeof (job as any).distanceKm === 'number' && (
          <div>
            <span className="font-semibold">Distance:</span>{' '}
            {(job as any).distanceKm!.toFixed(1)} km
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="text-sm">
          <span className="font-semibold">Pick up time:</span> {job.pickupTime}
        </div>

        <div className="flex gap-3 justify-start sm:justify-end">
          <button
            onClick={() => onConfirm(job)}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-700"
          >
            {confirmLabel}
          </button>

          <Link
            href={`/jobs/${job.id}`}
            className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
