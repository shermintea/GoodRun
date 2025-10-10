/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/MedicalPantryHeader.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   Header component with Medical Pantry Logo.
*            Leads to home page on click, redirects to dashboard
*            if session exists.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
*******************************************************/

"use client";

import Image from "next/image";
import Link from "next/link";

export default function MedicalPantryHeader() {

    return (
        <header className="bg-[#171e3a] text-white">
            <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="/mpLogo.png"
                        alt="Medical Pantry logo"
                        width={85}
                        height={85}
                        className="rounded-md"
                    />
                    <span className="text-3xl font-semibold tracking-tight">
                        Medical Pantry
                    </span>
                </Link>
            </div>
        </header>
    );
}
