/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      components/LogoutButton.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   A reusable logout button.
*            Brings user back to home page and ends existing session.
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
*******************************************************/

'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await signOut({ redirect: false }) // don't auto-redirect
        router.push('/') // manually go back to home
    }

    return (
        <button
            onClick={handleLogout}
            className="rounded-full bg-red px-4 py-2 text-white font-medium hover:bg-red transition"
        >
            Logout
        </button>
    )
}
