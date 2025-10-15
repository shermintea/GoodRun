/*****************************************************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      page.tsx  (Accepted/Ongoing Jobs)
* Author:    IT Project – Medical Pantry – Group 17
* Date:      25-09-2025
* Version:   2.0
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
* v2.0 - Show the current volunteer’s ongoing jobs fed from Postgres.
******************************************************************************************/

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* ---------- Types ---------- */

type JobStatus = "PICKUP" | "DROPOFF";
type SourceType = "stored" | "admin_temp";
type Urgency = "LOW" | "MEDIUM" | "HIGH";

type JobItem = {
  id: string;
  name: string;
  status: JobStatus;            // derives from DB stage
  address: string;
  pickupTime: string;           // human readable
  source: SourceType;           // API returns "stored"
  lat?: number;                 // optional until you add in DB
  lng?: number;
  urgency?: Urgency;            // optional; default MEDIUM
};

/* ---------- Data hook: load & poll ongoing jobs ---------- */

function useOngoingJobs() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
      try {
        const res = await fetch("/api/jobs/ongoing", { cache: "no-store" });
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) {
          setError(data?.error ?? "Failed to load jobs");
        } else {
          setJobs(Array.isArray(data.jobs) ? data.jobs : []);
          setError("");
        }
      } catch {
        if (alive) setError("Failed to load jobs");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    timer = setInterval(load, 8000); // poll so admin-created jobs appear

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  return { jobs, setJobs, loading, error };
}

/* ---------- Page ---------- */

export default function OngoingJobsPage() {
  const { jobs, setJobs, loading, error } = useOngoingJobs();

  // distance / urgency UI
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [applyRadius, setApplyRadius] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<"nearest" | "farthest">("nearest");
  const [urgencySort, setUrgencySort] = useState<"none" | "highFirst" | "lowFirst">("none");

  // try to read user location without prompting if already granted
  useEffect(() => {
    (async () => {
      try {
        if (typeof navigator !== "undefined" && "permissions" in navigator) {
          // @ts-ignore - permissions is not fully typed in TS DOM
          const st = await navigator.permissions?.query?.({ name: "geolocation" });
          if (st?.state === "granted") {
            navigator.geolocation.getCurrentPosition(
              (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
              () => {}
            );
          }
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // helpers
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
  const urgencyRank = (u: Urgency) => (u === "HIGH" ? 3 : u === "MEDIUM" ? 2 : 1);

  // compute displayed list with distance + urgency logic
  const displayed = useMemo(() => {
    let list = jobs.map((j) => {
      const has = typeof j.lat === "number" && typeof j.lng === "number";
      const distanceKm = userLoc && has ? haversineKm(userLoc, { lat: j.lat!, lng: j.lng! }) : null;
      return { ...j, urgency: j.urgency ?? "MEDIUM", distanceKm };
    });

    if (userLoc && applyRadius) {
      list = list.filter((j) => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
    }

    if (urgencySort !== "none") {
      list.sort((a, b) => {
        const diff = urgencyRank(b.urgency as Urgency) - urgencyRank(a.urgency as Urgency); // HIGH→LOW
        return urgencySort === "highFirst" ? diff : -diff; // LOW→HIGH
      });
    }

    if (userLoc) {
      list.sort((a, b) => {
        const da = a.distanceKm,
          db = b.distanceKm;
        const aKnown = da != null,
          bKnown = db != null;
        if (aKnown && !bKnown) return -1;
        if (!aKnown && bKnown) return 1;
        if (!aKnown && !bKnown) return 0;
        return sortOrder === "nearest" ? (da! - db!) : (db! - da!);
      });
    }

    return list;
  }, [jobs, userLoc, radiusKm, applyRadius, sortOrder, urgencySort]);

  // confirm handler → advance stage in DB
  const onConfirm = async (job: JobItem) => {
    try {
      const res = await fetch(`/api/jobs/${job.id}/advance`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "Failed to update job");
        return;
      }

      // optimistic UI:
      //  - PICKUP confirmed → show as DROPOFF
      //  - DROPOFF confirmed → remove (will be delivered)
      setJobs((prev) =>
        job.status === "PICKUP"
          ? prev.map((j) => (j.id === job.id ? { ...j, status: "DROPOFF" } : j))
          : prev.filter((j) => j.id !== job.id)
      );
    } catch {
      alert("Network error");
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <section className="max-w-6xl mx-auto px-6 py-5 space-y-5">
        {/* Header */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
          <h1 className="text-2xl font-semibold">Ongoing Jobs</h1>
        </div>

        {/* Controls */}
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
                  Tip: allow location in the browser to enable distance sorting.
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
                <label
                  htmlFor="limit-radius"
                  className={`text-sm ${!userLoc ? "text-gray-400" : ""}`}
                >
                  Limit to radius
                </label>
              </div>
            </div>

            {/* Sort by distance */}
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Sort by distance</div>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value as "nearest" | "farthest")
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                disabled={!userLoc}
                title={
                  !userLoc
                    ? "Enable location to sort by distance"
                    : "Sort by distance"
                }
              >
                <option value="nearest">Nearest</option>
                <option value="farthest">Farthest</option>
              </select>
            </div>

            {/* Sort by urgency */}
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Sort by urgency</div>
              <select
                value={urgencySort}
                onChange={(e) =>
                  setUrgencySort(e.target.value as "none" | "highFirst" | "lowFirst")
                }
                className="w-full rounded-md border px-3 py-2 text-sm"
                aria-label="Sort by urgency"
              >
                <option value="none">None</option>
                <option value="highFirst">Highest</option>
                <option value="lowFirst">Lowest</option>
              </select>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-lg bg-[#11183A] h-[1150px] mx-auto w-full border px-4 md:px-6 lg:px-8 py-6 space-y-5 overflow-y-auto">
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-center text-neutral-600 shadow-sm">
              Loading jobs…
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700 shadow-sm">
              {error}
            </div>
          ) : displayed.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center text-neutral-600 shadow-sm">
              No accepted jobs yet. When an admin assigns you a job it will appear here automatically.
            </div>
          ) : (
            displayed.map((job) => (
              <JobCard
                key={job.id}
                job={job as JobItem & { distanceKm?: number | null }}
                onConfirm={onConfirm}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

/* ---------- Presentational card ---------- */

function JobCard({
  job,
  onConfirm,
}: {
  job: JobItem & { distanceKm?: number | null };
  onConfirm: (job: JobItem) => void;
}) {
  const confirmLabel = job.status === "PICKUP" ? "Confirm Pickup" : "Confirm Drop Off";
  const sourceBadge =
    job.source === "stored"
      ? { text: "Stored in DB", classes: "bg-emerald-100 text-emerald-700" }
      : { text: "Admin-created", classes: "bg-amber-100 text-amber-700" };

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
          <span className="font-semibold">Status:</span>{" "}
          {job.status === "PICKUP" ? "Awaiting pickup" : "Awaiting drop off"}
        </div>
        <div>
          <span className="font-semibold">Address:</span> {job.address}
        </div>
        {typeof job.distanceKm === "number" && (
          <div>
            <span className="font-semibold">Distance:</span>{" "}
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

2/2







