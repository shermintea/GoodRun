/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      jobDetail.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      30-09-2025
* Version:   1.0
* Purpose:   Displays detailed information for a single job,
*            including assigned user, progress, deadlines, and
*            job-specific metadata with a styled header spanning
*            the full width of the screen.
* Revisions:
* v1.0 - Initial implementation of job details page
* v1.1 - Creation of map and markers for user location
* v1.2 - Route between user location and hardcoded job location
*******************************************************/

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import JobMapView from "./jobMapView";
// import dynamic from "next/dynamic";

// const JobMapView = dynamic(() => import("./jobMapView"), { ssr: false });

interface Job {
  id: number;
  assigned_to: string;
  progress_stage: string;
  deadline_date: string;
  approx_weight: number;
  approx_value: number;
  size: "tiny" | "small";
  follow_up: number;
  intake_priority: "low" | "medium" | "high";
}

interface JobDetailProps {
  id: string;
}

export default function JobDetail({ id }: JobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  // const [error, setError] = useState<string | null>(null);
  //const [jobLocation, setJobLocation] = useState<{lat:number; lng:number} | null>(null);

  // temporarily default job location to Queen Vic Market
  const jobLocation = {lat: -37.807594, lng: 144.956650};
  // const fallbackLocation = {lat: -37.807594, lng: 144.956650};

/*  useEffect(() => {
    const fetchJob = async() => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (!res.ok) throw new Error("Job not found");
        const data: Job = await res.json();
        if (data.latitude %% data.longitude) {
          setJobLocation({ lat:data.latitude, lng:data.longitude});
        } else {
          setJobLocation(fallbackLocation);
        }
      } catch (error) {
        console.error("Failed to fetch job, using fallback location: ", error);
        setJobLocation(fallbackLocation);
      }
    };
    fetchJob();
  }, [id]); */


  return (
    <main className="min-h-screen bg-gray-50 w-full">
      {/* Full width header */}
      <header className="bg-[#171e3a] text-white w-full">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          {/* Left: Logo */}
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/grLogo-alternate.png"
              alt="GoodRun logo"
              width={85}
              height={85}
              className="rounded-md"
            />
          </a>

          {/* Right: Buttons */}
          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-full bg-white/90 px-4 py-2 text-[#171e3a] font-medium hover:bg-white transition"
            >
              Dashboard
            </a>
            <a
              href="/profile"
              className="rounded-full bg-white/90 px-4 py-2 text-[#171e3a] font-medium hover:bg-white transition"
            >
              Profile
            </a>
          </div>
        </div>
      </header>

      {/* Constrained content */}
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {/* Title */}
        <div className="h-[100px] rounded-lg bg-red-700 p-6 text-white flex items-center shadow-sm">
          <h1 className="text-2xl font-semibold">Job Details</h1>
        </div>

        {/* Map*/}
        <div className="mt-6">
          {jobLocation ?(
            <JobMapView jobLocation={jobLocation} />
          ) : (
          <div className="h-[400px] w-full rounded-lg border border-gray-200 bg-slate-100 flex items-center justify-center text-slate-600">
            Job location unavailable.
          </div>
          )}
        </div>

        {/* Job Detail Form */}
        <form className="bg-white rounded-lg shadow-md p-6 space-y-4 border border-gray-200">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Assigned To
            </label>
            <input
              type="text"
              value="" // Background integration here
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Progress Stage
            </label>
            <input
              type="text"
              value="" // Background integration here
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Deadline
            </label>
            <input
              type="text"
              value="" // Background integration here
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Approx. Weight (kg)
              </label>
              <input
                type="number"
                value="" // Background integration here
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Approx. Value ($)
              </label>
              <input
                type="number"
                value="" // Background integration here
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Size
              </label>
              <input
                type="text"
                value="" // Background integration here
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Follow-Up Required
              </label>
              <input
                type="text"
                value="" // Background integration here
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Intake Priority
            </label>
            <input
              type="text"
              value="" // Background integration here
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              //onClick={() => window.history.back()}
              className="rounded-full bg-[#171e3a] px-4 py-2 text-white font-medium hover:bg-[#2b3463] transition"
            >
              ← Back
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

