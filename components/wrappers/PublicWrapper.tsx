/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/wrappers/PublicWrapper.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      11-10-2025
* Version:   3.0
* Purpose:   Centralizes session redirect logic for public pages.
*            Redirect logged-in users to role dashboard when visiting login page.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
* v2.0 - 10-10-2025 - Role-based redirection
* v3.0 - 11-10-2025 - Rearranged file structure and namings
*******************************************************/

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardPath } from "@/lib/dashboardRedirect"

export default function PublicWrapper({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role) {
            const role = session.user.role;
            router.replace(getDashboardPath(role));
        }
    }, [status, session, router]);

    if (status === "loading" || status === "authenticated") {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }

    return <>{children}</>;
}
