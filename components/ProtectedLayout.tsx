/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/ProtectedLayout.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   A wrapper component for all pages that require authentication.
*            Redirect unauthenticated/expired session users to login.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
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
