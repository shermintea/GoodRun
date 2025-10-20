/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   2.0
* Purpose:   Volunteer dashboard (server-side) with header logo
*            that navigates to the Medical Pantry home page (/),
*            welcome banner, jobs overview, and map placeholder.
* Revisions:
* v1.0 - Initial dashboard layout 
* v1.1 - Added welcome banner and profile button at top right
* v1.2 - Conditional ongoing job state (active vs none)
* v1.3 - Link to all other pages & profile, replaced logo
* v1.4 - Removed redundant “Find Jobs” button
* v1.5 - Profile name persistence
* v1.6 - Map view
* v1.7 - Dynamic map import (removed; server-side page)
* v1.8 - Implemented login session 
* v1.9 - Replaced with reusable header
* v2.0 - Added header with clickable logo -> "/" and fixed absolute links
*******************************************************/

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/utils/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import MapView from "./mapview";

export default async function DashboardPage() {
  // Fetch session from server
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login page
  if (!session) {
    return redirect("/login");
  }

  const { user } = session;
  const isAdmin = user?.role === "admin"; // reserved for future role-specific UI
  const activeJob = false; // TODO: wire to backend

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header: logo links to home (/) */}
      <header className="bg-[#171e3a] text-white">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/mpLogo.png"
              alt="Medical Pantry logo"
              width={85}
              height={85}
              className="rounded-md"
              priority
            />
            <span className="text-3xl font-semibold tracking-tight">
              Medical Pantry
            </span>
          </Link>
        </div>
      </header>

      {/* Dashboard content */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome banner */}
        <div className="mb-8 rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">
            Welcome back, {user?.name || "there"}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Here’s a quick look at your ongoing jobs and updates for today.
          </p>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="space-y-4">
            {/* Ongoing Job */}
            <div className="rounded-lg bg-red-700 p-6 shadow-sm text-white">
              <h2 className="font-semibold">Ongoing Job</h2>
              {activeJob ? (
                <>
                  <p className="mt-2 text-sm text-white/90">
                    Click to update details.
                  </p>
                  <Link
                    href="/dashboard/ongoingJobs"
                    className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium hover:bg-white"
                  >
                    Update job
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm text-white/90">
                    No active jobs at the moment.
                  </p>
                  <Link
                    href="/dashboard/ongoingJobs"
                    className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium text-center hover:bg-white"
                  >
                    View Ongoing Jobs
                  </Link>
                </>
              )}
            </div>

            {/* Available Jobs */}
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
              <h2 className="font-semibold">Available Jobs</h2>
              <p className="mt-2 text-sm text-gray-600">
                Job listings will show here.
              </p>
              <Link
                href="/dashboard/availableJobs"
                className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white font-medium text-center hover:bg-[#0f152c] transition"
              >
                View Available Jobs
              </Link>
            </div>

            {/* Job History */}
            <div className="rounded-lg bg-gray-50 p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold">Job History</h2>
              <p className="mt-2 text-sm text-gray-600">
                Completed jobs will appear here.
              </p>
              <Link
                href="/dashboard/jobHistory"
                className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white font-medium text-center hover:bg-[#0f152c] transition"
              >
                View Job History
              </Link>
            </div>
          </div>

                    {/* Map*/}
                    <div className="md:col-span-2">
                        <div className="h-[400px] w-full rounded-lg border border-gray-200 overflow-hidden">
                            <MapView />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
