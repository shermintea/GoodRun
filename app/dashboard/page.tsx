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
* v1.5 - Modified so that profile edits are persistant and is reflected in Welcome message
*******************************************************/

"use client"; 

import Image from "next/image";
import { useEffect, useState } from "react";


export default function DashboardPage() {
    const activeJob = false; // TODO: replace with real backend data

    // For displaying profile name
    const [name, setName] = useState<string>("");
    useEffect(()=>{
        const stored = localStorage.getItem("profile");
        if (stored) {
            const profile = JSON.parse(stored);
            setName(profile.name);
        }
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Top banner (centered logo + profile button right corner) */}
            <header className="relative bg-[#171e3a] text-white">
                <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-center">
                    <a href="/" className="flex flex-col items-center gap-2">
                        <Image
                            src="/grLogo-alternate.png"
                            alt="GoodRun logo"
                            width={90}
                            height={90}
                            className="rounded-md"
                        />
                    </a>

                    {/* Profile shortcut (absolute right corner) */}
                    <a
                        href="/profile"
                        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-2 text-[#171e3a] font-medium hover:bg-white transition"
                    >
                        Profile
                    </a>
                </div>
            </header>

            {/* Dashboard content */}
            <section className="max-w-6xl mx-auto px-6 py-10">
                {/* Welcome banner */}
                <div className="mb-8 rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold">Welcome back, {name || "there"}! 👋</h1>
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
                                    <a
                                        href="/ongoingJobs"
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
                                        href="/ongoingJobs"
                                        className="mt-4 inline-block rounded-md bg-white/95 px-4 py-2 text-[#171e3a] font-medium text-center hover:bg-white"
                                    >
                                        View Ongoing Jobs
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
                            <a
                                href="/availableJobs"
                                className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white font-medium text-center hover:bg-[#0f152c] transition"
                            >
                                View Available Jobs
                            </a>
                        </div>

                        {/* Job History */}
                        <div className="rounded-lg bg-gray-50 p-6 shadow-sm border border-gray-100">
                            <h2 className="font-semibold">Job History</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Completed jobs will appear here.
                            </p>
                            <a
                                href="/jobHistory"
                                className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white font-medium text-center hover:bg-[#0f152c] transition"
                            >
                                View Job History
                            </a>
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
