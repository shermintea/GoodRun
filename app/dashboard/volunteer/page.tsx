/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      dashboard/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-09-2025
* Version:   1.4
* Purpose:   Volunteer dashboard with consistent header,
*            profile button, welcome message, jobs overview,
*            and map placeholder.
* Revisions:
* v1.0 - Initial dashboard layout 
* v1.1 - Added welcome banner and profile button at top right
* v1.2 - Conditional ongoing job state (active vs none)
* v1.3 - Link to all other pages & profile, replaced logo
* v1.4 - Removed redundant “Find Jobs” button
* v1.5 - Modified so that profile edits are persistant and is
*        reflected in Welcome message
* v1.6 - Implemented map view
* v1.7 - Added dynamic loading for map view
*******************************************************/

// app/dashboard/volunteer/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapView = dynamic(() => import("../mapview"), { ssr: false });

export default function VolunteerDashboard() {
  const activeJob = false; // TODO: real backend data
  const [name, setName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("profile");
    if (stored) setName(JSON.parse(stored)?.name ?? "");
  }, []);

  return (
    <>
      {/* Welcome */}
      <section className="mb-8 rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Welcome back, {name || "there"}! 👋</h1>
        <p className="mt-2 text-gray-600">Here’s a quick look at your ongoing jobs and updates for today.</p>
      </section>

      {/* Panels */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="space-y-4">
          {/* Ongoing Job */}
          <div className="rounded-lg bg-red-700 p-6 shadow-sm text-white">
            <h2 className="font-semibold">Ongoing Job</h2>
            {activeJob ? (
              <>
                <p className="mt-2 text-sm text-white/90">Click to update details.</p>
                <Link href="/ongoingJobs" className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium hover:bg-white">
                  Update job
                </Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm text-white/90">No active jobs at the moment.</p>
                <Link href="/ongoingJobs" className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium hover:bg-white">
                  View Ongoing Jobs
                </Link>
              </>
            )}
          </div>

          {/* Available Jobs */}
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <h2 className="font-semibold">Available Jobs</h2>
            <p className="mt-2 text-sm text-gray-600">Job listings will show here.</p>
            <Link href="/availableJobs" className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white font-medium hover:bg-[#0f152c] transition">
              View Available Jobs
            </Link>
          </div>

          {/* Job History */}
          <div className="rounded-lg bg-gray-50 p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold">Job History</h2>
            <p className="mt-2 text-sm text-gray-600">Completed jobs will appear here.</p>
            <Link href="/jobHistory" className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white font-medium hover:bg-[#0f152c] transition">
              View Job History
            </Link>
          </div>
        </div>

        {/* Map */}
        <div className="md:col-span-2">
          <div className="h-[400px] w-full rounded-lg border border-gray-200 overflow-hidden">
            <MapView />
          </div>
        </div>
      </section>
    </>
  );
}
