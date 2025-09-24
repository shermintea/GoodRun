/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      page.tsx
* Author:    It Project - medical pantry - group 17
* Date:      24-09-2025
* Version:   1.0
* Purpose:   Profile Page 
*            - Display list of currently accepted jobs
*            - Show job source (stored in DB vs admin-created)
*            - Provide actions: Confirm Pickup / Confirm Drop Off, View Details
*            - Mobile-first cards with desktop-friendly layout
*            
* 
* Note: To Integrate PickUP Request Database into the code(extract information of users)
*     - Uses mock data for now. Includes a commented block
*       prepared for mapping/fetching from a real DB/API.
*     - Header shows centered 72px logo with Dashboard/Profile shortcuts.
*     - Replace mock handler with API POST when integrating backend.
* 
* Revisions:
* v1.0 - 24-09-2025 - Initial implementation of basic layout of ongoing job page
*******************************************************/


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
  source: SourceType; // whether it's stored in DB or created by admin only
};

export default function AcceptedJobsPage() {
  /** ---------------------------------------------
   *  MOCK DATA for layout (what users see right now)
   *  --------------------------------------------*/
  const [jobs] = useState<JobItem[]>([
    {
      id: '1',
      name: 'Item name',
      status: 'DROPOFF',
      address: '12 Example St, Melbourne VIC',
      pickupTime: 'Today 4:30 PM',
      source: 'stored',
    },
    {
      id: '2',
      name: 'Item name',
      status: 'DROPOFF',
      address: '45 River Rd, Carlton VIC',
      pickupTime: 'Today 5:15 PM',
      source: 'admin_temp',
    },
    {
      id: '3',
      name: 'Item name',
      status: 'PICKUP',
      address: '88 Station St, Fitzroy VIC',
      pickupTime: 'Tomorrow 9:00 AM',
      source: 'stored',
    },
    {
      id: '4',
      name: 'Item name',
      status: 'PICKUP',
      address: '5 King St, Docklands VIC',
      pickupTime: 'Tomorrow 11:00 AM',
      source: 'admin_temp',
    },
  ]);

  // Simple sort example (replace with real logic when pickupTime is ISO)
  const sorted = useMemo(() => jobs.slice(), [jobs]);

  /** ------------------------------------------------------------
   *  🔒 FUTURE (DB/API): Replace the mock above with real data
   *  ------------------------------------------------------------
   *  Create an API route like: app/api/jobs/accepted/route.ts (GET)
   *  Then fetch here (or in a Server Component) and map to JobItem.
   *
   *  // Example client fetch (uncomment when API exists):
   *  import { useEffect } from 'react';
   *  const [jobs, setJobs] = useState<JobItem[]>([]);
   *  useEffect(() => {
   *    fetch('/api/jobs/accepted')
   *      .then(r => r.json())
   *      .then((data: JobItem[]) => setJobs(data))
   *      .catch(console.error);
   *  }, []);
   *
   *  // Ensure your API returns objects shaped like:
   *  // { id, name, status: 'PICKUP'|'DROPOFF', address, pickupTime, source: 'stored'|'admin_temp' }
   *  ------------------------------------------------------------*/

  const onConfirm = (job: JobItem) => {
    // TODO: Replace with API call to confirm pickup/drop-off for job.id
    // await fetch(`/api/jobs/${job.id}/confirm`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type: job.status }),
    // });
    alert(`${job.status === 'PICKUP' ? 'Pickup' : 'Drop Off'} confirmed for "${job.name}" (mock)`);
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* Header with centered logo (>= 64px) and right-side shortcuts */}
      <header className="bg-white">
        <div className="mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-3xl px-4 md:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            {/* Left spacer keeps logo centered */}
            <div aria-hidden />

            {/* Center: Logo */}
            <div className="justify-self-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/grLogo-transparent.png"
                  alt="Medical Pantry"
                  width={72}  // >64px
                  height={72}
                  priority
                />
              </Link>
            </div>

            {/* Right: Shortcuts */}
            <nav className="justify-self-end flex items-center gap-6 text-sm md:text-base font-medium text-neutral-700">
              <Link href="/dashboard" className="hover:text-neutral-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/profile" className="hover:text-neutral-900 transition-colors">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Navy banner background like your mock */}
      <section className="bg-[#11183A]">
        <div className="mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-3xl px-4 md:px-6 lg:px-8 py-6 space-y-5">
          {sorted.map((job) => (
            <JobCard key={job.id} job={job} onConfirm={onConfirm} />
          ))}

          {/* Optional: empty state */}
          {sorted.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-neutral-600 shadow-sm">
              No accepted jobs at the moment.
            </div>
          )}
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
  const pillColor =
    job.status === 'PICKUP' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700';

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
            className={`rounded-xl ${pillColor} px-4 py-2 text-white text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-700`}
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
