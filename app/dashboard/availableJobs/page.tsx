/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      availableJobs/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      24-09-2025
* Version:   1.2
* Purpose:   Dashboard where volunteers can see all available
*            jobs, consisting of a header with GoodRun logo on
*            the left, Dashboard + Profile buttons on the right,
*            and a scrollable list of jobs.
* Revisions:
* v1.0 - Initial page layout (front end)
* v1.1 - Updated header to use GoodRun branding
* v1.2 - Added Dashboard shortcut and replaced logo
* v1.3 - Moved page to dashboard/availableJobs, replaced with reusable header
*******************************************************/

export default function AvailableJobsPage() {
    return (
        <main className="min-h-screen bg-gray-50">

            {/* Page content */}
            <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
                {/* Page title panel */}
                <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white flex items-center">
                    <h1 className="text-2xl font-semibold">Available Jobs</h1>
                </div>

                {/* Main content area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Scrollable job list */}
                    <div className="md:col-span-3">
                        <div className="h-[400px] md:h-[600px] w-full rounded-lg border border-gray-200 bg-slate-100 text-slate-600 px-4 py-4 overflow-y-auto space-y-4">

                            {/* Example job cards */}
                            <a
                                href="/job"
                                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h2 className="font-semibold text-[#171e3a]">Job example 1</h2>
                                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job details.</p>
                            </a>
                            <a
                                href="/job"
                                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h2 className="font-semibold text-[#171e3a]">Job example 2</h2>
                                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job details.</p>
                            </a>
                            <a
                                href="/job"
                                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h2 className="font-semibold text-[#171e3a]">Job example 3</h2>
                                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job details.</p>
                            </a>
                            <a
                                href="/job"
                                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h2 className="font-semibold text-[#171e3a]">Job example 4</h2>
                                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job details.</p>
                            </a>
                            <a
                                href="/job"
                                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h2 className="font-semibold text-[#171e3a]">Job example 5</h2>
                                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job details.</p>
                            </a>
                            <a
                                href="/job"
                                className="block rounded-lg bg-white p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <h2 className="font-semibold text-[#171e3a]">Job example 6</h2>
                                <p className="mt-2 text-sm text-gray-600">Clickable, takes user to job details.</p>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
