/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/GoodRunHeaderWhite.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      11-10-2025
* Version:   2.0
* Purpose:   Header component with Good Run Logo.
*            Leads to dashboard on click, redirects to login
*            if session expired.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
* v2.0 - 11-10-2025 - Simplified with components
*******************************************************/

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getDashboardPath } from "@/lib/utils/redirect";

export default function Header() {
    const { data: session } = useSession();
    const dashboardPath = getDashboardPath(session?.user.role);

    return (
        <header className="bg-white">
            <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
                {/* Left: GoodRun logo */}
                <Link href={session ? dashboardPath : "/"} className="flex items-center gap-4">
                    <Image
                        src="/grLogo-transparent.png"
                        alt="GoodRun logo"
                        width={85}
                        height={85}
                        className="rounded-md"
                        priority
                    />
                </Link>

                {/* Right: Dashboard + Profile buttons */}
                <div className="flex gap-3">
                    <a
                        href={dashboardPath}
                        className="rounded-full bg-[#11183A] px-4 py-2 text-white font-medium hover:bg-white transition"
                    >
                        Dashboard
                    </a>
                    <a
                        href="dashboard/profile"
                        className="rounded-full bg-[#11183A] px-4 py-2 text-white font-medium hover:bg-white transition"
                    >
                        Profile
                    </a>
                </div>
            </div>
        </header>
    );
}