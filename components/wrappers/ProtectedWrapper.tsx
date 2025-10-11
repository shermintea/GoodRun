/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/wrappers/ProtectedLayout.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      11-10-2025
* Version:   2.0
* Purpose:   Centralizes authentication-based routing logic.
*            Redirect unauthenticated/expired session users to login.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
* v2.0 - 11-10-2025 - Rearranged file structure and namings
*******************************************************/

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/login");
    }, [status, router]);

    if (status === "loading" || status === "unauthenticated") {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }

    return <>{children}</>;
}
