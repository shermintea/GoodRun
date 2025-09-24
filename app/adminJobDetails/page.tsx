/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      adminJobDetails/ page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      23-09-2025
* Version:   1.0
* Purpose:   Admin job details dashboard with consistent header,
*            profile button, job information, map placeholder, pickup
*            information, and buttons to edit and delete a job.
* Revisions:
* v1.0 - Initial page layout 
*******************************************************/


import Image from "next/image";

export default function JobDetailsPage() {
    // TODO: Replace this with real data from backend

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

            {/* Page content */}
            <section className="max-w-6xl mx-auto px-6 py-10">
                
                {/* Placeholder panels */}
                <div className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6 items-start">
                    {/* Job Info column */}
                    <div className="col-span-1 space-y-4">
                        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white">
                            <h1 className="text-2xl font-semibold">Job Info</h1>
                            <p className="mt-2 text-white-600">
                                Job ID :
                                </p>
                      </div>
                        
                        {/* Information box placeholder */}
                        <div className="h-[600px] w-full rounded-lg border border-gray-200 bg-slate-100 flex items-center justify-center text-slate-600">
                            Information box (Zendesk integration)
                        </div>
                        
                    </div>


                    {/* Pickup column */}
                    <div className="col-span-2 space-y-4">
                        <div className="h-[100px] rounded-lg bg-red-700 p-6 shadow-sm text-white">
                            <h1 className="text-2xl font-semibold">Pickup</h1>
                      </div>
                        
                        <div className="md:col-span-2">
                            {/* Map placeholder */}
                            <div className="md:col-span-2">
                                <div className="h-[400px] w-full rounded-lg border border-gray-200 bg-slate-100 flex items-center justify-center text-slate-600">
                                    Pickup location
                                </div>
                            
                                <div className="col-span-2 grid grid-cols-subgrid md:grid-cols-2 items-start">
                            
                            
                                    {/* Pickup information */}
                                    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                                        <h2 className="font-semibold">Picked up by:</h2>
                                        <p className="mt-2 text-sm text-gray-600">
                                            User will appear here
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                                        <h2 className="font-semibold">Since:</h2>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Date will appear here
                                        </p>
                                    </div>
                                    
                                
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="col-span-2 grid grid-cols-subgrid md:grid-cols-2 items-start gap-4">
                            {/* Edit Job */}
                            <a
                                href="/jobs"
                                className="mt-4 inline-block rounded-md bg-[#434869] text-white px-4 py-2 text-[#171e3a] font-medium hover:bg-white"
                            >
                                Edit Job Details
                            </a>
                            {/* Delete Job */}
                            <a
                                href="/jobs"
                                className="mt-4 inline-block rounded-md bg-red-700 text-white px-4 py-2 font-medium hover:bg-white"
                            >
                                Cancel Job
                            </a>
                        </div>
                   
                    </div>
                </div>
            </section>
        </main>
    );
}