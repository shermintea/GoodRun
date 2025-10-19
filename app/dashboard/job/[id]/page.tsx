/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/job/[id]/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      17-10-2025
* Version:   1.2
* Purpose:   Dynamic route for displaying a single job.
*            - Server Component (no "use client")
*            - Unwraps params Promise (Next.js 15+)
*            - Passes job ID to Client Component jobDetail.tsx
*******************************************************/

import JobDetail from "./jobDetail";

// ✅ Server Component (do NOT add "use client")
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 passes params as a Promise, so unwrap it:
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gray-50 w-full">
      {/* JobDetail is a client component that renders the actual UI */}
      <JobDetail id={id} />
    </main>
  );
}
