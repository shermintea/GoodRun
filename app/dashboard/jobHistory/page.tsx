/*****************************************************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/jobHistory/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      16-10-2025
* Version:   1.1
* Purpose:   Show completed jobs (Job History).
*            - Admins see ALL completed jobs (with assignee + follow-up).
*            - Volunteers see only jobs they completed (no details button).
* Notes:     Data source = jobs table via GET /api/jobs/completed
* v1.1:      “View Details” now links to /dashboard/jobs/[id]
******************************************************************************************/

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Job = {
  id: number;
  item_name: string | null;
  item_id: string | number | null;
  dropoff_date: string | null; // ISO string from DB
  follow_up_required?: 0 | 1 | boolean | null;
  assignee_name?: string | null;
  assignee_email?: string | null;
};

export default function JobHistoryPage() {
  const { data: session } = useSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = (session?.user as any)?.role === "admin";

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/jobs/completed", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load completed jobs");
      const data = await res.json();
      setJobs((data?.jobs as Job[]) ?? []);
    } catch (e: any) {
      setError(e?.message || "Error loading completed jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      {/* Header Bar */}
      <div className="bg-[#b51c1c] text-white rounded-t-2xl flex justify-between items-center p-6">
        <h1 className="text-xl font-semibold">Completed Jobs (Job History)</h1>
        <button
          onClick={fetchCompletedJobs}
          className="bg-white text-[#b51c1c] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
        >
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded-b-2xl p-6 min-h-[420px]">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
            No completed jobs.
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const dropoff = job.dropoff_date
                ? new Date(job.dropoff_date).toLocaleDateString()
                : "N/A";
              const followUp =
                typeof job.follow_up_required === "boolean"
                  ? job.follow_up_required
                  : job.follow_up_required === 1;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow p-5 border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div>
                    {isAdmin && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Assignee:</span>{" "}
                        {job.assignee_name || job.assignee_email || "Unassigned"}
                      </p>
                    )}

                    <p className="text-gray-800 font-medium">
                      {job.item_name || "Unknown item"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Item ID: {job.item_id ?? "—"}
                    </p>
                    <p className="text-sm text-gray-600">Drop-off Date: {dropoff}</p>

                    {isAdmin && (
                      <p className="text-sm text-gray-600">
                        Follow-up Required:{" "}
                        <span className="font-semibold">{followUp ? "Yes" : "No"}</span>
                      </p>
                    )}
                  </div>

                  {isAdmin && (
                    <Link
                      href={`/dashboard/job/${job.id}`}
                      className="mt-4 sm:mt-0 bg-[#b51c1c] text-white px-4 py-2 rounded-md hover:bg-[#a01717] transition text-center"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
