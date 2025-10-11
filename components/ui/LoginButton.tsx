/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/ui/LoginButton.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      11-10-2025
* Version:   1.0
* Purpose:   A reusable login button.
*            Directs users with existing session directly to dashboard.
* Revisions:
* v1.0 - 11-10-2025 - Initial implementation
*******************************************************/

'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/lib/dashboardRedirect';

export default function LoginButton() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // While session is loading, render nothing or skeleton
    if (status === 'loading') {
        return <button disabled className="mt-3 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40">Loading...</button>;
    }

    // When user IS logged in
    if (session?.user) {
        const name = session.user.name || 'User';
        return (
            <div className="flex flex-col items-center">
                <button
                    onClick={() => router.push(getDashboardPath(session.user.role))}
                    className="mt-3 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40"
                >
                    Log in as {name}
                </button>
                <button
                    onClick={async () => {
                        await signOut({ redirect: false });
                        router.refresh(); // Refresh the home page to update UI
                    }}
                    className="mt-1 text-sm text-gray-500 hover:underline"
                >
                    Change user
                </button>
            </div>
        );
    }

    // When user is NOT logged in
    return (
        <a href='/login'
            className="mt-3 inline-block rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40"
        >
            Log in
        </a>
    );
}
