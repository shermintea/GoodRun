/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      dashboard/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-09-2025
* Version:   1.2
* Purpose:   Volunteer dashboard with consistent header,
*            profile button, welcome message, jobs overview,
*            and map placeholder.
* Revisions:
* v1.0 - Initial dashboard layout 
* v1.1 - Added welcome banner and profile button at top right
* v1.2 - Conditional ongoing job state (active vs none)
*******************************************************/


import Image from "next/image";

export default function DashboardPage() {
    // TODO: Replace this with real data from backend
    const activeJob = false; // Flip to true to preview the "update details" state

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Top banner (logo + profile button) */}
            <header className="bg-[#171e3a] text-white">
                <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
                    {/* Left: Logo + text */}
                    <a href="/" className="flex items-center gap-2">
                        <Image
                            src="/mpLogo.png"
                            alt="Medical Pantry logo"
                            width={85}
                            height={85}
                            className="rounded-md"
                        />
                        <span className="text-3xl font-semibold tracking-tight">
                            Medical Pantry
                        </span>
                    </a>

                    {/* Right: Profile button */}
                    <a
                        href="/profile"
                        className="rounded-full bg-white/90 px-4 py-2 text-[#171e3a] font-medium hover:bg-white transition"
                    >
                        Profile
                    </a>
                </div>
            </header>

            {/* Dashboard content */}
            <section className="max-w-6xl mx-auto px-6 py-10">
                {/* Welcome banner */}
                <div className="mb-8 rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold">Welcome back, Monna! 👋</h1>
                    <p className="mt-2 text-gray-600">
                        Here’s a quick look at your ongoing jobs and updates for today.
                    </p>
                </div>

                {/* Placeholder panels */}
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
                                    <a
                                        href="/jobs/current"
                                        className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium hover:bg-white"
                                    >
                                        Update job
                                    </a>
                                </>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm text-white/90">
                                        No active jobs at the moment.
                                    </p>
                                    <a
                                        href="/jobs"
                                        className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium hover:bg-white"
                                    >
                                        Find jobs
                                    </a>
                                </>
                            )}
                        </div>

                        {/* Available Jobs */}
                        <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                            <h2 className="font-semibold">Available Jobs</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Job listings will show here.
                            </p>
                        </div>

                        {/* Job History */}
                        <div className="rounded-lg bg-gray-50 p-6 shadow-sm border border-gray-100">
                            <h2 className="font-semibold">Job History</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Completed jobs will appear here.
                            </p>
                        </div>
                    </div>

                    {/* Map placeholder */}
                    <div className="md:col-span-2">
                        <div className="h-[400px] w-full rounded-lg border border-gray-200 bg-slate-100 flex items-center justify-center text-slate-600">
                            Map Placeholder (insert GraphHopper integration)
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
