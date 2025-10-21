/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/hooks/useUserProfile.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      21-10-2025
* Version:   1.2
* Purpose:   Fetches and flattens the current user's profile
*            from /api/profile, combining { user, metrics }
*            into a single object for the UI.
* Revisions:
* v1.2 - Flattened API response shape to match /api/profile
*        which returns { user, metrics }
*******************************************************/

import { useState, useEffect } from "react";
import type { Profile } from "@/types/profile";

type ApiResponse = {
  user: {
    id: number;
    name: string | null;
    email: string | null;
    role: string | null;
    phone_no: string | null;
    birthday: string | null;
  };
  metrics?: {
    pickups_finished?: number;
  };
};

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { credentials: "include" });
      const data: ApiResponse | { error?: string } = await res.json();

      if (!res.ok) throw new Error((data as any)?.error || "Failed to load profile");

      // Flatten user + metrics → profile
      const u = (data as ApiResponse).user;
      const pickups = (data as ApiResponse).metrics?.pickups_finished ?? 0;

      const birthday = u.birthday ? String(u.birthday).split("T")[0] : null;

      setProfile({
        ...u,
        birthday,
        pickups_finished: pickups,
      } as Profile);

      setError(null);
    } catch (err: any) {
      console.error("useUserProfile error:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { profile, loading, error, refresh, setProfile };
}

