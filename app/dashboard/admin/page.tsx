// app/dashboard/admin/page.tsx
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <section className="mb-8 rounded-xl bg-white border border-gray-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage users and jobs.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg bg-white p-6 border shadow-sm">
          <h2 className="font-semibold">Users</h2>
          <p className="mt-2 text-sm text-gray-600">Create and manage volunteers/admins.</p>
          <Link href="/adminJobDetails" className="mt-4 inline-block rounded-md bg-[#171e3a] px-4 py-2 text-white hover:bg-[#0f152c]">
            Open Admin Tools
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 border shadow-sm">
          <h2 className="font-semibold">Jobs Overview</h2>
          <p className="mt-2 text-sm text-gray-600">Track current and available jobs.</p>
          <div className="mt-4 space-x-3">
            <Link href="/ongoingJobs" className="rounded-md bg-[#171e3a] px-4 py-2 text-white hover:bg-[#0f152c]">
              Ongoing
            </Link>
            <Link href="/availableJobs" className="rounded-md bg-[#171e3a] px-4 py-2 text-white hover:bg-[#0f152c]">
              Available
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 border shadow-sm">
          <h2 className="font-semibold">Settings</h2>
          <p className="mt-2 text-sm text-gray-600">Future: org settings, permissions, etc.</p>
        </div>
      </section>
    </>
  );
}
