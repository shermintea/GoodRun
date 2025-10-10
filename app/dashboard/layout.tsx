/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/layout.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   Server-side layout for all dashboard pages.
*            Adds GoodRunHeader and wraps with ProtectedLayout (client-side guard).
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
*******************************************************/

import GoodRunHeader from "@/components/GoodRunHeaderNavy";
import ProtectedLayout from "@/components/ProtectedLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout>
            <GoodRunHeader />
            <main className="min-h-screen bg-gray-50">{children}</main>
        </ProtectedLayout>
    );
}
