/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/PublicLayout.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   a wrapper component centralizing session redirect logic 
*            for public pages (e.g. login, register).
*            Redirect logged-in users to dashboard when visiting login page.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
*******************************************************/

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated") router.replace("/dashboard");
    }, [status, router]);

    if (status === "loading" || status === "authenticated") {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }

    return <>{children}</>;
}
