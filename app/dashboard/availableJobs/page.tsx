/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/availableJobs/page.tsx
* Purpose:   List jobs for Available page; show REAL status.
*            Requests includeCancelled=1 so cancelled_in_delivery also appears.
*******************************************************/
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type JobRow = {
  id: number;
  name: string | null;
  address: string | null;
  package_size: string | null;
  progress_stage: string | null; // e.g. 'available', 'in_delivery', 'cancelled_in_delivery'
};

type JobsApiResponse = { jobs?: JobRow[]; error?: string };

export default function AvailableJobsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as "admin" | "volunteer" | undefined;

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const sessionLoading = status === "loading";

  const load = async () => {
    setError(null);
    setActionMsg(null);
    setRefreshing(true);
    try {
      // ✅ Ask backend to include cancelled_in_delivery alongside available
      const res = await fetch("/api/jobs/available?includeCancelled=1", {
        credentials: "include",
      });
      const data: JobsApiResponse = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load jobs");
        setJobs([]);
      } else {
        const list: JobRow[] = Array.isArray(data.jobs) ? data.jobs : [];
        // Do NOT filter here; we want to show the actual statuses returned.
        setJobs(list);
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
        // If your backend moves status away from "available", you can refetch:
        setJobs((prev) => prev.filter((j) => j.id !== id));
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
        setJobs((prev) => prev.filter((j) => j.id !== id));
      }
    } catch {
      setActionMsg("Network error deleting job");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Available Jobs</h1>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              Role: {role ?? "…"}
            </span>
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
        {!loading && !sessionLoading && !error && jobs.length === 0 && (
          <p className="text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-3 text-center">
            No jobs available.
          </p>
        )}

        {/* Job Cards */}
        {!loading && !sessionLoading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((j: JobRow) => (
              <div key={j.id} className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-[#171e3a]">
                    {j.name ? j.name : `Job #${j.id}`}
                  </h2>
                  <span
                    className={`text-xs rounded-full px-3 py-1 ${
                      j.progress_stage?.includes("cancelled")
                        ? "bg-gray-200 text-gray-700"
                        : j.progress_stage === "in_delivery"
                        ? "bg-blue-100 text-blue-700"
                        : j.progress_stage === "available"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {j.progress_stage ?? "unknown"}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Address:</span> {j.address ?? "—"}
                  </p>
                  <p>
                    <span className="font-medium">Size:</span> {j.package_size ?? "—"}
                  </p>
                </div>

                {/* Role-based actions */}
                <div className="mt-4 flex items-center gap-3">
                  {/* ✅ FIX A: link to singular "job" route */}
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
                      title="Delete this job"
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
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
