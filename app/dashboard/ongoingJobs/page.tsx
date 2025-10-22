/*****************************************************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/ongoingJobs/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      25-09-2025
* Version:   3.2
* Purpose:   - Display currently accepted jobs
*            - Confirm Pickup / Drop-off transitions for volunteers
*            - Manual refresh, role-aware UI, safe feedback messages
*            - Distance-based filter/sort + optional priority sort + filter by package size
******************************************************************************************/

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Priority = "low" | "medium" | "high";
type PkgSize = "tiny" | "small" | "medium" | "large";

type JobRow = {
  id: number;
  name: string | null;
  address: string | null;
  assigned_to: number | null;
  follow_up: boolean;
  deadline_date: string;
  progress_stage: string;
  intake_priority: Priority | string;
  size?: string | null;          // <- may be "tiny" | "small" | "medium" | "large" | mixed casing

  // OPTIONAL coords; backend may provide for distance features
  lat?: number | string | null;
  lng?: number | string | null;
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  const x = new Date(d);
  if (isNaN(x.getTime())) return d;
  return x.toLocaleDateString();
}

// ----- distance helpers -----
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
const priorityRank = (p: Priority | string) => {
  const v = String(p).toLowerCase();
  return v === "high" ? 3 : v === "medium" ? 2 : 1;
};

// ----- package size helpers (mirrors Available Jobs) -----
function normalizeSize(raw: string | null | undefined): PkgSize | null {
  if (!raw) return null;
  const v = String(raw).trim().toLowerCase();
  if (v.startsWith("tiny")) return "tiny";
  if (v.startsWith("small") || v === "s") return "small";
  if (v.startsWith("medium") || v === "m") return "medium";
  if (v.startsWith("large") || v === "l") return "large";
  return null;
}
function sizeLabel(raw: string | null | undefined) {
  const n = normalizeSize(raw);
  return n ? n[0].toUpperCase() + n.slice(1) : (raw ?? "—");
}
function parseNum(n: unknown): number | null {
  if (n == null) return null;
  const v = typeof n === "string" ? parseFloat(n) : (n as number);
  return Number.isFinite(v) ? v : null;
}

export default function OngoingJobsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as "admin" | "volunteer" | undefined;

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // ---------- existing controls ----------
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [applyRadius, setApplyRadius] = useState<boolean>(true); // do not change behavior
  const [sortOrder, setSortOrder] = useState<"nearest" | "farthest">("nearest");
  const [prioritySort, setPrioritySort] = useState<"none" | "highFirst" | "lowFirst">("none");

  // ---------- NEW: package size filter ----------
  const [packageSizeFilter, setPackageSizeFilter] = useState<"all" | PkgSize>("all");

  // Auto-use geolocation if permission is already granted (unchanged)
  useEffect(() => {
    const tryAutoGeo = async () => {
      try {
        const status = await (navigator as any)?.permissions?.query?.({ name: "geolocation" as any });
        if (status?.state === "granted") {
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

  // ---------- Compute filtered/sorted list ----------
  const displayed = useMemo(() => {
    let list = jobs.map((j) => {
      const lat = parseNum(j.lat);
      const lng = parseNum(j.lng);
      const has = lat != null && lng != null;
      const distanceKm = userLoc && has ? haversineKm(userLoc, { lat, lng }) : null;
      return { ...j, distanceKm, _normSize: normalizeSize(j.size) };
    });

    // Package size filter (unknown/missing included only when "All sizes")
    if (packageSizeFilter !== "all") {
      list = list.filter((j: any) => j._normSize === packageSizeFilter);
    }

    // Limit to radius (unchanged behavior)
    if (userLoc && applyRadius) {
      list = list.filter((j: any) => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
    }

    // Sort by priority (optional)
    if (prioritySort !== "none") {
      list.sort((a: any, b: any) => {
        const diff = priorityRank(b.intake_priority) - priorityRank(a.intake_priority); // high -> low
        return prioritySort === "highFirst" ? diff : -diff; // low -> high
      });
    }

    // Sort by distance: known first; then nearest/farthest (unchanged)
    if (userLoc) {
      list.sort((a: any, b: any) => {
        const da = a.distanceKm as number | null;
        const db = b.distanceKm as number | null;
        const aKnown = da != null && Number.isFinite(da);
        const bKnown = db != null && Number.isFinite(db);
        if (aKnown && !bKnown) return -1;
        if (!aKnown && bKnown) return 1;
        if (!aKnown && !bKnown) return 0;
        return sortOrder === "nearest" ? da! - db! : db! - da!;
      });
    }

    return list;
  }, [jobs, userLoc, radiusKm, applyRadius, sortOrder, prioritySort, packageSizeFilter]);

  // Load all ongoing jobs (unchanged, with numeric coercion for coords)
  const load = async () => {
    setRefreshing(true);
    setError(null);
    setActionMsg(null);
    try {
      const res = await fetch("/api/jobs/ongoing", { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data?.error === "No ongoing jobs") {
          setJobs([]);
        } else {
          setError(data?.error || "Failed to load jobs");
          setJobs([]);
        }
      } else {
        const rows = (Array.isArray(data.jobs) ? (data.jobs as JobRow[]) : []).map((j) => ({
          ...j,
          lat: parseNum(j.lat),
          lng: parseNum(j.lng),
          size: j.size ?? (j as any).package_size ?? j.size, // accept size either way
        }));
        setJobs(rows);
      }
    } catch {
      setError("Network error while loading jobs");
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Volunteer actions (unchanged)
  const updateProgress = async (id: number, nextStage: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ progress_stage: nextStage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMsg(data?.error || "Failed to update job");
      } else {
        setActionMsg(
          nextStage === "in_delivery"
            ? "✅ Pick-up confirmed! Job now in delivery."
            : "✅ Drop-off confirmed! Job marked as completed."
        );
        await load();
      }
    } catch {
      setActionMsg("Network error updating job");
    }
  };

  const cancelJob = async (id: number) => {
    if (!confirm(`Cancel job #${id}?`)) return;
    setActionMsg(null);
    try {
      const res = await fetch(`/api/jobs/${id}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMsg(data?.error || "Failed to cancel job");
      } else {
        setActionMsg("🛑 Job cancelled");
        setJobs((prev) => prev.filter((j) => j.id !== id));
      }
    } catch {
      setActionMsg("Network error cancelling job");
    }
  };

  const sessionLoading = status === "loading";

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Ongoing Jobs</h1>
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh Jobs"}
          </button>
        </div>

        {/* -------- Controls: distance + priority + size -------- */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
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
                <p className="mt-2 text-xs text-gray-500">Tip: allow location in browser to enable distance sorting.</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="limit-radius"
                  type="checkbox"
                  checked={applyRadius}
                  onChange={(e) => setApplyRadius(e.target.checked)}
                  disabled={!userLoc}
                />
                <label htmlFor="limit-radius" className={`text-sm ${!userLoc ? "text-gray-400" : ""}`}>
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
              >
                <option value="nearest">Nearest first</option>
                <option value="farthest">Farthest first</option>
              </select>
            </div>

            {/* Sort by priority */}
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Sort by priority</div>
              <select
                value={prioritySort}
                onChange={(e) => setPrioritySort(e.target.value as any)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                aria-label="Sort by priority"
              >
                <option value="none">None</option>
                <option value="highFirst">Highest first</option>
                <option value="lowFirst">Lowest first</option>
              </select>
            </div>

            {/* NEW: Filter by package size */}
            <div className="rounded-lg border p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Filter by package size</div>
              <select
                value={packageSizeFilter}
                onChange={(e) => setPackageSizeFilter(e.target.value as "all" | PkgSize)}
                className="w-full rounded-md border px-3 py-2 text-sm"
                aria-label="Filter by package size"
              >
                <option value="all">All sizes</option>
                <option value="tiny">Tiny</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>

        {actionMsg && (
          <div className="rounded-lg border px-4 py-2 bg-white">{actionMsg}</div>
        )}

        {(loading || sessionLoading) && (
          <p className="text-gray-500 bg-white border border-gray-200 rounded-lg px-4 py-3">
            Loading…
          </p>
        )}
        {!loading && !sessionLoading && error && (
          <p className="text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        {!loading && !sessionLoading && !error && displayed.length === 0 && (
          <div className="rounded-xl bg-[#121a38] p-6 text-center text-gray-200">
            No accepted jobs yet. When an admin assigns you a job / you reserve a job, it will appear here.
          </div>
        )}

        {!loading && !sessionLoading && !error && displayed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayed.map((j: any) => (
              <div key={j.id} className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-[#171e3a]">
                    {j.name ?? `Job #${j.id}`}
                  </h2>
                  <div className="flex items-center gap-2">
                    {j.distanceKm != null && userLoc && (
                      <span className="text-xs rounded-full px-2 py-1 bg-sky-100 text-sky-700">
                        {j.distanceKm.toFixed(1)} km
                      </span>
                    )}
                    <span className="text-xs rounded-full px-3 py-1 bg-amber-100 text-amber-800">
                      {j.progress_stage}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <p><span className="font-medium">Deadline:</span> {fmtDate(j.deadline_date)}</p>
                  <p><span className="font-medium">Priority:</span> {String(j.intake_priority).toLowerCase()}</p>
                  <p><span className="font-medium">Size:</span> {sizeLabel(j.size)}</p>
                  <p><span className="font-medium">Address:</span> {j.address ?? "—"}</p>
                  {role === "admin" && (
                    <>
                      <p><span className="font-medium">Assigned to:</span> {j.assigned_to ?? "—"}</p>
                      <p><span className="font-medium">Follow-up required:</span> {j.follow_up ? "Yes" : "No"}</p>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/dashboard/job/${j.id}`}
                    className="px-3 py-2 rounded border hover:bg-gray-50"
                  >
                    View Details
                  </Link>

                  {role === "volunteer" && j.progress_stage === "reserved" && (
                    <button
                      onClick={() => updateProgress(j.id, "in_delivery")}
                      className="px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      Confirm Pick-Up
                    </button>
                  )}

                  {role === "volunteer" && j.progress_stage === "in_delivery" && (
                    <button
                      onClick={() => updateProgress(j.id, "completed")}
                      className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Confirm Drop-Off
                    </button>
                  )}

                  <button
                    onClick={() => cancelJob(j.id)}
                    className="px-3 py-2 rounded bg-red-700 text-white hover:bg-red-800"
                  >
                    Cancel Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
