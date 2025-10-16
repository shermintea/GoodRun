/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/admin/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      16-10-2025
* Version:   2.4
* Purpose:   Admin dashboard layout (Figma-aligned)
*            - Shared global header (Dashboard/Profile)
*            - Removed Settings quick action
*            - Profile button now links to /dashboard/profile
*            - Added link to /dashboard/admin/create-user
*******************************************************/

"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Main dashboard content */}
      <section className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Greeting + Create Request */}
        <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, Name!
          </h1>

          {/* Primary CTA */}
          <Link
            href="/dashboard/admin/create-pickup"
            className="mt-6 block rounded-2xl bg-red-700 hover:bg-red-800 text-white text-center px-6 py-10 shadow-sm transition"
          >
            <div className="text-2xl sm:text-[28px] font-extrabold leading-snug">
              Create New Pick Up <br className="hidden sm:block" />
              Request
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-center">
            <QuickAction
              label="My Profile"
              href="/dashboard/profile"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path
                    fill="currentColor"
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.239-8 5v1h16v-1c0-2.761-3.58-5-8-5Z"
                  />
                </svg>
              }
            />
            <QuickAction
              label="Completed Jobs"
              href="/dashboard/jobHistory"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                  <path
                    fill="currentColor"
                    d="M20 6h-4.586l-2-2H10.59l-2 2H4v14h16Zm-9 3h2v6h-2Zm0 8h2v2h-2Z"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Menu Section */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold tracking-tight text-center mb-5">
            Menu
          </h2>

          <div className="space-y-4">
            <MenuButton href="/dashboard/admin/create-user" variant="dark">
              Create New Users
            </MenuButton>

            <MenuButton href="/dashboard/admin/manage-users" variant="dark">
              Manage Users
            </MenuButton>

            <MenuButton href="/dashboard/availableJobs" variant="red">
              Browse Available Jobs
            </MenuButton>

            <MenuButton href="/dashboard/ongoingJobs" variant="red">
              View All Ongoing Jobs
            </MenuButton>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Small UI helpers ---------- */
function QuickAction({
  label,
  href,
  icon,
}: {
  label: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl bg-white p-4 shadow-sm border border-gray-200 hover:border-gray-300 transition"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#11183A] text-white group-hover:opacity-90">
        {icon}
      </div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
    </Link>
  );
}

function MenuButton({
  href,
  children,
  variant = "dark",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "dark" | "red";
}) {
  const cls =
    variant === "dark"
      ? "bg-[#11183A] hover:bg-[#0f152c] text-white"
      : "bg-red-700 hover:bg-red-800 text-white";
  return (
    <Link
      href={href}
      className={`block w-full text-center rounded-xl px-5 py-3 font-semibold shadow-sm transition ${cls}`}
    >
      {children}
    </Link>
  );
}
