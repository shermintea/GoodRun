/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/wrappers/ProvidersWrapper.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      11-10-2025
* Version:   2.0
* Purpose:   Enables access to client-side NextAuth SessionProvider.
* Revisions: 
* v1.0 - 10-10-2025 - Initial implementation
* v2.0 - 11-10-2025 - Rearranged file structure and namings
*******************************************************/

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
