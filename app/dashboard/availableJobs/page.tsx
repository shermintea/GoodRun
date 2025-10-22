/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      availableJobs/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      24-09-2025
* Version:   1.6
* Purpose:   Dashboard where volunteers can see all available
*            jobs, consisting of a header with GoodRun logo on
*            the left, Dashboard + Profile buttons on the right,
*            and a scrollable list of jobs.
*            + Various filter and sort by features
* Revisions:
* v1.0 - Initial page layout (front end)
* v1.1 - Updated header to use GoodRun branding
* v1.2 - Added Dashboard shortcut and replaced logo
* v1.3 - Moved page to dashboard/availableJobs, replaced with reusable header
* v1.4 - Added distance-based filter, sorting with GPS and add the sort-by dropdown.
* v1.5 - Added follow-up filter and sort by urgency
* v1.6 - Added package size filter 
*******************************************************/

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Role = "admin" | "volunteer" | undefined;
type Urgency = "LOW" | "MEDIUM" | "HIGH";
type PkgSize = "tiny" | "small" | "medium" | "large";

type JobRow = {
  id: number;
  name: string | null;
  address: string | null;
  package_size: string | null;
  progress_stage: string | null; // 'available' | 'in_delivery' | 'cancelled_in_delivery' | ...
  lat?: number | null;
  lng?: number | null;

  // SOURCE OF TRUTH for urgency:
  intake_priority?: "low" | "medium" | "high" | string | null;

  // legacy / noisy field from list API — IGNORE
  urgency?: unknown;

  follow_up?: boolean | 0 | 1 | null;
};

type JobsApiResponse = { jobs?: JobRow[]; error?: string };

// --- helpers ---
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

const normalizeUrgency = (intake_priority: JobRow["intake_priority"]): Urgency | null => {
  if (intake_priority == null) return null;
  const v = String(intake_priority).trim().toLowerCase();
  if (v === "high") return "HIGH";
  if (v === "medium") return "MEDIUM";
  if (v === "low") return "LOW";
  return null;
};

const urgencyRank = (u: Urgency | null) =>
  u === "HIGH" ? 3 : u === "MEDIUM" ? 2 : u === "LOW" ? 1 : 0;

const statusPill = (stage: string | null | undefined) => {
  const s = (stage ?? "unknown").toLowerCase();
  if (s.includes("cancelled")) return "bg-gray-200 text-gray-700";
  if (s === "in_delivery") return "bg-blue-100 text-blue-700";
  if (s === "available") return "bg-green-100 text-green-700";
  return "bg-yellow-100 text-yellow-700";
};

const urgencyBadge = (u: Urgency | null) =>
  u === "HIGH"
    ? { text: "High", classes: "bg-rose-100 text-rose-700" }
    : u === "MEDIUM"
      ? { text: "Medium", classes: "bg-amber-100 text-amber-700" }
      : u === "LOW"
        ? { text: "Low", classes: "bg-sky-100 text-sky-700" }
        : { text: "—", classes: "bg-gray-100 text-gray-500" };

// --- new: package size helpers ---
const normalizeSize = (raw: string | null | undefined): PkgSize | null => {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (v.startsWith("tiny")) return "tiny";
  if (v.startsWith("small") || v === "s") return "small";
  if (v.startsWith("medium") || v === "m") return "medium";
  if (v.startsWith("large") || v === "l") return "large";
  return null;
};

// fetch just what we need from job details
async function fetchJobIntakePriority(id: number): Promise<string | null> {
  try {
    const r = await fetch(`/api/jobs/${id}`, { credentials: "include" });
    if (!r.ok) return null;
    const d = await r.json();
    const job = d?.job ?? d;
    const ip = job?.intake_priority;
    return ip == null ? null : String(ip);
  } catch {
    return null;
  }
}

// new: fetch follow_up + package_size (and intake as backup)
async function fetchJobDetails(
  id: number
): Promise<{ follow_up?: boolean | 0 | 1 | null; package_size?: string | null; intake_priority?: string | null } | null> {
  try {
    const r = await fetch(`/api/jobs/${id}`, { credentials: "include" });
    if (!r.ok) return null;
    const d = await r.json();
    const job = d?.job ?? d;
    return {
      follow_up: job?.follow_up ?? null,
      package_size: job?.package_size ?? null,
      intake_priority: job?.intake_priority ?? null,
    };
  } catch {
    return null;
  }
}

export default function AvailableJobsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as Role;

  // ---------- Data + status ----------
  const [jobsRaw, setJobsRaw] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const sessionLoading = status === "loading";

  // ---------- Filters ----------
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [applyRadius, setApplyRadius] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<"nearest" | "farthest">("nearest");
  const [urgencySort, setUrgencySort] = useState<"none" | "highFirst" | "lowFirst">("none");
  const [followUpFilter, setFollowUpFilter] = useState<"all" | "needs" | "no">("all");
  const [packageSizeFilter, setPackageSizeFilter] = useState<"all" | PkgSize>("all");

  // Track which jobs we’ve already hydrated to avoid loops
  const hydratedIds = useRef<Set<number>>(new Set());
  const hydratedDetails = useRef<Set<number>>(new Set());

  // Try auto-geolocation if already granted
  useEffect(() => {
    const tryAutoGeo = async () => {
      try {
        const anyNav: any = navigator;
        const st = await anyNav.permissions?.query?.({ name: "geolocation" as PermissionName });
        if (st?.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { }
          );
        }
      } catch { }
    };
    tryAutoGeo();
  }, []);

  // ---------- Fetch list ----------
  const load = async () => {
    setError(null);
    setActionMsg(null);
    setRefreshing(true);
    try {
      const res = await fetch("/api/jobs/available?includeCancelled=1", { credentials: "include" });
      const data: JobsApiResponse = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load jobs");
        setJobsRaw([]);
      } else {
        // normalize any numeric strings to numbers
        const rows = (Array.isArray(data.jobs) ? data.jobs : []).map((j) => ({
          ...j,
          lat: typeof j.lat === "string" ? parseFloat(j.lat) : j.lat,
          lng: typeof j.lng === "string" ? parseFloat(j.lng) : j.lng,
        }));
        setJobsRaw(rows);
        hydratedIds.current.clear(); // reset hydration tracker after a fresh load
        hydratedDetails.current.clear();
      }
    } catch {
      setError("Network error while loading jobs");
      setJobsRaw([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---------- Hydrate intake_priority when missing ----------
  useEffect(() => {
    // if urgency sorting is requested OR we want to show the badge accurately, fetch missing intake_priority
    const need = jobsRaw.filter(
      (j) =>
        (j.intake_priority == null || String(j.intake_priority).trim() === "") &&
        !hydratedIds.current.has(j.id)
    );
    if (need.length === 0) return;

    (async () => {
      const chunk = 5; // limit concurrency
      for (let i = 0; i < need.length; i += chunk) {
        const slice = need.slice(i, i + chunk);
        const results = await Promise.all(slice.map((j) => fetchJobIntakePriority(j.id)));
        // mark as hydrated to avoid re-fetch
        slice.forEach((j) => hydratedIds.current.add(j.id));
        // apply updates
        setJobsRaw((prev) =>
          prev.map((row) => {
            const idx = slice.findIndex((s) => s.id === row.id);
            if (idx === -1) return row;
            const ip = results[idx];
            return ip == null ? row : { ...row, intake_priority: ip as any };
          })
        );
      }
    })();
  }, [jobsRaw]);

  // ---------- Hydrate follow_up / package_size when missing ----------
  useEffect(() => {
    const need = jobsRaw.filter((j) => {
      const missingFollow = j.follow_up == null;
      const missingSize = !normalizeSize(j.package_size);
      return (missingFollow || missingSize) && !hydratedDetails.current.has(j.id);
    });

    if (need.length === 0) return;

    (async () => {
      const chunk = 5;
      for (let i = 0; i < need.length; i += chunk) {
        const slice = need.slice(i, i + chunk);
        const results = await Promise.all(slice.map((j) => fetchJobDetails(j.id)));

        // mark hydrated
        slice.forEach((j) => hydratedDetails.current.add(j.id));

        setJobsRaw((prev) =>
          prev.map((row) => {
            const idx = slice.findIndex((s) => s.id === row.id);
            if (idx === -1) return row;
            const d = results[idx];
            if (!d) return row;

            const next: JobRow = { ...row };

            // only fill if still missing, don't override non-empty
            if (next.follow_up == null && d.follow_up != null) next.follow_up = d.follow_up;
            if (!normalizeSize(next.package_size) && d.package_size) next.package_size = d.package_size;

            // keep intake synced if it was missing
            if (
              (next.intake_priority == null || String(next.intake_priority).trim() === "") &&
              d.intake_priority != null
            ) {
              next.intake_priority = d.intake_priority as any;
            }
            return next;
          })
        );
      }
    })();
  }, [jobsRaw]);

  // ---------- Actions ----------
  const reserve = async (id: number) => {
    if (role !== "volunteer") {
      setActionMsg("Only volunteers can reserve jobs.");
      return;
    }
    setActionMsg(null);
    try {
      const res = await fetch(`/api/jobs/${id}/reserve`, {
        method: "POST",
        credentials: "include",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setActionMsg(data?.error || "Could not reserve job");
      } else {
        setActionMsg("✅ Job reserved. Check your Ongoing Jobs.");
        setJobsRaw((prev) => prev.filter((j) => j.id !== id));
      }
    } catch {
      setActionMsg("Network error reserving job");
    }
  };

  const removeJob = async (id: number) => {
    if (role !== "admin") {
      setActionMsg("Only admins can delete jobs.");
      return;
    }
    if (!confirm(`Delete job #${id}? This cannot be undone.`)) return;

    setActionMsg(null);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setActionMsg(data?.error || "Failed to delete job");
      } else {
        setActionMsg("🗑️ Job deleted");
        setJobsRaw((prev) => prev.filter((j) => j.id !== id));
      }
    } catch {
      setActionMsg("Network error deleting job");
    }
  };

  // ---------- Compute filtered/sorted list ----------
  const displayed = useMemo(() => {
    let list = jobsRaw.map((j) => {
      const hasCoords = typeof j.lat === "number" && typeof j.lng === "number";
      const distanceKm =
        userLoc && hasCoords ? haversineKm(userLoc, { lat: j.lat!, lng: j.lng! }) : null;
      const u = normalizeUrgency(j.intake_priority); // ONLY intake_priority
      return { ...j, distanceKm, _urgency: u as Urgency | null };
    });

    // Visibility rules:
    list = list.filter((j: any) => {
      const stage = (j.progress_stage ?? "").toLowerCase();
      const isCancelledDelivery = stage === "cancelled_in_delivery";
      if (role !== "admin") return !isCancelledDelivery;
      if (followUpFilter === "needs") return isCancelledDelivery;
      if (followUpFilter === "no") return !isCancelledDelivery;
      return true; // "all"
    });

    // Package size filter
    if (packageSizeFilter !== "all") {
      list = list.filter((j: any) => normalizeSize(j.package_size) === packageSizeFilter);
    }

    // Radius filter
    if (userLoc && applyRadius) {
      list = list.filter((j: any) => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
    }

    // Urgency sort (optional) — unknown urgency goes last
    if (urgencySort !== "none") {
      list.sort((a: any, b: any) => {
        const diff = urgencyRank(b._urgency) - urgencyRank(a._urgency); // HIGH→LOW
        return urgencySort === "highFirst" ? diff : -diff; // LOW→HIGH
      });
    }

    // Distance sort
    if (userLoc) {
      list.sort((a: any, b: any) => {
        const da = a.distanceKm,
          db = b.distanceKm;
        const aKnown = da != null,
          bKnown = db != null;
        if (aKnown && !bKnown) return -1;
        if (!aKnown && bKnown) return 1;
        if (!aKnown && !bKnown) return 0;
        return sortOrder === "nearest" ? da - db : db - da;
      });
    }

    return list;
  }, [
    jobsRaw,
    userLoc,
    radiusKm,
    applyRadius,
    sortOrder,
    urgencySort,
    role,
    followUpFilter,
    packageSizeFilter,
  ]);

  // ---------- Render ----------
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Available Jobs</h1>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {actionMsg && <div className="rounded-lg border px-4 py-2 bg-white">{actionMsg}</div>}

        {/* Filters row */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {/* Distance tile */}
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
                  Tip: allow location in your browser to enable distance sorting.
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
                onChange={(e) => setSortOrder(e.target.value as "nearest" | "farthest")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                disabled={!userLoc}
                title={!userLoc ? "Enable location to sort by distance" : "Sort by distance"}
                aria-label="Sort by distance"
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
                onChange={(e) => setUrgencySort(e.target.value as "none" | "highFirst" | "lowFirst")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                aria-label="Sort by urgency"
              >
                <option value="none">None</option>
                <option value="highFirst">Highest first</option>
                <option value="lowFirst">Lowest first</option>
              </select>
            </div>

            {/* Package size filter */}
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Filter by package size</div>
              <select
                value={packageSizeFilter}
                onChange={(e) => setPackageSizeFilter(e.target.value as "all" | PkgSize)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                aria-label="Filter by package size"
              >
                <option value="all">None</option>
                <option value="tiny">Tiny</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Follow-up filter (admin only) */}
            {role === "admin" && (
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium text-gray-500 mb-2">Filter by follow-up</div>
                <select
                  value={followUpFilter}
                  onChange={(e) => setFollowUpFilter(e.target.value as "all" | "needs" | "no")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  aria-label="Filter by follow-up"
                >
                  <option value="all">All</option>
                  <option value="needs">Needs follow-up</option>
                  <option value="no">No follow-up</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {(loading || sessionLoading) && (
          <p className="text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-3">Loading…</p>
        )}
        {!loading && !sessionLoading && error && (
          <p className="text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-3">{error}</p>
        )}
        {!loading && !sessionLoading && !error && displayed.length === 0 && (
          <p className="text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
            No jobs match the current filters.
          </p>
        )}

        {/* Job Cards */}
        {!loading && !sessionLoading && !error && displayed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayed.map((j: any) => {
              const ub = urgencyBadge(j._urgency as Urgency | null);
              const sizeNorm = normalizeSize(j.package_size);
              return (
                <div key={j.id} className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-[#171e3a]">
                      {j.name ? j.name : `Job #${j.id}`}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs rounded-full px-3 py-1 ${statusPill(j.progress_stage)}`}>
                        {j.progress_stage ?? "unknown"}
                      </span>
                      <span className={`text-xs rounded-full px-2 py-1 ${ub.classes}`}>{ub.text}</span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Address:</span> {j.address ?? "—"}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span>{" "}
                      {sizeNorm ? sizeNorm[0].toUpperCase() + sizeNorm.slice(1) : (j.package_size ?? "—")}
                    </p>
                    {j.distanceKm != null && (
                      <p>
                        <span className="font-medium">Distance:</span> {j.distanceKm.toFixed(1)} km
                      </p>
                    )}
                    {role === "admin" && (
                      <p className="text-xs">
                        Follow-up:{" "}
                        <b>
                          {j.follow_up === true || j.follow_up === 1
                            ? "Yes"
                            : j.follow_up === false || j.follow_up === 0
                              ? "No"
                              : (j.progress_stage ?? "").toLowerCase() === "cancelled_in_delivery"
                                ? "Yes"
                                : "No"}
                        </b>
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <Link
                      href={`/dashboard/job/${j.id}`}
                      className="px-3 py-2 rounded border hover:bg-gray-50"
                    >
                      View Details
                    </Link>

                    {role === "admin" ? (
                      <button
                        type="button"
                        onClick={() => removeJob(j.id)}
                        className="px-3 py-2 rounded bg-red-700 text-white hover:bg-red-800"
                        title="Delete Job"
                      >
                        Delete Job
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reserve(j.id)}
                        className="px-3 py-2 rounded bg-red-700 text-white hover:bg-red-800"
                        title="Reserve Job"
                      >
                        Reserve Job
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
