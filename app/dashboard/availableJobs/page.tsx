/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/availableJobs/page.tsx
* Purpose:   List jobs for Available page; show REAL status.
*            - Includes distance radius filter & distance sorting (GPS)
*            - Includes urgency sort (if backend provides it; defaults to MEDIUM)
*            - Admin-only toggle to show cancelled jobs
*            - Requests includeCancelled=1 so cancelled_in_delivery can be returned
*******************************************************/
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Role = "admin" | "volunteer" | undefined;
type Urgency = "LOW" | "MEDIUM" | "HIGH";

type JobRow = {
  id: number;
  name: string | null;
  address: string | null;
  package_size: string | null;
  progress_stage: string | null; // 'available' | 'in_delivery' | 'cancelled_in_delivery' | ...
  // Optional, if your backend provides them. If not, distance UI gracefully disables itself.
  lat?: number | null;
  lng?: number | null;
  urgency?: Urgency | null; // default to MEDIUM if missing
};

type JobsApiResponse = { jobs?: JobRow[]; error?: string };

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

  // ---------- Filters (ported from teammate's mock) ----------
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [applyRadius, setApplyRadius] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<"nearest" | "farthest">("nearest");
  const [urgencySort, setUrgencySort] = useState<"none" | "highFirst" | "lowFirst">("none");
  const [showCancelled, setShowCancelled] = useState<boolean>(role === "admin"); // admin can toggle

  // Try auto-geolocation if already granted
  useEffect(() => {
    const tryAutoGeo = async () => {
      try {
        // Permissions API may not exist on all browsers
        const anyNav: any = navigator;
        const status = await anyNav.permissions?.query?.({ name: "geolocation" as PermissionName });
        if (status?.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => {}
          );
        }
      } catch {
        // ignore
      }
    };
    tryAutoGeo();
  }, []);

  // Distance helpers (Haversine)
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
  const urgencyRank = (u: Urgency) => (u === "HIGH" ? 3 : u === "MEDIUM" ? 2 : 1);

  // ---------- Fetch ----------
  const load = async () => {
    setError(null);
    setActionMsg(null);
    setRefreshing(true);
    try {
      // Ask backend to include cancelled jobs in payload
      const res = await fetch("/api/jobs/available?includeCancelled=1", { credentials: "include" });
      const data: JobsApiResponse = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load jobs");
        setJobsRaw([]);
      } else {
        const list: JobRow[] = Array.isArray(data.jobs) ? data.jobs : [];
        setJobsRaw(list);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ---------- Compute filtered/sorted list (matches teammate’s behavior) ----------
  const displayed = useMemo(() => {
    // Map in computed distance + normalized urgency
    let list = jobsRaw.map((j) => {
      const hasCoords = typeof j.lat === "number" && typeof j.lng === "number";
      const distanceKm = userLoc && hasCoords ? haversineKm(userLoc, { lat: j.lat!, lng: j.lng! }) : null;
      return {
        ...j,
        urgency: (j.urgency ?? "MEDIUM") as Urgency,
        distanceKm,
      };
    });

    // Admin toggle to hide/show cancelled jobs (volunteers never see cancelled by default)
    if (!(role === "admin" && showCancelled)) {
      list = list.filter((j) => !(j.progress_stage ?? "").includes("cancelled"));
    }

    // Radius filter (unknown distance remains visible)
    if (userLoc && applyRadius) {
      list = list.filter((j: any) => (j.distanceKm == null ? true : j.distanceKm <= radiusKm));
    }

    // Urgency sort (optional)
    if (urgencySort !== "none") {
      list.sort((a: any, b: any) => {
        const diff = urgencyRank(b.urgency) - urgencyRank(a.urgency); // HIGH→LOW
        return urgencySort === "highFirst" ? diff : -diff; // LOW→HIGH
      });
    }

    // Distance sort: known first; then nearest/farthest
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
  }, [jobsRaw, userLoc, radiusKm, applyRadius, sortOrder, urgencySort, role, showCancelled]);

  // ---------- UI helpers ----------
  const statusPill = (stage: string | null | undefined) => {
    const s = stage ?? "unknown";
    if (s.includes("cancelled")) return "bg-gray-200 text-gray-700";
    if (s === "in_delivery") return "bg-blue-100 text-blue-700";
    if (s === "available") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const urgencyBadge = (u?: Urgency | null) =>
    (u ?? "MEDIUM") === "HIGH"
      ? { text: "High", classes: "bg-rose-100 text-rose-700" }
      : (u ?? "MEDIUM") === "LOW"
      ? { text: "Low", classes: "bg-sky-100 text-sky-700" }
      : { text: "Medium", classes: "bg-amber-100 text-amber-700" };

  // ---------- Render ----------
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Available Jobs</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Role: {role ?? "…"}</span>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh Jobs"}
          </button>
        </div>

        {actionMsg && <div className="rounded-lg border px-4 py-2 bg-white">{actionMsg}</div>}

        {/* Filters row (mirrors teammate layout) */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

              {/* Admin-only toggle for cancelled visibility */}
              {role === "admin" && (
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                  />
                  Show cancelled jobs
                </label>
              )}
            </div>
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
              const ub = urgencyBadge(j.urgency as Urgency);
              return (
                <div key={j.id} className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold text-[#171e3a]">{j.name ? j.name : `Job #${j.id}`}</h2>
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
                      <span className="font-medium">Size:</span> {j.package_size ?? "—"}
                    </p>
                    {j.distanceKm != null && (
                      <p>
                        <span className="font-medium">Distance:</span>{" "}
                        {j.distanceKm.toFixed(1)}
                        km
                      </p>
                    )}
                  </div>

                  {/* Role-based actions */}
                  <div className="mt-4 flex items-center gap-3">
                    <Link href={`/dashboard/job/${j.id}`} className="px-3 py-2 rounded border hover:bg-gray-50">
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
