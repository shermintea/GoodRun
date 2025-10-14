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
* v1.0 - Initial implementation of basic layout of ongoing job page
* v1.1 - Logo placement & interaction: clicking "Confirm Pickup" changes job status.
* v1.2 - Updated formatting to match other pages.
* v1.3 - Moved page to dashboard/ongoingJobs with reusable header.
* v1.4 - Added distance-based filter, sorting with GPS and add the sort-by dropdown.
* v1.5 - Added urgency-based filter and adjust the format design
******************************************************************************************/

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type JobStatus = 'PICKUP' | 'DROPOFF';
type SourceType = 'stored' | 'admin_temp';
type Urgency = 'LOW' | 'MEDIUM' | 'HIGH';

type JobItem = {
  id: string;
  name: string;
  status: JobStatus;
  address: string;
  pickupTime: string;
  source: SourceType;
  lat?: number; // optional until DB provides coords
  lng?: number;
  urgency?: Urgency; // defaults to MEDIUM in UI
};

export default function OngoingJobsPage() {
  // Mock data (add lat/lng/urgency as backend provides)
  const [jobs, setJobs] = useState<JobItem[]>([
    { id: '1', name: 'Item name', status: 'DROPOFF', address: '12 Example St, Melbourne VIC', pickupTime: 'Today 4:30 PM', source: 'stored', urgency: 'HIGH' },
    { id: '2', name: 'Item name', status: 'DROPOFF', address: '45 River Rd, Carlton VIC', pickupTime: 'Today 5:15 PM', source: 'admin_temp', urgency: 'MEDIUM' },
    { id: '3', name: 'Item name', status: 'PICKUP', address: '88 Station St, Fitzroy VIC', pickupTime: 'Tomorrow 9:00 AM', source: 'stored', urgency: 'LOW' },
    { id: '4', name: 'Item name', status: 'PICKUP', address: '5 King St, Docklands VIC', pickupTime: 'Tomorrow 11:00 AM', source: 'admin_temp', urgency: 'HIGH' },
  ]);

  // Distance / urgency UI state (same as Available Jobs)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [applyRadius, setApplyRadius] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'nearest' | 'farthest'>('nearest');
  const [urgencySort, setUrgencySort] = useState<'none' | 'highFirst' | 'lowFirst'>('none');

  // Auto-use geolocation only if permission already granted (no prompt)
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
        // silently ignore if not supported
      }
    };
    tryAutoGeo();
  }, []);

  // Helpers
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

  // Compute list (urgency sort then distance sort; filter by radius if enabled)
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

  // Confirm logic (mock)
  const onConfirm = (job: JobItem) => {
    setJobs(prev =>
      prev.map(j =>
        j.id === job.id
          ? { ...j, status: j.status === 'PICKUP' ? 'DROPOFF' : 'DROPOFF' }
          : j
      )
    );
    alert(`${job.status === 'PICKUP' ? 'Pickup' : 'Drop Off'} confirmed for "${job.name}" (mock)`);
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <section className="max-w-6xl mx-auto px-6 py-5 space-y-5">
        {/* Header */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
          <h1 className="text-2xl font-semibold">Ongoing Jobs</h1>
        </div>

        {/* Controls (match Available Jobs) */}
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
            <div className="rounded-lg bg-[#11183A] h-[1150px] mx-auto w-full rounded-lg border px-4 md:px-6 lg:px-8 py-6 space-y-5 overflow-y-auto">
              {displayed.map((job) => (
                <JobCard key={job.id} job={job as JobItem & { distanceKm?: number | null }} onConfirm={onConfirm} />
              ))}

              {displayed.length === 0 && (
                <div className="rounded-2xl bg-white p-6 text-center text-neutral-600 shadow-sm">
                  {userLoc
                    ? 'No accepted jobs match these filters.'
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

/* -------------------- Presentational components -------------------- */

function JobCard({
  job,
  onConfirm,
}: {
  job: JobItem & { distanceKm?: number | null };
  onConfirm: (job: JobItem) => void;
}) {
  const confirmLabel = job.status === 'PICKUP' ? 'Confirm Pickup' : 'Confirm Drop Off';
  const sourceBadge =
    job.source === 'stored'
      ? { text: 'Stored in DB', classes: 'bg-emerald-100 text-emerald-700' }
      : { text: 'Admin-created', classes: 'bg-amber-100 text-amber-700' };

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-xl font-extrabold">{job.name}</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${sourceBadge.classes}`}>
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
        {typeof job.distanceKm === 'number' && (
          <div>
            <span className="font-semibold">Distance:</span>{' '}
            {job.distanceKm.toFixed(1)} km
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
