/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      hooks/useUserProfile.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-10-2025
* Version:   1.0
* Purpose:   Fetches the user profile
* Revisions:
* v1.0 - Initial layout
*******************************************************/

import { useState, useEffect } from 'react'
import type { Profile } from '@/types/profile'

export function useUserProfile() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to load profile");
            setProfile(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    return { profile, loading, error, refresh, setProfile }
}
