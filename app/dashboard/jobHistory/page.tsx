/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      jobHistory/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      24-09-2025
* Version:   1.2
* Purpose:   Dashboard where volunteers can see all past
*            jobs, consisting of a header, profile button, and
*            scrollable list of completed jobs.
* Revisions:
* v1.0 - Initial page layout (front end)
* v1.1 - Header updated: GoodRun logo on left, Dashboard + Profile buttons on right
* v1.2 - Moved page to dashboard/jobHistory, replaced with reusable header
*******************************************************/

export default function JobHistoryPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Page content */}
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Page title panel */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
          <h1 className="text-2xl font-semibold">Completed Jobs</h1>
        </div>

        {/* Main content layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Scrollable job list */}
          <div className="md:col-span-3">
            <div className="h-[500px] md:h-[600px] w-full rounded-lg border border-gray-200 bg-slate-100 text-slate-600 px-4 py-4 overflow-y-auto space-y-4">
              {/* Job cards */}
              <a
                href="/job"
                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-[#171e3a]">Job example 1</h2>
                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job</p>
              </a>
              <a
                href="/job"
                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-[#171e3a]">Job example 2</h2>
                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job</p>
              </a>
              <a
                href="/job"
                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-[#171e3a]">Job example 3</h2>
                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job</p>
              </a>
              <a
                href="/job"
                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-[#171e3a]">Job example 4</h2>
                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job</p>
              </a>
              <a
                href="/job"
                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-[#171e3a]">Job example 5</h2>
                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job</p>
              </a>
              <a
                href="/job"
                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h2 className="font-semibold text-[#171e3a]">Job example 6</h2>
                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job</p>
              </a>

              {/* Add more job cards here */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

