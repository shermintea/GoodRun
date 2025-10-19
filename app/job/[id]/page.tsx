/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      jobDetail/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      30-09-2025
* Version:   1.0
* Purpose:   Wrapper page component that renders the JobDetail
*            component based on the route parameter ID.
* Revisions:
* v1.0 - Initial page wrapper for job details
*******************************************************/


import JobDetail from "./jobDetail";


// params.id is available here bc this is a server component
interface JobDetailPageProps {
  params: { id: string };
}

export default function JobDetailPage({ params }: JobDetailPageProps) {

  return (
    <main className="min-h-screen bg-gray-50 w-full">
      {/* Render JobDetail header full width */}
      <JobDetail id={params.id} />
    </main>
  );
}
