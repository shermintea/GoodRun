/*****************************************************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      page.tsx  (Accepted/Ongoing Jobs)
* Author:    IT Project – Medical Pantry – Group 17
* Date:      25-09-2025
* Version:   1.1
* Purpose:   - Display list of currently accepted jobs 
*            - Show job source (stored in DB vs admin-created) 
*            - Provide actions: Confirm Pickup / Confirm Drop Off, View Details 
* 
* Note: To Integrate PickUP Request Database into the code(extract information of users) 
*         - Uses mock data for now. Includes a commented out block 
*         prepared for mapping/fetching from a real DB/API.
* 
* Revisions: 
* v1.0 - 24-09-2025 - Initial implementation of basic layout of ongoing job page
* v1.1 - 25-09-2025 - Logo placement & Interaction: clicking "Confirm Pickup" changes the job status to
                      "DROPOFF" and the button label updates to "Confirm Drop Off".
* v1.2 - 30-09-2025 - Updated formating to match other pages.
*******************************************************************************************/

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type JobStatus = 'PICKUP' | 'DROPOFF';
type SourceType = 'stored' | 'admin_temp';

type JobItem = {
  id: string;
  name: string;
  status: JobStatus;
  address: string;
  pickupTime: string; // ISO or display string
  source: SourceType;
};

export default function AcceptedJobsPage() {
  // --- Mock data for layout ---
  const [jobs, setJobs] = useState<JobItem[]>([
    { id: '1', name: 'Item name', status: 'DROPOFF', address: '12 Example St, Melbourne VIC', pickupTime: 'Today 4:30 PM', source: 'stored' },
    { id: '2', name: 'Item name', status: 'DROPOFF', address: '45 River Rd, Carlton VIC', pickupTime: 'Today 5:15 PM', source: 'admin_temp' },
    { id: '3', name: 'Item name', status: 'PICKUP',  address: '88 Station St, Fitzroy VIC',  pickupTime: 'Tomorrow 9:00 AM', source: 'stored' },
    { id: '4', name: 'Item name', status: 'PICKUP',  address: '5 King St, Docklands VIC',   pickupTime: 'Tomorrow 11:00 AM', source: 'admin_temp' },
  ]);

  const sorted = useMemo(() => jobs.slice(), [jobs]);

  // When user confirms:
  // - If status is PICKUP => flip to DROPOFF (and UI will show "Awaiting drop off")
  // - If status is already DROPOFF => keep as DROPOFF (no change here)
  const onConfirm = (job: JobItem) => {
    setJobs(prev =>
      prev.map(j =>
        j.id === job.id
          ? { ...j, status: j.status === 'PICKUP' ? 'DROPOFF' : 'DROPOFF' }
          : j
      )
    );

    // Mock feedback
    alert(
      `${
        job.status === 'PICKUP' ? 'Pickup' : 'Drop Off'
      } confirmed for "${job.name}" (mock)`
    );
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* Header: logo left, blue ellipse buttons on right */}
      {/* Top banner (logo on left, buttons on right) */}
      <header className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
              {/* Left: GoodRun logo */}
              <a href="/" className="flex items-center gap-2">
                  <Image
                      src="/grLogo-transparent.png"
                      alt="GoodRun logo"
                      width={85}
                      height={85}
                      className="rounded-md"
                  />
              </a>

              {/* Right: Dashboard + Profile buttons */}
              <div className="flex gap-3">
                  <a
                      href="/dashboard"
                      className="rounded-full bg-[#11183A] px-4 py-2 text-white font-medium hover:bg-white transition"
                  >
                      Dashboard
                  </a>
                  <a
                      href="/profile"
                      className="rounded-full bg-[#11183A] px-4 py-2 text-white font-medium hover:bg-white transition"
                  >
                      Profile
                  </a>
              </div>
          </div>
      </header>


      {/* Page title panel */}
      <section className="max-w-6xl mx-auto px-6 py-5 space-y-5">
      <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
          <h1 className="text-2xl font-semibold">Ongoing Jobs</h1>
      </div>

      {/* Scrollable job list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* For centering the column */}
        <div className="md:col-span-3">            
            <div className="rounded-lg bg-[#11183A] h-[1150px] mx-auto w-full rounded-lg border px-4 md:px-6 lg:px-8 py-6 space-y-5 overflow-y-auto">
              {sorted.map((job) => (
                <JobCard key={job.id} job={job} onConfirm={onConfirm} />
              ))}

              {sorted.length === 0 && (
                <div className="rounded-2xl bg-white p-6 text-center text-neutral-600 shadow-sm">
                  No accepted jobs at the moment.
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
  job: JobItem;
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
        <h3 className="text-xl font-extrabold">Item name</h3>
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
