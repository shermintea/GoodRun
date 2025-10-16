/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      dashboard/profile/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      17-10-2025
* Version:   3.3
* Purpose:   Centered Profile Page
*            - Profile card centered on screen
*            - Logout button below card
*******************************************************/

"use client";

import { useState } from "react";
import Image from "next/image";
import LogoutButton from "@/components/ui/LogoutButton";
import EditProfileForm from "@/app/dashboard/profile/editProfileForm";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { Profile } from "@/types/profile";

export default function ProfilePage() {
  const { profile, loading, error, setProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (loading)
    return <p className="py-24 text-center text-neutral-500">Loading profile…</p>;
  if (error || !profile)
    return (
      <p className="py-24 text-center text-red-500">
        {error || "Profile not found"}
      </p>
    );

  const handleSave = async (updated: Profile) => {
    setIsEditing(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          phone_no: updated.phone_no,
          birthday: updated.birthday,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const saved = await res.json();
      if (saved.icon && typeof saved.icon === "object") saved.icon = null;
      setProfile(saved);
    } catch (err: any) {
      console.error(err);
      alert("Error saving profile: " + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-4 py-10">
      {/* Profile Card */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#11183A] text-white overflow-visible shadow-lg">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="h-24 w-24 md:h-28 md:w-28 rounded-full ring-4 ring-white shadow-lg">
            <Image
              src="/default-avatar.png"
              alt="Profile photo"
              width={120}
              height={120}
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>

        <div className="px-6 pt-20 pb-8 md:px-8 md:pt-24 text-center">
          <h1 className="text-xl md:text-2xl font-semibold mb-6">
            {profile.role}
          </h1>

          <div className="space-y-4 text-sm md:text-base text-left">
            <InfoRow label="Name" value={profile.name} />
            <InfoRow label="Birthday" value={profile.birthday || "-"} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Phone" value={profile.phone_no || "—"} />
            <InfoRow
              label="Total pickups finished"
              value={String(profile.pickups_finished ?? 0)}
            />
          </div>

          {!isEditing && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
              >
                Edit profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Below Card */}
      {isEditing && (
        <div className="w-full max-w-lg mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-3 text-base md:text-lg font-extrabold tracking-wide">
            EDIT PROFILE
          </div>
          <EditProfileForm
            profile={profile}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-8">
        <LogoutButton />
      </div>
    </main>
  );
}

/* ---------------- Small Components ---------------- */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-semibold text-white">{label}</div>
      <div className="text-neutral-300 break-words">{value}</div>
    </div>
  );
}
