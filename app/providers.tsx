/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/providers.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   Wraps the Next.js app in client-side providers,
*            including NextAuth SessionProvider for access
*            to authentication session across components.
* Revisions: 
* v1.0 - Initial implementation
*******************************************************/

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
