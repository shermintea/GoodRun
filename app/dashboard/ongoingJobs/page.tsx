/*****************************************************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/ongoingJobs/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      25-09-2025
* Version:   3.1
* Purpose:   - Display currently accepted jobs
*            - Confirm Pickup / Drop-off transitions for volunteers
*            - Manual refresh, role-aware UI, safe feedback messages
******************************************************************************************/

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type JobRow = {
  id: number;
  name: string | null;
  address: string | null;
  assigned_to: number | null;
  follow_up: boolean;
  deadline_date: string;
  progress_stage: string;
  intake_priority: string;
  size?: string | null;
};

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  const x = new Date(d);
  if (isNaN(x.getTime())) return d;
  return x.toLocaleDateString();
}

export default function OngoingJobsPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as any)?.role as "admin" | "volunteer" | undefined;

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Load all ongoing jobs
  const load = async () => {
    setRefreshing(true);
    setError(null);
    setActionMsg(null);
    try {
      const res = await fetch("/api/jobs/ongoing", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to load jobs");
        setJobs([]);
      } else {
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
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

  // Volunteer actions: pick-up or drop-off confirmations
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
        // reload jobs to refresh UI
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
        {!loading && !sessionLoading && !error && jobs.length === 0 && (
          <div className="rounded-xl bg-[#121a38] p-6 text-center text-gray-200">
            No accepted jobs yet. When an admin assigns you a job / you reserve a job, it will appear here.
          </div>
        )}

        {!loading && !sessionLoading && !error && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((j) => (
              <div key={j.id} className="rounded-lg bg-white p-5 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-[#171e3a]">
                    {j.name ?? `Job #${j.id}`}
                  </h2>
                  <span className="text-xs rounded-full px-3 py-1 bg-amber-100 text-amber-800">
                    {j.progress_stage}
                  </span>
                </div>

                {/* Role-specific fields */}
                {role === "admin" ? (
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Assigned to:</span> {j.assigned_to ?? "—"}</p>
                    <p><span className="font-medium">Follow-up required:</span> {j.follow_up ? "Yes" : "No"}</p>
                    <p><span className="font-medium">Deadline:</span> {fmtDate(j.deadline_date)}</p>
                    <p><span className="font-medium">Status:</span> {j.progress_stage}</p>
                    <p><span className="font-medium">Priority:</span> {j.intake_priority}</p>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p><span className="font-medium">Deadline:</span> {fmtDate(j.deadline_date)}</p>
                    <p><span className="font-medium">Priority:</span> {j.intake_priority}</p>
                    <p><span className="font-medium">Status:</span> {j.progress_stage}</p>
                    <p><span className="font-medium">Address:</span> {j.address ?? "—"}</p>
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/dashboard/job/${j.id}`}
                    className="px-3 py-2 rounded border hover:bg-gray-50"
                  >
                    View Details
                  </Link>

                  {/* Volunteer action buttons */}
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
